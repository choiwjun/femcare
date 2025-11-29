import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { OverallStatus, ComparisonTrend, WarningSeverity, ImageQuality } from '@prisma/client';
import { AIAnalysisFailedException } from '../analysis/exceptions';

interface AIAnalysisRequest {
  imageUrl: string;
  userId: string;
  analysisId: string;
}

interface AIAnalysisResponse {
  overallStatus: OverallStatus;
  bloodFlowAnalysis: {
    level: number;
    text: string;
    confidence: number;
    comment: string;
    comparisonTrend?: ComparisonTrend;
    averageLevel?: number;
  };
  colorAnalysis: {
    status: OverallStatus;
    colorCode: string;
    text: string;
    r: number;
    g: number;
    b: number;
    confidence: number;
    comment: string;
  };
  aiComment: string;
  warning?: {
    title: string;
    message: string;
    severity: WarningSeverity;
    actionRequired: boolean;
    actionText?: string;
  };
  metadata: {
    modelVersion: string;
    processingTime: number;
    imageQuality: ImageQuality;
    aiRequestId: string;
  };
}

/**
 * AI 분석 서버 연동 서비스
 */
@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly aiServerUrl: string;
  private readonly timeout: number;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.aiServerUrl = this.configService.get<string>(
      'AI_SERVER_URL',
      'http://localhost:8001',
    );
    this.timeout = this.configService.get<number>('AI_REQUEST_TIMEOUT', 30000);
  }

  /**
   * AI 분석 요청
   */
  async analyzeImage(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      this.logger.log(`Requesting AI analysis for: ${request.analysisId}`);

      const response = await firstValueFrom(
        this.httpService.post<AIAnalysisResponse>(
          `${this.aiServerUrl}/api/v1/analyze`,
          {
            imageUrl: request.imageUrl,
            userId: request.userId,
            analysisId: request.analysisId,
          },
          {
            timeout: this.timeout,
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': this.configService.get<string>('AI_API_KEY', ''),
            },
          },
        ),
      );

      this.logger.log(`AI analysis completed for: ${request.analysisId}`);

      return response.data;
    } catch (error) {
      this.logger.error(
        `AI analysis failed for ${request.analysisId}: ${error.message}`,
        error.stack,
      );

      if (error.response) {
        throw new AIAnalysisFailedException(
          `AI 서버 응답 오류: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`,
        );
      } else if (error.request) {
        throw new AIAnalysisFailedException('AI 서버에 연결할 수 없습니다.');
      } else {
        throw new AIAnalysisFailedException(error.message);
      }
    }
  }

  /**
   * AI 서버 헬스 체크
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServerUrl}/health`, {
          timeout: 5000,
        }),
      );

      return response.status === 200;
    } catch (error) {
      this.logger.warn(`AI server health check failed: ${error.message}`);
      return false;
    }
  }
}
