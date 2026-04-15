import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DbModule } from '../db/db.module';
import { SecurityModule } from '../security/security.module';
import { ProfileModule } from '../profile/profile.module';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';

@Module({
  imports: [AuthModule, DbModule, SecurityModule, ProfileModule],
  controllers: [CommunityController],
  providers: [CommunityService],
})
export class CommunityModule {}
