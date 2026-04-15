import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DbModule } from '../db/db.module';
import { SecurityModule } from '../security/security.module';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [AuthModule, DbModule, SecurityModule],
  providers: [ChatGateway],
})
export class ChatModule {}
