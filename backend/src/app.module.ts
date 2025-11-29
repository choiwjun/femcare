import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

/**
 * 메인 애플리케이션 모듈
 */
@Module({
  imports: [
    // 환경 변수 설정
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 이벤트 이미터
    EventEmitterModule.forRoot(),

    // 스케줄러 (Cron Jobs)
    ScheduleModule.forRoot(),

    // Prisma ORM
    PrismaModule,

    // Feature Modules
    AnalysisModule,
  ],
  providers: [
    // 글로벌 예외 필터
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
