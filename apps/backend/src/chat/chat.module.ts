import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DbModule } from '../db/db.module';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [AuthModule, DbModule],
  providers: [ChatGateway],
})
export class ChatModule {}
