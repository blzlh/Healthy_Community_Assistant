import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdminClient } from '../supabase/supabase-admin';
import type { Database } from '../supabase/database.types';

@Injectable()
export class AuthService {
  private readonly supabase: SupabaseClient<Database>;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const anonKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!url || !anonKey) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required');
    }

    this.supabase = createClient<Database>(url, anonKey, {
      auth: { persistSession: false },
    });
  }

  // 注册用户
  async register(email: string, name?: string, isAdmin: boolean = false) {
    const { data, error } = await this.supabase.auth.signInWithOtp({
      email,
      options: {
        data: { name, isAdmin },
        shouldCreateUser: true,
      },
    });

    if (error) throw error;
    return data;
  }

  // 发送登录OTP
  async sendLoginOtp(email: string, isAdmin: boolean = false) {
    const admin = getSupabaseAdminClient() as SupabaseClient<Database> & {
      auth: {
        admin: {
          listUsers: (options?: {
            page?: number;
            perPage?: number;
          }) => Promise<{
            data: {
              users: Array<{
                id: string;
                email?: string | null;
                user_metadata?: { isAdmin?: boolean };
              }>;
            } | null;
            error: { message?: string } | null;
          }>;
        };
      };
    };
    const { data: listData, error: listError } =
      await admin.auth.admin.listUsers({ page: 1, perPage: 200 });

    if (listError) {
      throw new BadRequestException('user lookup failed');
    }

    const targetUser = listData?.users?.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );

    if (!targetUser) {
      throw new BadRequestException('user not found');
    }

    // 校验身份：管理员不能登录普通用户，普通用户不能登录管理员
    // 注册时身份存放在 user_metadata.isAdmin
    const userIsAdmin = targetUser.user_metadata?.isAdmin ?? false;
    if (userIsAdmin !== isAdmin) {
      throw new BadRequestException(
        isAdmin
          ? '该账号不是管理员账号'
          : '该账号是管理员账号，请在管理员入口登录',
      );
    }

    const { data, error } = await this.supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    if (error) throw error;
    return data;
  }

  // 登录用户
  async login(email: string, token: string, isAdmin?: boolean) {
    const { data, error } = await this.supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) throw error;

    const userId = data.user?.id;
    const metadata = data.user?.user_metadata as
      | { name?: string; isAdmin?: boolean }
      | undefined;
    const name = metadata?.name ?? null;

    // 最终校验：确保登录时的角色与注册时（metadata 中存储的）一致
    const registeredIsAdmin = metadata?.isAdmin ?? false;
    if (isAdmin !== undefined && isAdmin !== registeredIsAdmin) {
      throw new BadRequestException(
        isAdmin
          ? '该账号不是管理员账号'
          : '该账号是管理员账号，请从管理员入口登录',
      );
    }

    const finalIsAdmin = registeredIsAdmin;

    if (userId) {
      const admin = getSupabaseAdminClient();

      // 1. 查询数据库中是否已有用户记录
      const { data: profileData, error: profileFetchError } = await admin
        .from('profiles')
        .select('name, is_admin')
        .eq('user_id', userId)
        .single();

      if (profileFetchError && profileFetchError.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is fine for a new user.
        throw profileFetchError;
      }

      // 2. 如果用户已存在，不更新 is_admin 字段（保留数据库中的值）
      if (profileData) {
        // 用户已存在，只更新基本信息，保留原有的 is_admin
        const finalName = profileData.name || name?.trim() || email;
        
        const { error: profileError } = await admin
          .from('profiles')
          .update({
            email,
            name: finalName,
            // 注意：不更新 is_admin，保留数据库中的值
          })
          .eq('user_id', userId);

        if (profileError) throw profileError;
      } else {
        // 3. 如果用户不存在，创建新用户并设置默认值
        const finalName = name?.trim() || email;
        
        const { error: profileError } = await admin.from('profiles').insert({
          user_id: userId,
          email,
          name: finalName,
          is_admin: finalIsAdmin, // 只有新用户才使用注册时设置的值
        });

        if (profileError) throw profileError;
      }
    }

    return data;
  }

  // 获取用户信息
  async getUser(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token);
    if (error) throw error;
    return data.user;
  }
}
