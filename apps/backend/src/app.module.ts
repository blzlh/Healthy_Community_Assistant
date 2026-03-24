import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { CommunityModule } from './community/community.module';
import { DbModule } from './db/db.module';
import { ProfileModule } from './profile/profile.module';
import { HealthAgentModule } from './modules/health-agent/health-agent.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    AuthModule,
    ChatModule,
    CommunityModule,
    DbModule,
    ProfileModule,
    HealthAgentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
