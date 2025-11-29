import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './services/analysis.service';
import { AnalysisLogService } from './services/analysis-log.service';
import { AnalysisOwnerGuard } from './guards/analysis-owner.guard';
import { StorageModule } from '../storage/storage.module';
import { AIModule } from '../ai/ai.module';

/**
 * 분석 모듈
 */
@Module({
  imports: [StorageModule, AIModule],
  controllers: [AnalysisController],
  providers: [AnalysisService, AnalysisLogService, AnalysisOwnerGuard],
  exports: [AnalysisService, AnalysisLogService],
})
export class AnalysisModule {}
