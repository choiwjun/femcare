import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

type LogStep = 'upload' | 'blood_flow_analysis' | 'color_analysis' | 'generating_report';
type LogStatus = 'started' | 'completed' | 'failed';

/**
 * 분석 로그 서비스
 */
@Injectable()
export class AnalysisLogService {
  private readonly logger = new Logger(AnalysisLogService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 로그 기록
   */
  async log(
    analysisId: string,
    step: LogStep,
    status: LogStatus,
    message?: string,
    metadata?: any,
  ): Promise<void> {
    try {
      await this.prisma.analysisLog.create({
        data: {
          analysisId,
          step,
          status,
          message,
          metadata,
        },
      });

      this.logger.log(`[${analysisId}] ${step}: ${status}`);
    } catch (error) {
      this.logger.error(`Failed to log analysis: ${error.message}`, error.stack);
    }
  }

  /**
   * 에러 로그 기록
   */
  async logError(
    analysisId: string,
    step: LogStep,
    errorCode: string,
    errorMessage: string,
    metadata?: any,
  ): Promise<void> {
    try {
      await this.prisma.analysisLog.create({
        data: {
          analysisId,
          step,
          status: 'failed',
          errorCode,
          errorMessage,
          metadata,
        },
      });

      this.logger.error(`[${analysisId}] ${step} failed: ${errorCode} - ${errorMessage}`);
    } catch (error) {
      this.logger.error(`Failed to log error: ${error.message}`, error.stack);
    }
  }

  /**
   * 분석 로그 조회
   */
  async getLogsByAnalysisId(analysisId: string) {
    return this.prisma.analysisLog.findMany({
      where: { analysisId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
