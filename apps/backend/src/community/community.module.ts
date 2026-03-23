import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DbModule } from '../db/db.module';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';

@Module({
  imports: [AuthModule, DbModule],
  controllers: [CommunityController],
  providers: [CommunityService],
})
export class CommunityModule {}
