import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { S3Service } from '../../storage/s3.service';
import { AIService } from '../../ai/ai.service';
import { AnalysisLogService } from './analysis-log.service';
import {
  AnalysisNotFoundException,
  SubscriptionLimitException,
} from '../exceptions';
import {
  UploadAnalysisDto,
  AnalysisResponseDto,
  AnalysisHistoryQueryDto,
} from '../dto';
import { AnalysisStatus, SubscriptionTier } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';

/**
 * 분석 서비스 (메인 비즈니스 로직)
 */
@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
    private aiService: AIService,
    private logService: AnalysisLogService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * 이미지 업로드 및 분석 시작
   */
  async uploadAndAnalyze(
    userId: string,
    file: Express.Multer.File,
    dto: UploadAnalysisDto,
  ): Promise<AnalysisResponseDto> {
    // 1. 구독 한도 체크
    await this.checkSubscriptionLimit(userId);

    // 2. 이미지 업로드
    await this.logService.log(uuidv4(), 'upload', 'started', 'Starting image upload');
    const uploadResult = await this.s3Service.uploadImage(file, userId);

    // 3. 분석 레코드 생성
    const analysis = await this.prisma.analysis.create({
      data: {
        userId,
        imageUrl: uploadResult.imageUrl,
        thumbnailUrl: uploadResult.thumbnailUrl,
        imageKey: uploadResult.imageKey,
        imageSize: uploadResult.imageSize,
        analysisDate: new Date(dto.analysisDate),
        status: AnalysisStatus.PROCESSING,
        notes: dto.notes,
        symptoms: dto.symptoms || [],
      },
    });

    await this.logService.log(analysis.id, 'upload', 'completed', 'Image uploaded successfully');

    // 4. AI 분석 시작 (비동기)
    this.processAIAnalysis(analysis.id, uploadResult.imageUrl, userId).catch((error) => {
      this.logger.error(`AI analysis failed for ${analysis.id}: ${error.message}`, error.stack);
    });

    // 5. 월별 분석 횟수 증가
    await this.incrementMonthlyAnalysisCount(userId);

    // 6. 이벤트 발행
    this.eventEmitter.emit('analysis.created', { analysisId: analysis.id, userId });

    return this.mapToResponseDto(analysis);
  }

  /**
   * AI 분석 처리 (비동기)
   */
  private async processAIAnalysis(
    analysisId: string,
    imageUrl: string,
    userId: string,
  ): Promise<void> {
    try {
      await this.logService.log(
        analysisId,
        'blood_flow_analysis',
        'started',
        'Starting AI analysis',
      );

      // AI 서버 호출
      const aiResult = await this.aiService.analyzeImage({
        imageUrl,
        userId,
        analysisId,
      });

      await this.logService.log(
        analysisId,
        'color_analysis',
        'completed',
        'AI analysis completed',
      );

      // 분석 결과 업데이트
      await this.prisma.analysis.update({
        where: { id: analysisId },
        data: {
          status: AnalysisStatus.COMPLETED,
          overallStatus: aiResult.overallStatus,

          // 출혈량 분석
          bloodFlowLevel: aiResult.bloodFlowAnalysis.level,
          bloodFlowText: aiResult.bloodFlowAnalysis.text,
          bloodFlowConfidence: aiResult.bloodFlowAnalysis.confidence,
          bloodFlowComment: aiResult.bloodFlowAnalysis.comment,
          comparisonTrend: aiResult.bloodFlowAnalysis.comparisonTrend,
          averageLevel: aiResult.bloodFlowAnalysis.averageLevel,

          // 색상 분석
          colorStatus: aiResult.colorAnalysis.status,
          colorCode: aiResult.colorAnalysis.colorCode,
          colorText: aiResult.colorAnalysis.text,
          colorConfidence: aiResult.colorAnalysis.confidence,
          colorComment: aiResult.colorAnalysis.comment,
          colorR: aiResult.colorAnalysis.r,
          colorG: aiResult.colorAnalysis.g,
          colorB: aiResult.colorAnalysis.b,

          // AI 코멘트
          aiComment: aiResult.aiComment,

          // 경고
          warningTitle: aiResult.warning?.title,
          warningMessage: aiResult.warning?.message,
          warningSeverity: aiResult.warning?.severity,
          warningActionRequired: aiResult.warning?.actionRequired || false,
          warningActionText: aiResult.warning?.actionText,

          // 메타데이터
          modelVersion: aiResult.metadata.modelVersion,
          processingTime: aiResult.metadata.processingTime,
          imageQuality: aiResult.metadata.imageQuality,
          aiRequestId: aiResult.metadata.aiRequestId,
          aiResponseRaw: aiResult as any,
        },
      });

      await this.logService.log(
        analysisId,
        'generating_report',
        'completed',
        'Analysis report generated',
      );

      // 이벤트 발행
      this.eventEmitter.emit('analysis.completed', { analysisId, userId });
    } catch (error) {
      await this.logService.logError(
        analysisId,
        'blood_flow_analysis',
        'AI_ANALYSIS_ERROR',
        error.message,
      );

      await this.prisma.analysis.update({
        where: { id: analysisId },
        data: { status: AnalysisStatus.FAILED },
      });

      // 이벤트 발행
      this.eventEmitter.emit('analysis.failed', { analysisId, userId, error: error.message });
    }
  }

  /**
   * 분석 결과 조회
   */
  async getAnalysisById(userId: string, analysisId: string): Promise<AnalysisResponseDto> {
    const analysis = await this.prisma.analysis.findFirst({
      where: {
        id: analysisId,
        userId,
        deletedAt: null,
      },
    });

    if (!analysis) {
      throw new AnalysisNotFoundException(analysisId);
    }

    return this.mapToResponseDto(analysis);
  }

  /**
   * 분석 히스토리 조회
   */
  async getAnalysisHistory(userId: string, query: AnalysisHistoryQueryDto) {
    const { page = 1, limit = 20, startDate, endDate, overallStatus, status, savedOnly } = query;

    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      deletedAt: null,
    };

    if (startDate || endDate) {
      where.analysisDate = {};
      if (startDate) where.analysisDate.gte = new Date(startDate);
      if (endDate) where.analysisDate.lte = new Date(endDate);
    }

    if (overallStatus) where.overallStatus = overallStatus;
    if (status) where.status = status;
    if (savedOnly) where.saved = true;

    const [items, total] = await Promise.all([
      this.prisma.analysis.findMany({
        where,
        skip,
        take: limit,
        orderBy: { analysisDate: 'desc' },
      }),
      this.prisma.analysis.count({ where }),
    ]);

    return {
      items: items.map((item) => this.mapToResponseDto(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 분석 결과 삭제 (소프트 삭제)
   */
  async deleteAnalysis(userId: string, analysisId: string): Promise<void> {
    const analysis = await this.prisma.analysis.findFirst({
      where: {
        id: analysisId,
        userId,
        deletedAt: null,
      },
    });

    if (!analysis) {
      throw new AnalysisNotFoundException(analysisId);
    }

    await this.prisma.analysis.update({
      where: { id: analysisId },
      data: { deletedAt: new Date() },
    });

    // S3에서 이미지 삭제 (비동기)
    this.s3Service.deleteImage(analysis.imageKey).catch((error) => {
      this.logger.error(`Failed to delete S3 image: ${error.message}`);
    });

    this.eventEmitter.emit('analysis.deleted', { analysisId, userId });
  }

  /**
   * 분석 결과 저장
   */
  async saveAnalysis(userId: string, analysisId: string): Promise<void> {
    const analysis = await this.prisma.analysis.findFirst({
      where: {
        id: analysisId,
        userId,
        deletedAt: null,
      },
    });

    if (!analysis) {
      throw new AnalysisNotFoundException(analysisId);
    }

    await this.prisma.$transaction([
      this.prisma.analysis.update({
        where: { id: analysisId },
        data: {
          saved: true,
          savedAt: new Date(),
        },
      }),
      this.prisma.healthRecord.create({
        data: {
          userId,
          analysisId,
          recordDate: analysis.analysisDate,
        },
      }),
    ]);

    this.eventEmitter.emit('analysis.saved', { analysisId, userId });
  }

  /**
   * 공유 토큰 생성
   */
  async createShareToken(userId: string, analysisId: string): Promise<string> {
    const analysis = await this.prisma.analysis.findFirst({
      where: {
        id: analysisId,
        userId,
        deletedAt: null,
      },
    });

    if (!analysis) {
      throw new AnalysisNotFoundException(analysisId);
    }

    const shareToken = uuidv4();
    const shareExpiresAt = new Date();
    shareExpiresAt.setDate(shareExpiresAt.getDate() + 7); // 7일 후 만료

    await this.prisma.analysis.update({
      where: { id: analysisId },
      data: {
        shareToken,
        shareExpiresAt,
      },
    });

    return shareToken;
  }

  /**
   * 구독 한도 체크
   */
  private async checkSubscriptionLimit(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionTier: true,
        monthlyAnalysisCount: true,
        lastAnalysisResetDate: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // PREMIUM은 무제한
    if (user.subscriptionTier === SubscriptionTier.PREMIUM) {
      return;
    }

    // FREE는 3회/월
    const maxCount = 3;
    if (user.monthlyAnalysisCount >= maxCount) {
      throw new SubscriptionLimitException(user.monthlyAnalysisCount, maxCount);
    }
  }

  /**
   * 월별 분석 횟수 증가
   */
  private async incrementMonthlyAnalysisCount(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        monthlyAnalysisCount: { increment: 1 },
      },
    });
  }

  /**
   * Analysis 엔티티를 DTO로 변환
   */
  private mapToResponseDto(analysis: any): AnalysisResponseDto {
    return {
      id: analysis.id,
      userId: analysis.userId,
      imageUrl: analysis.imageUrl,
      thumbnailUrl: analysis.thumbnailUrl,
      analysisDate: analysis.analysisDate,
      status: analysis.status,
      overallStatus: analysis.overallStatus,
      bloodFlowAnalysis: analysis.bloodFlowLevel
        ? {
            level: analysis.bloodFlowLevel,
            text: analysis.bloodFlowText,
            confidence: analysis.bloodFlowConfidence,
            comment: analysis.bloodFlowComment,
            comparisonTrend: analysis.comparisonTrend,
            averageLevel: analysis.averageLevel,
          }
        : undefined,
      colorAnalysis: analysis.colorCode
        ? {
            status: analysis.colorStatus,
            colorCode: analysis.colorCode,
            text: analysis.colorText,
            rgb: {
              r: analysis.colorR,
              g: analysis.colorG,
              b: analysis.colorB,
            },
            confidence: analysis.colorConfidence,
            comment: analysis.colorComment,
          }
        : undefined,
      aiComment: analysis.aiComment,
      warning: analysis.warningTitle
        ? {
            title: analysis.warningTitle,
            message: analysis.warningMessage,
            severity: analysis.warningSeverity,
            actionRequired: analysis.warningActionRequired,
            actionText: analysis.warningActionText,
          }
        : undefined,
      metadata: analysis.modelVersion
        ? {
            modelVersion: analysis.modelVersion,
            processingTime: analysis.processingTime,
            imageQuality: analysis.imageQuality,
            imageSize: analysis.imageSize,
            aiRequestId: analysis.aiRequestId,
          }
        : undefined,
      notes: analysis.notes,
      symptoms: analysis.symptoms,
      saved: analysis.saved,
      createdAt: analysis.createdAt,
      updatedAt: analysis.updatedAt,
    };
  }
}
