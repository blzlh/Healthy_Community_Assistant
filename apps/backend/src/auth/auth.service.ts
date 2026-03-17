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
  async register(email: string, name?: string) {
    const { data, error } = await this.supabase.auth.signInWithOtp({
      email,
      options: name
        ? { data: { name }, shouldCreateUser: true }
        : { shouldCreateUser: true },
    });

    if (error) throw error;
    return data;
  }

  // 发送登录OTP
  async sendLoginOtp(email: string) {
    const admin = getSupabaseAdminClient() as SupabaseClient<Database> & {
      auth: {
        admin: {
          listUsers: (options?: {
            page?: number;
            perPage?: number;
          }) => Promise<{
            data: {
              users: Array<{ id: string; email?: string | null }>;
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

    const exists =
      listData?.users?.some(
        (user) => user.email?.toLowerCase() === email.toLowerCase(),
      ) ?? false;
    if (!exists) {
      throw new BadRequestException('user not found');
    }

    const { data, error } = await this.supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    if (error) throw error;
    return data;
  }

  // 登录用户
  async login(email: string, token: string) {
    const { data, error } = await this.supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) throw error;

    const userId = data.user?.id;
    const name =
      (data.user?.user_metadata as { name?: string } | undefined)?.name ?? null;
    if (userId && name) {
      const admin = getSupabaseAdminClient();
      const { error: profileError } = await admin.from('profiles').upsert(
        {
          user_id: userId,
          name,
        },
        { onConflict: 'user_id' },
      );

      if (profileError) throw profileError;
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
