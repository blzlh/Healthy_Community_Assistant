import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';

function toHttpException(error: unknown) {
  const status =
    typeof (error as { status?: unknown })?.status === 'number'
      ? ((error as { status: number }).status ?? 500)
      : 500;

  const message =
    typeof (error as { message?: unknown })?.message === 'string'
      ? (error as { message: string }).message
      : 'Internal server error';

  return new HttpException({ message }, status);
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 注册
  @Post('register')
  async register(
    @Body()
    body: {
      email?: string;
      name?: string;
      flow?: 'register' | 'login';
    },
  ) {
    const email = body.email?.trim();
    const name = body.name?.trim();
    const flow = body.flow ?? 'register';

    if (!email) {
      throw new BadRequestException('email is required');
    }

    try {
      const data =
        flow === 'login'
          ? await this.authService.sendLoginOtp(email)
          : await this.authService.register(email, name);
      return { user: data.user, session: data.session };
    } catch (error) {
      throw toHttpException(error);
    }
  }

  // 登录
  @Post('login')
  async login(
    @Body()
    body: {
      email?: string;
      code?: string;
    },
  ) {
    const email = body.email?.trim();
    const code = body.code?.trim() ?? '';

    if (!email || !code) {
      throw new BadRequestException('email and code are required');
    }

    try {
      const data = await this.authService.login(email, code);
      return { user: data.user, session: data.session };
    } catch (error) {
      throw toHttpException(error);
    }
  }

  // 获取当前用户信息
  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  me(
    @Req()
    request: {
      user?: unknown;
    },
  ) {
    return { user: request.user };
  }
}
