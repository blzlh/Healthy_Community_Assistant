import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
    }>();
    const rawHeader =
      request.headers.authorization ?? request.headers.Authorization ?? '';
    const authHeader = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const user = await this.authService.getUser(token);
    (request as unknown as { user: typeof user }).user = user;
    return true;
  }
}
