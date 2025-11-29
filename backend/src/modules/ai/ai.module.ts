import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AIService } from './ai.service';

/**
 * AI 서비스 모듈
 */
@Module({
  imports: [HttpModule],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}
