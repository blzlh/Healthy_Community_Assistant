import { Module, forwardRef } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { SecurityModule } from '../security/security.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [DbModule, forwardRef(() => SecurityModule)],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
