# FemCare AI 분석 기능 - 백엔드 개발 명세서

## 목차
1. [API 목록 및 설계](#1-api-목록-및-설계)
2. [Request/Response DTO](#2-requestresponse-dto)
3. [DB Schema](#3-db-schema)
4. [Service Layer 로직](#4-service-layer-로직)
5. [Error Handling](#5-error-handling)
6. [인증/인가 규칙](#6-인증인가-규칙)
7. [정기결제 Billing 처리](#7-정기결제-billing-처리)
8. [AI 서버 연동 규칙](#8-ai-서버-연동-규칙)
9. [로그 및 이벤트 기록](#9-로그-및-이벤트-기록)
10. [데이터 정합성 규칙](#10-데이터-정합성-규칙)

---

## 1. API 목록 및 설계

### 1.1 API 엔드포인트 목록

| Method | Endpoint | Description | Auth | Subscription |
|--------|----------|-------------|------|--------------|
| POST | `/api/v1/analysis/upload` | 이미지 업로드 및 분석 시작 | ✅ | ✅ |
| GET | `/api/v1/analysis/:id` | 분석 결과 조회 | ✅ | ❌ |
| GET | `/api/v1/analysis/status/:id` | 분석 진행 상태 조회 | ✅ | ❌ |
| POST | `/api/v1/analysis/:id/save` | 분석 결과 기록 저장 | ✅ | ❌ |
| GET | `/api/v1/analysis/history` | 분석 기록 목록 조회 | ✅ | ❌ |
| GET | `/api/v1/analysis/:id/detail` | 상세 분석 결과 조회 | ✅ | ❌ |
| DELETE | `/api/v1/analysis/:id` | 분석 결과 삭제 | ✅ | ❌ |
| POST | `/api/v1/analysis/:id/share` | 분석 결과 공유 링크 생성 | ✅ | ❌ |

### 1.2 API 상세 설계

#### 1.2.1 이미지 업로드 및 분석 시작

```typescript
/**
 * POST /api/v1/analysis/upload
 *
 * Description:
 * - 월경 혈액 이미지를 업로드하고 AI 분석을 시작합니다
 * - 구독 상태를 확인하여 무료/유료 분석 횟수를 차감합니다
 * - S3에 이미지를 업로드하고 AI 서버에 분석 요청을 전송합니다
 *
 * Auth: Required (Bearer Token)
 * Subscription: Required (Free 3회/월, Premium 무제한)
 */

// Request
Headers: {
  Authorization: "Bearer {accessToken}",
  Content-Type: "multipart/form-data"
}

Body: {
  image: File, // 이미지 파일 (max 10MB)
  date: string, // ISO 8601 날짜
  notes?: string, // 추가 메모
  symptoms?: string[] // 증상 태그
}

// Response
Status: 201 Created
Body: {
  success: true,
  data: {
    analysisId: "uuid",
    status: "processing", // processing | completed | failed
    estimatedTime: 15, // 초
    createdAt: "2025-11-28T15:24:00Z"
  }
}
```

#### 1.2.2 분석 결과 조회

```typescript
/**
 * GET /api/v1/analysis/:id
 *
 * Description:
 * - 완료된 분석 결과를 조회합니다
 * - 본인의 분석 결과만 조회 가능합니다
 */

// Request
Headers: {
  Authorization: "Bearer {accessToken}"
}

// Response
Status: 200 OK
Body: {
  success: true,
  data: {
    id: "uuid",
    userId: "uuid",
    timestamp: "2025-11-28T15:24:00Z",
    imageUrl: "https://s3.amazonaws.com/...",
    status: "completed",

    // 전체 상태
    overallStatus: "normal" | "caution" | "warning",

    // 출혈량 분석
    bloodFlow: {
      level: 3, // 1-5
      text: "보통",
      confidence: 0.95,
      comment: "이번 주기 평균과 비슷해요",
      comparisonTrend: "similar" | "higher" | "lower",
      averageLevel: 2.8 // 사용자 평균
    },

    // 색상 분석
    color: {
      status: "normal" | "caution" | "warning",
      colorCode: "#8C4A4A",
      text: "정상 범위",
      confidence: 0.92,
      comment: "건강한 색상입니다",
      rgbValues: {
        r: 140,
        g: 74,
        b: 74
      }
    },

    // AI 코멘트
    aiComment: "정상적인 월경 상태입니다. 규칙적인 주기를 유지하고 있어요.",

    // 경고 (조건부)
    warning: {
      title: "확인이 필요해요",
      message: "출혈량이 평소보다 많습니다. 전문가 상담을 권장합니다.",
      severity: "caution" | "warning",
      actionRequired: true,
      actionText: "상담 예약하기"
    } | null,

    // 메타데이터
    metadata: {
      modelVersion: "v2.1.0",
      processingTime: 12.5, // 초
      imageQuality: "good" | "fair" | "poor"
    }
  }
}
```

#### 1.2.3 분석 진행 상태 조회

```typescript
/**
 * GET /api/v1/analysis/status/:id
 *
 * Description:
 * - 분석 진행 상태를 폴링으로 조회합니다
 * - WebSocket 대신 HTTP 폴링 방식 사용 (2초마다)
 */

// Response
Status: 200 OK
Body: {
  success: true,
  data: {
    analysisId: "uuid",
    status: "processing" | "completed" | "failed",
    progress: 75, // 0-100
    currentStep: "color_analysis", // upload | blood_flow_analysis | color_analysis | generating_report
    estimatedTimeRemaining: 5 // 초
  }
}
```

#### 1.2.4 분석 기록 목록 조회

```typescript
/**
 * GET /api/v1/analysis/history
 *
 * Description:
 * - 사용자의 분석 기록 목록을 조회합니다
 * - 페이지네이션 지원
 */

// Request
Query: {
  page: number = 1,
  limit: number = 20,
  startDate?: string, // ISO 8601
  endDate?: string,
  status?: "normal" | "caution" | "warning"
}

// Response
Status: 200 OK
Body: {
  success: true,
  data: {
    items: [
      {
        id: "uuid",
        timestamp: "2025-11-28T15:24:00Z",
        overallStatus: "normal",
        bloodFlowLevel: 3,
        colorStatus: "normal",
        thumbnailUrl: "https://...",
        saved: true
      }
    ],
    pagination: {
      total: 45,
      page: 1,
      limit: 20,
      totalPages: 3
    }
  }
}
```

---

## 2. Request/Response DTO

### 2.1 NestJS DTO 정의

```typescript
// src/modules/analysis/dto/upload-analysis.dto.ts

import { IsString, IsOptional, IsArray, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UploadAnalysisDto {
  @ApiProperty({
    description: '이미지 파일',
    type: 'string',
    format: 'binary',
  })
  image: Express.Multer.File;

  @ApiProperty({
    description: '분석 날짜 (ISO 8601)',
    example: '2025-11-28T15:24:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional({
    description: '추가 메모',
    example: '오늘 컨디션이 좋았어요',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: '증상 태그',
    example: ['생리통', '가벼움'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  symptoms?: string[];
}
```

```typescript
// src/modules/analysis/dto/analysis-response.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BloodFlowAnalysisDto {
  @ApiProperty({ description: '출혈량 레벨 (1-5)', example: 3 })
  level: number;

  @ApiProperty({ description: '출혈량 텍스트', example: '보통' })
  text: string;

  @ApiProperty({ description: '신뢰도 (0-1)', example: 0.95 })
  confidence: number;

  @ApiProperty({ description: '코멘트', example: '이번 주기 평균과 비슷해요' })
  comment: string;

  @ApiProperty({
    description: '비교 트렌드',
    enum: ['similar', 'higher', 'lower'],
    example: 'similar'
  })
  comparisonTrend: 'similar' | 'higher' | 'lower';

  @ApiProperty({ description: '사용자 평균 레벨', example: 2.8 })
  averageLevel: number;
}

export class ColorAnalysisDto {
  @ApiProperty({
    description: '색상 상태',
    enum: ['normal', 'caution', 'warning'],
    example: 'normal'
  })
  status: 'normal' | 'caution' | 'warning';

  @ApiProperty({ description: '색상 코드 (HEX)', example: '#8C4A4A' })
  colorCode: string;

  @ApiProperty({ description: '색상 텍스트', example: '정상 범위' })
  text: string;

  @ApiProperty({ description: '신뢰도 (0-1)', example: 0.92 })
  confidence: number;

  @ApiProperty({ description: '코멘트', example: '건강한 색상입니다' })
  comment: string;

  @ApiProperty({
    description: 'RGB 값',
    example: { r: 140, g: 74, b: 74 }
  })
  rgbValues: {
    r: number;
    g: number;
    b: number;
  };
}

export class WarningDto {
  @ApiProperty({ description: '경고 제목', example: '확인이 필요해요' })
  title: string;

  @ApiProperty({
    description: '경고 메시지',
    example: '출혈량이 평소보다 많습니다. 전문가 상담을 권장합니다.'
  })
  message: string;

  @ApiProperty({
    description: '심각도',
    enum: ['caution', 'warning'],
    example: 'caution'
  })
  severity: 'caution' | 'warning';

  @ApiProperty({ description: '액션 필요 여부', example: true })
  actionRequired: boolean;

  @ApiPropertyOptional({ description: '액션 텍스트', example: '상담 예약하기' })
  actionText?: string;
}

export class AnalysisMetadataDto {
  @ApiProperty({ description: 'AI 모델 버전', example: 'v2.1.0' })
  modelVersion: string;

  @ApiProperty({ description: '처리 시간 (초)', example: 12.5 })
  processingTime: number;

  @ApiProperty({
    description: '이미지 품질',
    enum: ['good', 'fair', 'poor'],
    example: 'good'
  })
  imageQuality: 'good' | 'fair' | 'poor';
}

export class AnalysisResultDto {
  @ApiProperty({ description: '분석 ID' })
  id: string;

  @ApiProperty({ description: '사용자 ID' })
  userId: string;

  @ApiProperty({ description: '타임스탬프' })
  timestamp: string;

  @ApiProperty({ description: '이미지 URL' })
  imageUrl: string;

  @ApiProperty({ description: '처리 상태' })
  status: 'processing' | 'completed' | 'failed';

  @ApiProperty({
    description: '전체 상태',
    enum: ['normal', 'caution', 'warning']
  })
  overallStatus: 'normal' | 'caution' | 'warning';

  @ApiProperty({ description: '출혈량 분석' })
  bloodFlow: BloodFlowAnalysisDto;

  @ApiProperty({ description: '색상 분석' })
  color: ColorAnalysisDto;

  @ApiProperty({ description: 'AI 코멘트' })
  aiComment: string;

  @ApiPropertyOptional({ description: '경고 정보' })
  warning: WarningDto | null;

  @ApiProperty({ description: '메타데이터' })
  metadata: AnalysisMetadataDto;
}
```

### 2.2 Query DTO

```typescript
// src/modules/analysis/dto/analysis-history-query.dto.ts

import { IsInt, IsOptional, Min, Max, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AnalysisHistoryQueryDto {
  @ApiPropertyOptional({ description: '페이지 번호', default: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: '페이지 크기', default: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ description: '시작 날짜 (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: '종료 날짜 (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: '상태 필터',
    enum: ['normal', 'caution', 'warning']
  })
  @IsEnum(['normal', 'caution', 'warning'])
  @IsOptional()
  status?: 'normal' | 'caution' | 'warning';
}
```

---

## 3. DB Schema

### 3.1 PostgreSQL Schema (Prisma)

```prisma
// prisma/schema.prisma

model User {
  id                String     @id @default(uuid())
  email             String     @unique
  passwordHash      String
  name              String
  profileImageUrl   String?

  // 구독 정보
  subscriptionTier  SubscriptionTier  @default(FREE)
  subscriptionEndDate DateTime?

  // 분석 횟수
  monthlyAnalysisCount Int @default(0)
  lastAnalysisResetDate DateTime @default(now())

  // Relationships
  analyses          Analysis[]
  healthRecords     HealthRecord[]

  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt
  deletedAt         DateTime?

  @@index([email])
  @@map("users")
}

enum SubscriptionTier {
  FREE      // 3회/월
  PREMIUM   // 무제한
}

model Analysis {
  id                String     @id @default(uuid())
  userId            String
  user              User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  // 이미지 정보
  imageUrl          String
  thumbnailUrl      String
  imageKey          String     // S3 key
  imageSize         Int        // bytes

  // 분석 날짜
  analysisDate      DateTime

  // 처리 상태
  status            AnalysisStatus @default(PROCESSING)

  // 전체 상태
  overallStatus     OverallStatus?

  // 출혈량 분석
  bloodFlowLevel    Int?       // 1-5
  bloodFlowText     String?
  bloodFlowConfidence Float?
  bloodFlowComment  String?
  comparisonTrend   ComparisonTrend?
  averageLevel      Float?

  // 색상 분석
  colorStatus       OverallStatus?
  colorCode         String?
  colorText         String?
  colorConfidence   Float?
  colorComment      String?
  colorR            Int?
  colorG            Int?
  colorB            Int?

  // AI 코멘트
  aiComment         String?

  // 경고
  warningTitle      String?
  warningMessage    String?
  warningSeverity   WarningSeverity?
  warningActionRequired Boolean @default(false)
  warningActionText String?

  // 메타데이터
  modelVersion      String?
  processingTime    Float?     // seconds
  imageQuality      ImageQuality?

  // AI 서버 정보
  aiRequestId       String?
  aiResponseRaw     Json?

  // 추가 정보
  notes             String?
  symptoms          String[]   @default([])

  // 저장 여부
  saved             Boolean    @default(false)
  savedAt           DateTime?

  // 공유
  shareToken        String?    @unique
  shareExpiresAt    DateTime?

  // Relationships
  healthRecord      HealthRecord?

  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt
  deletedAt         DateTime?

  @@index([userId, createdAt])
  @@index([userId, status])
  @@index([userId, overallStatus])
  @@index([shareToken])
  @@map("analyses")
}

enum AnalysisStatus {
  PROCESSING
  COMPLETED
  FAILED
}

enum OverallStatus {
  NORMAL
  CAUTION
  WARNING
}

enum ComparisonTrend {
  SIMILAR
  HIGHER
  LOWER
}

enum WarningSeverity {
  CAUTION
  WARNING
}

enum ImageQuality {
  GOOD
  FAIR
  POOR
}

model HealthRecord {
  id                String     @id @default(uuid())
  userId            String
  user              User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  analysisId        String     @unique
  analysis          Analysis   @relation(fields: [analysisId], references: [id], onDelete: Cascade)

  recordDate        DateTime
  notes             String?
  tags              String[]   @default([])

  createdAt         DateTime   @default(now())
  updatedAt         DateTime   @updatedAt

  @@index([userId, recordDate])
  @@map("health_records")
}

// AI 처리 로그
model AnalysisLog {
  id                String     @id @default(uuid())
  analysisId        String

  step              String     // upload | blood_flow_analysis | color_analysis | generating_report
  status            String     // started | completed | failed

  message           String?
  errorCode         String?
  errorMessage      String?

  metadata          Json?

  createdAt         DateTime   @default(now())

  @@index([analysisId, createdAt])
  @@map("analysis_logs")
}
```

### 3.2 MongoDB Schema (선택적, 로그용)

```typescript
// src/modules/analysis/schemas/analysis-log.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'analysis_logs' })
export class AnalysisLog extends Document {
  @Prop({ required: true, index: true })
  analysisId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  step: string; // upload | blood_flow_analysis | color_analysis | generating_report

  @Prop({ required: true })
  status: string; // started | completed | failed

  @Prop()
  message?: string;

  @Prop()
  errorCode?: string;

  @Prop()
  errorMessage?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  duration?: number; // milliseconds

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const AnalysisLogSchema = SchemaFactory.createForClass(AnalysisLog);

// 인덱스 설정
AnalysisLogSchema.index({ analysisId: 1, createdAt: -1 });
AnalysisLogSchema.index({ userId: 1, createdAt: -1 });
```

---

## 4. Service Layer 로직

### 4.1 AnalysisService 메인 로직

```typescript
// src/modules/analysis/analysis.service.ts

import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { S3Service } from '@/modules/storage/s3.service';
import { AIService } from '@/modules/ai/ai.service';
import { SubscriptionService } from '@/modules/subscription/subscription.service';
import { AnalysisLogService } from './analysis-log.service';
import { ConfigService } from '@nestjs/config';
import { UploadAnalysisDto } from './dto/upload-analysis.dto';
import { AnalysisResultDto } from './dto/analysis-response.dto';
import { Analysis, AnalysisStatus, OverallStatus } from '@prisma/client';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AnalysisService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly aiService: AIService,
    private readonly subscriptionService: SubscriptionService,
    private readonly analysisLogService: AnalysisLogService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 이미지 업로드 및 분석 시작
   */
  async uploadAndAnalyze(
    userId: string,
    file: Express.Multer.File,
    dto: UploadAnalysisDto,
  ): Promise<{ analysisId: string; status: string; estimatedTime: number }> {
    // 1. 구독 상태 확인
    await this.validateSubscription(userId);

    // 2. 이미지 검증
    this.validateImage(file);

    // 3. 분석 레코드 생성
    const analysis = await this.prisma.analysis.create({
      data: {
        userId,
        analysisDate: new Date(dto.date),
        status: AnalysisStatus.PROCESSING,
        notes: dto.notes,
        symptoms: dto.symptoms || [],
        imageSize: file.size,
        imageUrl: '', // 임시
        thumbnailUrl: '', // 임시
        imageKey: '',
      },
    });

    // 로그 기록
    await this.analysisLogService.log(analysis.id, userId, 'upload', 'started', 'Image upload started');

    try {
      // 4. S3에 이미지 업로드
      const { imageUrl, thumbnailUrl, imageKey } = await this.uploadImageToS3(
        file,
        userId,
        analysis.id,
      );

      // 5. 분석 레코드 업데이트
      await this.prisma.analysis.update({
        where: { id: analysis.id },
        data: { imageUrl, thumbnailUrl, imageKey },
      });

      // 6. AI 서버에 분석 요청 (비동기)
      this.processAnalysisAsync(analysis.id, imageUrl);

      // 7. 분석 횟수 차감
      await this.decrementAnalysisCount(userId);

      // 로그 기록
      await this.analysisLogService.log(
        analysis.id,
        userId,
        'upload',
        'completed',
        'Image uploaded successfully',
      );

      return {
        analysisId: analysis.id,
        status: 'processing',
        estimatedTime: 15, // 초
      };
    } catch (error) {
      // 실패 시 상태 업데이트
      await this.prisma.analysis.update({
        where: { id: analysis.id },
        data: { status: AnalysisStatus.FAILED },
      });

      await this.analysisLogService.log(
        analysis.id,
        userId,
        'upload',
        'failed',
        'Image upload failed',
        { error: error.message },
      );

      throw error;
    }
  }

  /**
   * 비동기 AI 분석 처리
   */
  private async processAnalysisAsync(analysisId: string, imageUrl: string): Promise<void> {
    try {
      const analysis = await this.prisma.analysis.findUnique({
        where: { id: analysisId },
      });

      if (!analysis) {
        throw new NotFoundException('분석을 찾을 수 없습니다');
      }

      // 1. 출혈량 분석
      await this.analysisLogService.log(
        analysisId,
        analysis.userId,
        'blood_flow_analysis',
        'started',
        'Starting blood flow analysis',
      );

      const bloodFlowResult = await this.aiService.analyzeBloodFlow(imageUrl);

      await this.analysisLogService.log(
        analysisId,
        analysis.userId,
        'blood_flow_analysis',
        'completed',
        'Blood flow analysis completed',
        { result: bloodFlowResult },
      );

      // 2. 색상 분석
      await this.analysisLogService.log(
        analysisId,
        analysis.userId,
        'color_analysis',
        'started',
        'Starting color analysis',
      );

      const colorResult = await this.aiService.analyzeColor(imageUrl);

      await this.analysisLogService.log(
        analysisId,
        analysis.userId,
        'color_analysis',
        'completed',
        'Color analysis completed',
        { result: colorResult },
      );

      // 3. 사용자 평균 계산
      const averageLevel = await this.calculateAverageBloodFlow(analysis.userId);
      const comparisonTrend = this.determineComparisonTrend(
        bloodFlowResult.level,
        averageLevel,
      );

      // 4. 전체 상태 판단
      const overallStatus = this.determineOverallStatus(
        bloodFlowResult.level,
        colorResult.status,
      );

      // 5. AI 코멘트 생성
      const aiComment = await this.aiService.generateComment({
        bloodFlowLevel: bloodFlowResult.level,
        colorStatus: colorResult.status,
        overallStatus,
        userHistory: await this.getUserAnalysisHistory(analysis.userId),
      });

      // 6. 경고 생성 (필요 시)
      const warning = this.generateWarning(
        bloodFlowResult.level,
        colorResult.status,
        overallStatus,
      );

      // 7. 분석 결과 저장
      await this.prisma.analysis.update({
        where: { id: analysisId },
        data: {
          status: AnalysisStatus.COMPLETED,
          overallStatus,

          // 출혈량
          bloodFlowLevel: bloodFlowResult.level,
          bloodFlowText: bloodFlowResult.text,
          bloodFlowConfidence: bloodFlowResult.confidence,
          bloodFlowComment: bloodFlowResult.comment,
          comparisonTrend,
          averageLevel,

          // 색상
          colorStatus: colorResult.status,
          colorCode: colorResult.colorCode,
          colorText: colorResult.text,
          colorConfidence: colorResult.confidence,
          colorComment: colorResult.comment,
          colorR: colorResult.rgbValues.r,
          colorG: colorResult.rgbValues.g,
          colorB: colorResult.rgbValues.b,

          // 코멘트 및 경고
          aiComment,
          warningTitle: warning?.title,
          warningMessage: warning?.message,
          warningSeverity: warning?.severity,
          warningActionRequired: warning?.actionRequired || false,
          warningActionText: warning?.actionText,

          // 메타데이터
          modelVersion: 'v2.1.0',
          processingTime: 12.5,
          imageQuality: 'GOOD',

          aiRequestId: bloodFlowResult.requestId,
          aiResponseRaw: {
            bloodFlow: bloodFlowResult,
            color: colorResult,
          },
        },
      });

      await this.analysisLogService.log(
        analysisId,
        analysis.userId,
        'generating_report',
        'completed',
        'Analysis completed successfully',
      );
    } catch (error) {
      await this.prisma.analysis.update({
        where: { id: analysisId },
        data: { status: AnalysisStatus.FAILED },
      });

      await this.analysisLogService.log(
        analysisId,
        analysis.userId,
        'processing',
        'failed',
        'Analysis failed',
        { error: error.message },
      );
    }
  }

  /**
   * 구독 상태 검증
   */
  private async validateSubscription(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionTier: true,
        subscriptionEndDate: true,
        monthlyAnalysisCount: true,
        lastAnalysisResetDate: true,
      },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    // 월간 분석 횟수 리셋 확인
    const now = new Date();
    const lastReset = new Date(user.lastAnalysisResetDate);
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          monthlyAnalysisCount: 0,
          lastAnalysisResetDate: now,
        },
      });
      user.monthlyAnalysisCount = 0;
    }

    // 구독 티어별 제한 확인
    if (user.subscriptionTier === 'FREE') {
      if (user.monthlyAnalysisCount >= 3) {
        throw new ForbiddenException(
          '무료 사용자는 월 3회까지 분석 가능합니다. 프리미엄을 구독해주세요.',
        );
      }
    } else if (user.subscriptionTier === 'PREMIUM') {
      // 구독 만료 확인
      if (user.subscriptionEndDate && new Date(user.subscriptionEndDate) < now) {
        throw new ForbiddenException('구독이 만료되었습니다. 구독을 갱신해주세요.');
      }
    }
  }

  /**
   * 이미지 검증
   */
  private validateImage(file: Express.Multer.File): void {
    // 파일 크기 확인 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('이미지 크기는 10MB 이하여야 합니다');
    }

    // 파일 타입 확인
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/heic'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('지원하지 않는 이미지 형식입니다');
    }
  }

  /**
   * S3에 이미지 업로드
   */
  private async uploadImageToS3(
    file: Express.Multer.File,
    userId: string,
    analysisId: string,
  ): Promise<{ imageUrl: string; thumbnailUrl: string; imageKey: string }> {
    const bucket = this.configService.get<string>('AWS_S3_BUCKET');
    const key = `analysis/${userId}/${analysisId}/${uuidv4()}.jpg`;

    // 원본 이미지 업로드
    const imageUrl = await this.s3Service.upload(bucket, key, file.buffer, file.mimetype);

    // 썸네일 생성 (200x200)
    const thumbnailBuffer = await sharp(file.buffer)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();

    const thumbnailKey = `analysis/${userId}/${analysisId}/thumbnail_${uuidv4()}.jpg`;
    const thumbnailUrl = await this.s3Service.upload(
      bucket,
      thumbnailKey,
      thumbnailBuffer,
      'image/jpeg',
    );

    return { imageUrl, thumbnailUrl, imageKey: key };
  }

  /**
   * 분석 횟수 차감
   */
  private async decrementAnalysisCount(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        monthlyAnalysisCount: {
          increment: 1,
        },
      },
    });
  }

  /**
   * 사용자 평균 출혈량 계산
   */
  private async calculateAverageBloodFlow(userId: string): Promise<number> {
    const recentAnalyses = await this.prisma.analysis.findMany({
      where: {
        userId,
        status: AnalysisStatus.COMPLETED,
        bloodFlowLevel: { not: null },
      },
      select: { bloodFlowLevel: true },
      orderBy: { createdAt: 'desc' },
      take: 10, // 최근 10개
    });

    if (recentAnalyses.length === 0) {
      return 3; // 기본값
    }

    const sum = recentAnalyses.reduce((acc, analysis) => acc + analysis.bloodFlowLevel!, 0);
    return sum / recentAnalyses.length;
  }

  /**
   * 비교 트렌드 결정
   */
  private determineComparisonTrend(
    currentLevel: number,
    averageLevel: number,
  ): 'SIMILAR' | 'HIGHER' | 'LOWER' {
    const diff = currentLevel - averageLevel;

    if (Math.abs(diff) <= 0.5) {
      return 'SIMILAR';
    } else if (diff > 0) {
      return 'HIGHER';
    } else {
      return 'LOWER';
    }
  }

  /**
   * 전체 상태 판단
   */
  private determineOverallStatus(
    bloodFlowLevel: number,
    colorStatus: OverallStatus,
  ): OverallStatus {
    // 출혈량이 매우 많거나 적음
    if (bloodFlowLevel === 1 || bloodFlowLevel === 5) {
      return OverallStatus.WARNING;
    }

    // 색상이 경고
    if (colorStatus === OverallStatus.WARNING) {
      return OverallStatus.WARNING;
    }

    // 색상이 주의 또는 출혈량이 4
    if (colorStatus === OverallStatus.CAUTION || bloodFlowLevel === 4) {
      return OverallStatus.CAUTION;
    }

    return OverallStatus.NORMAL;
  }

  /**
   * 경고 생성
   */
  private generateWarning(
    bloodFlowLevel: number,
    colorStatus: OverallStatus,
    overallStatus: OverallStatus,
  ): {
    title: string;
    message: string;
    severity: 'CAUTION' | 'WARNING';
    actionRequired: boolean;
    actionText?: string;
  } | null {
    if (overallStatus === OverallStatus.WARNING) {
      return {
        title: '확인이 필요해요',
        message:
          '출혈량이나 색상이 평소와 많이 다릅니다. 전문가 상담을 권장합니다.',
        severity: 'WARNING',
        actionRequired: true,
        actionText: '상담 예약하기',
      };
    }

    if (overallStatus === OverallStatus.CAUTION) {
      return {
        title: '주의가 필요해요',
        message: '출혈량이나 색상을 계속 관찰해주세요.',
        severity: 'CAUTION',
        actionRequired: false,
      };
    }

    return null;
  }

  /**
   * 분석 결과 조회
   */
  async getAnalysisResult(analysisId: string, userId: string): Promise<AnalysisResultDto> {
    const analysis = await this.prisma.analysis.findFirst({
      where: {
        id: analysisId,
        userId,
        deletedAt: null,
      },
    });

    if (!analysis) {
      throw new NotFoundException('분석 결과를 찾을 수 없습니다');
    }

    if (analysis.status !== AnalysisStatus.COMPLETED) {
      throw new BadRequestException('분석이 아직 완료되지 않았습니다');
    }

    return this.mapToDto(analysis);
  }

  /**
   * 분석 기록 목록 조회
   */
  async getAnalysisHistory(
    userId: string,
    page: number,
    limit: number,
    filters: {
      startDate?: string;
      endDate?: string;
      status?: OverallStatus;
    },
  ): Promise<{ items: any[]; pagination: any }> {
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      status: AnalysisStatus.COMPLETED,
      deletedAt: null,
    };

    if (filters.startDate) {
      where.analysisDate = { ...where.analysisDate, gte: new Date(filters.startDate) };
    }

    if (filters.endDate) {
      where.analysisDate = { ...where.analysisDate, lte: new Date(filters.endDate) };
    }

    if (filters.status) {
      where.overallStatus = filters.status;
    }

    const [items, total] = await Promise.all([
      this.prisma.analysis.findMany({
        where,
        select: {
          id: true,
          analysisDate: true,
          overallStatus: true,
          bloodFlowLevel: true,
          colorStatus: true,
          thumbnailUrl: true,
          saved: true,
        },
        orderBy: { analysisDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.analysis.count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Entity를 DTO로 매핑
   */
  private mapToDto(analysis: Analysis): AnalysisResultDto {
    return {
      id: analysis.id,
      userId: analysis.userId,
      timestamp: analysis.analysisDate.toISOString(),
      imageUrl: analysis.imageUrl,
      status: analysis.status.toLowerCase() as any,
      overallStatus: analysis.overallStatus?.toLowerCase() as any,
      bloodFlow: {
        level: analysis.bloodFlowLevel!,
        text: analysis.bloodFlowText!,
        confidence: analysis.bloodFlowConfidence!,
        comment: analysis.bloodFlowComment!,
        comparisonTrend: analysis.comparisonTrend?.toLowerCase() as any,
        averageLevel: analysis.averageLevel!,
      },
      color: {
        status: analysis.colorStatus?.toLowerCase() as any,
        colorCode: analysis.colorCode!,
        text: analysis.colorText!,
        confidence: analysis.colorConfidence!,
        comment: analysis.colorComment!,
        rgbValues: {
          r: analysis.colorR!,
          g: analysis.colorG!,
          b: analysis.colorB!,
        },
      },
      aiComment: analysis.aiComment!,
      warning: analysis.warningTitle
        ? {
            title: analysis.warningTitle,
            message: analysis.warningMessage!,
            severity: analysis.warningSeverity?.toLowerCase() as any,
            actionRequired: analysis.warningActionRequired,
            actionText: analysis.warningActionText || undefined,
          }
        : null,
      metadata: {
        modelVersion: analysis.modelVersion!,
        processingTime: analysis.processingTime!,
        imageQuality: analysis.imageQuality?.toLowerCase() as any,
      },
    };
  }

  /**
   * 사용자 분석 히스토리 조회 (AI 코멘트용)
   */
  private async getUserAnalysisHistory(userId: string): Promise<any[]> {
    return this.prisma.analysis.findMany({
      where: {
        userId,
        status: AnalysisStatus.COMPLETED,
        deletedAt: null,
      },
      select: {
        bloodFlowLevel: true,
        colorStatus: true,
        overallStatus: true,
        analysisDate: true,
      },
      orderBy: { analysisDate: 'desc' },
      take: 5,
    });
  }
}
```

---

## 5. Error Handling

### 5.1 Custom Exception Filters

```typescript
// src/common/filters/http-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || message;
        errorCode = (exceptionResponse as any).errorCode || this.getErrorCode(status);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unexpected error: ${exception.message}`, exception.stack);
    }

    const errorResponse = {
      success: false,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    };

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    const codeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
      503: 'SERVICE_UNAVAILABLE',
    };

    return codeMap[status] || 'UNKNOWN_ERROR';
  }
}
```

### 5.2 Custom Exceptions

```typescript
// src/modules/analysis/exceptions/analysis.exceptions.ts

import { HttpException, HttpStatus } from '@nestjs/common';

export class AnalysisNotFoundException extends HttpException {
  constructor(analysisId: string) {
    super(
      {
        errorCode: 'ANALYSIS_NOT_FOUND',
        message: `분석 결과를 찾을 수 없습니다 (ID: ${analysisId})`,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class AnalysisProcessingException extends HttpException {
  constructor(message: string) {
    super(
      {
        errorCode: 'ANALYSIS_PROCESSING_ERROR',
        message: `분석 처리 중 오류가 발생했습니다: ${message}`,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class SubscriptionLimitException extends HttpException {
  constructor(tier: string, limit: number) {
    super(
      {
        errorCode: 'SUBSCRIPTION_LIMIT_EXCEEDED',
        message: `${tier} 사용자는 월 ${limit}회까지 분석 가능합니다`,
        action: 'upgrade_subscription',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class InvalidImageException extends HttpException {
  constructor(reason: string) {
    super(
      {
        errorCode: 'INVALID_IMAGE',
        message: `유효하지 않은 이미지입니다: ${reason}`,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class AIServiceException extends HttpException {
  constructor(message: string) {
    super(
      {
        errorCode: 'AI_SERVICE_ERROR',
        message: `AI 분석 서비스 오류: ${message}`,
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
```

---

## 6. 인증/인가 규칙

### 6.1 JWT Guards

```typescript
// src/common/guards/jwt-auth.guard.ts

import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Public 데코레이터가 있는 경우 인증 생략
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('인증이 필요합니다');
    }
    return user;
  }
}
```

### 6.2 Resource Owner Guard

```typescript
// src/modules/analysis/guards/analysis-owner.guard.ts

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AnalysisOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const analysisId = request.params.id;

    if (!user || !analysisId) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }

    // 분석 소유자 확인
    const analysis = await this.prisma.analysis.findFirst({
      where: {
        id: analysisId,
        userId: user.id,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!analysis) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }

    return true;
  }
}
```

### 6.3 Controller 적용

```typescript
// src/modules/analysis/analysis.controller.ts

import { Controller, Post, Get, Delete, UseGuards, Body, Param, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AnalysisOwnerGuard } from './guards/analysis-owner.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AnalysisService } from './analysis.service';
import { UploadAnalysisDto } from './dto/upload-analysis.dto';
import { AnalysisHistoryQueryDto } from './dto/analysis-history-query.dto';

@ApiTags('Analysis')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('upload')
  @ApiOperation({ summary: '이미지 업로드 및 분석 시작' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async uploadAnalysis(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadAnalysisDto,
  ) {
    return this.analysisService.uploadAndAnalyze(user.id, file, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '분석 결과 조회' })
  @UseGuards(AnalysisOwnerGuard)
  async getAnalysisResult(@Param('id') id: string, @CurrentUser() user: any) {
    return this.analysisService.getAnalysisResult(id, user.id);
  }

  @Get('history')
  @ApiOperation({ summary: '분석 기록 목록 조회' })
  async getAnalysisHistory(@CurrentUser() user: any, @Query() query: AnalysisHistoryQueryDto) {
    return this.analysisService.getAnalysisHistory(user.id, query.page, query.limit, {
      startDate: query.startDate,
      endDate: query.endDate,
      status: query.status,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: '분석 결과 삭제' })
  @UseGuards(AnalysisOwnerGuard)
  async deleteAnalysis(@Param('id') id: string, @CurrentUser() user: any) {
    return this.analysisService.deleteAnalysis(id, user.id);
  }
}
```

---

## 7. 정기결제 Billing 처리

### 7.1 구독 상태 확인

```typescript
// src/modules/subscription/subscription.service.ts

import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 분석 가능 여부 확인
   */
  async canAnalyze(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionTier: true,
        subscriptionEndDate: true,
        monthlyAnalysisCount: true,
        lastAnalysisResetDate: true,
      },
    });

    if (!user) {
      return false;
    }

    // 월간 리셋 확인
    await this.resetMonthlyCountIfNeeded(userId, user.lastAnalysisResetDate);

    // FREE: 3회/월
    if (user.subscriptionTier === 'FREE') {
      return user.monthlyAnalysisCount < 3;
    }

    // PREMIUM: 무제한 (구독 유효 확인)
    if (user.subscriptionTier === 'PREMIUM') {
      if (!user.subscriptionEndDate) {
        return false;
      }
      return new Date(user.subscriptionEndDate) > new Date();
    }

    return false;
  }

  /**
   * 월간 분석 횟수 리셋 (매월 1일 자정)
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async resetAllMonthlyAnalysisCount(): Promise<void> {
    await this.prisma.user.updateMany({
      data: {
        monthlyAnalysisCount: 0,
        lastAnalysisResetDate: new Date(),
      },
    });
  }

  /**
   * 개별 사용자 리셋 확인
   */
  private async resetMonthlyCountIfNeeded(userId: string, lastReset: Date): Promise<void> {
    const now = new Date();
    const lastResetDate = new Date(lastReset);

    if (
      now.getMonth() !== lastResetDate.getMonth() ||
      now.getFullYear() !== lastResetDate.getFullYear()
    ) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          monthlyAnalysisCount: 0,
          lastAnalysisResetDate: now,
        },
      });
    }
  }

  /**
   * 구독 갱신 (결제 성공 시 Webhook에서 호출)
   */
  async renewSubscription(
    userId: string,
    tier: 'FREE' | 'PREMIUM',
    endDate: Date,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tier,
        subscriptionEndDate: endDate,
      },
    });
  }

  /**
   * 구독 만료 처리 (매일 자정)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireSubscriptions(): Promise<void> {
    const now = new Date();

    await this.prisma.user.updateMany({
      where: {
        subscriptionTier: 'PREMIUM',
        subscriptionEndDate: {
          lt: now,
        },
      },
      data: {
        subscriptionTier: 'FREE',
        subscriptionEndDate: null,
      },
    });
  }
}
```

### 7.2 결제 Webhook 처리

```typescript
// src/modules/payment/payment-webhook.controller.ts

import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { Public } from '@/common/decorators/public.decorator';
import { SubscriptionService } from '@/modules/subscription/subscription.service';
import { PaymentService } from './payment.service';
import * as crypto from 'crypto';

@Controller('api/v1/payment/webhook')
export class PaymentWebhookController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly paymentService: PaymentService,
  ) {}

  /**
   * Toss Payments Webhook
   */
  @Public()
  @Post('toss')
  async handleTossWebhook(
    @Body() body: any,
    @Headers('toss-signature') signature: string,
  ) {
    // 1. 서명 검증
    this.verifyTossSignature(body, signature);

    // 2. 이벤트 타입별 처리
    const { eventType, data } = body;

    switch (eventType) {
      case 'PAYMENT_CONFIRMED':
        await this.handlePaymentConfirmed(data);
        break;

      case 'SUBSCRIPTION_RENEWED':
        await this.handleSubscriptionRenewed(data);
        break;

      case 'SUBSCRIPTION_CANCELLED':
        await this.handleSubscriptionCancelled(data);
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return { success: true };
  }

  /**
   * 결제 확인 처리
   */
  private async handlePaymentConfirmed(data: any): Promise<void> {
    const { orderId, userId, amount, paymentKey } = data;

    // 결제 정보 저장
    await this.paymentService.createPayment({
      orderId,
      userId,
      amount,
      paymentKey,
      status: 'CONFIRMED',
    });

    // 구독 갱신 (1개월)
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    await this.subscriptionService.renewSubscription(userId, 'PREMIUM', endDate);
  }

  /**
   * 정기 결제 갱신 처리
   */
  private async handleSubscriptionRenewed(data: any): Promise<void> {
    const { userId, nextBillingDate } = data;

    await this.subscriptionService.renewSubscription(
      userId,
      'PREMIUM',
      new Date(nextBillingDate),
    );
  }

  /**
   * 구독 취소 처리
   */
  private async handleSubscriptionCancelled(data: any): Promise<void> {
    const { userId } = data;

    await this.subscriptionService.renewSubscription(userId, 'FREE', null);
  }

  /**
   * Toss Payments 서명 검증
   */
  private verifyTossSignature(body: any, signature: string): void {
    const secret = process.env.TOSS_WEBHOOK_SECRET;
    const hash = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (hash !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }
  }
}
```

---

## 8. AI 서버 연동 규칙

### 8.1 AI Service 구현

```typescript
// src/modules/ai/ai.service.ts

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout, retry } from 'rxjs';

interface BloodFlowAnalysisResult {
  requestId: string;
  level: number; // 1-5
  text: string;
  confidence: number;
  comment: string;
}

interface ColorAnalysisResult {
  requestId: string;
  status: 'NORMAL' | 'CAUTION' | 'WARNING';
  colorCode: string;
  text: string;
  confidence: number;
  comment: string;
  rgbValues: { r: number; g: number; b: number };
}

@Injectable()
export class AIService {
  private readonly aiServerUrl: string;
  private readonly aiApiKey: string;
  private readonly requestTimeout: number = 30000; // 30초
  private readonly maxRetries: number = 3;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.aiServerUrl = this.configService.get<string>('AI_SERVER_URL');
    this.aiApiKey = this.configService.get<string>('AI_API_KEY');
  }

  /**
   * 출혈량 분석
   */
  async analyzeBloodFlow(imageUrl: string): Promise<BloodFlowAnalysisResult> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .post(
            `${this.aiServerUrl}/api/v1/analyze/blood-flow`,
            {
              imageUrl,
              returnDetails: true,
            },
            {
              headers: {
                'Authorization': `Bearer ${this.aiApiKey}`,
                'Content-Type': 'application/json',
              },
            },
          )
          .pipe(
            timeout(this.requestTimeout),
            retry({
              count: this.maxRetries,
              delay: (error, retryCount) => {
                console.log(`Retry ${retryCount} for blood flow analysis`);
                return retryCount * 2000; // 2초, 4초, 6초
              },
            }),
          ),
      );

      const data = response.data;

      return {
        requestId: data.requestId,
        level: data.level,
        text: this.mapBloodFlowLevelToText(data.level),
        confidence: data.confidence,
        comment: data.comment || this.generateBloodFlowComment(data.level),
      };
    } catch (error) {
      console.error('[AIService] Blood flow analysis failed:', error);
      throw new HttpException(
        {
          errorCode: 'AI_BLOOD_FLOW_ANALYSIS_FAILED',
          message: 'AI 출혈량 분석에 실패했습니다',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * 색상 분석
   */
  async analyzeColor(imageUrl: string): Promise<ColorAnalysisResult> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .post(
            `${this.aiServerUrl}/api/v1/analyze/color`,
            {
              imageUrl,
              returnDetails: true,
            },
            {
              headers: {
                'Authorization': `Bearer ${this.aiApiKey}`,
                'Content-Type': 'application/json',
              },
            },
          )
          .pipe(
            timeout(this.requestTimeout),
            retry({
              count: this.maxRetries,
              delay: (error, retryCount) => {
                console.log(`Retry ${retryCount} for color analysis`);
                return retryCount * 2000;
              },
            }),
          ),
      );

      const data = response.data;

      return {
        requestId: data.requestId,
        status: data.status,
        colorCode: data.colorCode,
        text: this.mapColorStatusToText(data.status),
        confidence: data.confidence,
        comment: data.comment || this.generateColorComment(data.status),
        rgbValues: data.rgbValues,
      };
    } catch (error) {
      console.error('[AIService] Color analysis failed:', error);
      throw new HttpException(
        {
          errorCode: 'AI_COLOR_ANALYSIS_FAILED',
          message: 'AI 색상 분석에 실패했습니다',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * AI 코멘트 생성
   */
  async generateComment(params: {
    bloodFlowLevel: number;
    colorStatus: string;
    overallStatus: string;
    userHistory: any[];
  }): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .post(
            `${this.aiServerUrl}/api/v1/generate/comment`,
            {
              bloodFlowLevel: params.bloodFlowLevel,
              colorStatus: params.colorStatus,
              overallStatus: params.overallStatus,
              userHistory: params.userHistory,
            },
            {
              headers: {
                'Authorization': `Bearer ${this.aiApiKey}`,
                'Content-Type': 'application/json',
              },
            },
          )
          .pipe(timeout(this.requestTimeout)),
      );

      return response.data.comment;
    } catch (error) {
      console.error('[AIService] Comment generation failed:', error);
      // Fallback 코멘트 반환
      return this.generateFallbackComment(params.overallStatus);
    }
  }

  /**
   * 출혈량 레벨 → 텍스트 매핑
   */
  private mapBloodFlowLevelToText(level: number): string {
    const textMap: Record<number, string> = {
      1: '매우 적음',
      2: '적음',
      3: '보통',
      4: '많음',
      5: '매우 많음',
    };
    return textMap[level] || '보통';
  }

  /**
   * 색상 상태 → 텍스트 매핑
   */
  private mapColorStatusToText(status: string): string {
    const textMap: Record<string, string> = {
      NORMAL: '정상 범위',
      CAUTION: '주의 필요',
      WARNING: '확인 필요',
    };
    return textMap[status] || '정상 범위';
  }

  /**
   * 출혈량 코멘트 생성
   */
  private generateBloodFlowComment(level: number): string {
    const commentMap: Record<number, string> = {
      1: '출혈량이 매우 적습니다. 주기 초기 또는 말기일 수 있습니다.',
      2: '출혈량이 적습니다.',
      3: '정상적인 출혈량입니다.',
      4: '출혈량이 많습니다. 주기 중반일 수 있습니다.',
      5: '출혈량이 매우 많습니다. 계속 관찰해주세요.',
    };
    return commentMap[level] || '정상적인 출혈량입니다.';
  }

  /**
   * 색상 코멘트 생성
   */
  private generateColorComment(status: string): string {
    const commentMap: Record<string, string> = {
      NORMAL: '건강한 색상입니다.',
      CAUTION: '색상을 계속 관찰해주세요.',
      WARNING: '색상이 평소와 다릅니다. 전문가 상담을 권장합니다.',
    };
    return commentMap[status] || '건강한 색상입니다.';
  }

  /**
   * Fallback 코멘트
   */
  private generateFallbackComment(overallStatus: string): string {
    const commentMap: Record<string, string> = {
      NORMAL: '정상적인 월경 상태입니다. 규칙적인 주기를 유지하고 있어요.',
      CAUTION: '일부 주의가 필요합니다. 증상을 계속 관찰해주세요.',
      WARNING: '확인이 필요합니다. 전문가 상담을 권장합니다.',
    };
    return commentMap[overallStatus] || '정상적인 월경 상태입니다.';
  }
}
```

### 8.2 AI 서버 Health Check

```typescript
// src/modules/ai/ai-health.service.ts

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class AIHealthService {
  private isAIServerHealthy: boolean = true;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * AI 서버 Health Check (1분마다)
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async checkAIServerHealth(): Promise<void> {
    try {
      const aiServerUrl = this.configService.get<string>('AI_SERVER_URL');

      const response = await firstValueFrom(
        this.httpService.get(`${aiServerUrl}/health`).pipe(timeout(5000)),
      );

      this.isAIServerHealthy = response.status === 200;
    } catch (error) {
      console.error('[AIHealthService] AI server health check failed:', error);
      this.isAIServerHealthy = false;
    }
  }

  /**
   * AI 서버 상태 조회
   */
  isHealthy(): boolean {
    return this.isAIServerHealthy;
  }
}
```

---

## 9. 로그 및 이벤트 기록

### 9.1 분석 로그 서비스

```typescript
// src/modules/analysis/analysis-log.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AnalysisLogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * 분석 로그 기록
   */
  async log(
    analysisId: string,
    userId: string,
    step: string,
    status: string,
    message?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.prisma.analysisLog.create({
        data: {
          analysisId,
          step,
          status,
          message,
          metadata: metadata || {},
        },
      });

      // 이벤트 발행
      this.eventEmitter.emit('analysis.log.created', {
        analysisId,
        userId,
        step,
        status,
        message,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('[AnalysisLogService] Failed to create log:', error);
    }
  }

  /**
   * 분석 로그 조회
   */
  async getLogs(analysisId: string): Promise<any[]> {
    return this.prisma.analysisLog.findMany({
      where: { analysisId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
```

### 9.2 이벤트 리스너

```typescript
// src/modules/analytics/analysis-event.listener.ts

import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AnalyticsService } from './analytics.service';

@Injectable()
export class AnalysisEventListener {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * 분석 업로드 완료 이벤트
   */
  @OnEvent('analysis.uploaded')
  async handleAnalysisUploaded(payload: any) {
    await this.analyticsService.track('analysis_uploaded', {
      userId: payload.userId,
      analysisId: payload.analysisId,
      imageSize: payload.imageSize,
      timestamp: payload.timestamp,
    });
  }

  /**
   * 분석 완료 이벤트
   */
  @OnEvent('analysis.completed')
  async handleAnalysisCompleted(payload: any) {
    await this.analyticsService.track('analysis_completed', {
      userId: payload.userId,
      analysisId: payload.analysisId,
      overallStatus: payload.overallStatus,
      processingTime: payload.processingTime,
      timestamp: payload.timestamp,
    });
  }

  /**
   * 분석 실패 이벤트
   */
  @OnEvent('analysis.failed')
  async handleAnalysisFailed(payload: any) {
    await this.analyticsService.track('analysis_failed', {
      userId: payload.userId,
      analysisId: payload.analysisId,
      errorCode: payload.errorCode,
      errorMessage: payload.errorMessage,
      timestamp: payload.timestamp,
    });

    // Sentry에 에러 전송
    // Sentry.captureException(new Error(payload.errorMessage), {
    //   tags: {
    //     analysisId: payload.analysisId,
    //     errorCode: payload.errorCode,
    //   },
    // });
  }
}
```

---

## 10. 데이터 정합성 규칙

### 10.1 트랜잭션 관리

```typescript
// src/modules/analysis/analysis.service.ts (추가)

/**
 * 분석 기록 저장 (트랜잭션)
 */
async saveAnalysisRecord(
  analysisId: string,
  userId: string,
  notes?: string,
  tags?: string[],
): Promise<void> {
  await this.prisma.$transaction(async (tx) => {
    // 1. 분석 소유자 확인
    const analysis = await tx.analysis.findFirst({
      where: {
        id: analysisId,
        userId,
        deletedAt: null,
      },
    });

    if (!analysis) {
      throw new NotFoundException('분석 결과를 찾을 수 없습니다');
    }

    if (analysis.status !== 'COMPLETED') {
      throw new BadRequestException('완료되지 않은 분석입니다');
    }

    // 2. 기존 건강 기록 확인
    const existingRecord = await tx.healthRecord.findUnique({
      where: { analysisId },
    });

    if (existingRecord) {
      throw new BadRequestException('이미 저장된 기록입니다');
    }

    // 3. 건강 기록 생성
    await tx.healthRecord.create({
      data: {
        userId,
        analysisId,
        recordDate: analysis.analysisDate,
        notes,
        tags: tags || [],
      },
    });

    // 4. 분석 saved 플래그 업데이트
    await tx.analysis.update({
      where: { id: analysisId },
      data: {
        saved: true,
        savedAt: new Date(),
      },
    });
  });
}
```

### 10.2 데이터 검증

```typescript
// src/modules/analysis/validators/analysis.validator.ts

import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class AnalysisValidator {
  /**
   * 출혈량 레벨 검증
   */
  validateBloodFlowLevel(level: number): void {
    if (!Number.isInteger(level) || level < 1 || level > 5) {
      throw new BadRequestException('출혈량 레벨은 1-5 사이여야 합니다');
    }
  }

  /**
   * 색상 코드 검증
   */
  validateColorCode(colorCode: string): void {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(colorCode)) {
      throw new BadRequestException('유효하지 않은 색상 코드입니다');
    }
  }

  /**
   * RGB 값 검증
   */
  validateRGBValues(r: number, g: number, b: number): void {
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      throw new BadRequestException('RGB 값은 0-255 사이여야 합니다');
    }
  }

  /**
   * 신뢰도 검증
   */
  validateConfidence(confidence: number): void {
    if (confidence < 0 || confidence > 1) {
      throw new BadRequestException('신뢰도는 0-1 사이여야 합니다');
    }
  }

  /**
   * 날짜 검증
   */
  validateAnalysisDate(date: string): void {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestException('유효하지 않은 날짜 형식입니다');
    }

    // 미래 날짜 방지
    if (parsedDate > new Date()) {
      throw new BadRequestException('미래 날짜는 입력할 수 없습니다');
    }

    // 너무 과거 날짜 방지 (1년 전까지만)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    if (parsedDate < oneYearAgo) {
      throw new BadRequestException('1년 이전 날짜는 입력할 수 없습니다');
    }
  }
}
```

### 10.3 Soft Delete

```typescript
// src/modules/analysis/analysis.service.ts (추가)

/**
 * 분석 결과 삭제 (Soft Delete)
 */
async deleteAnalysis(analysisId: string, userId: string): Promise<void> {
  await this.prisma.$transaction(async (tx) => {
    // 1. 분석 소유자 확인
    const analysis = await tx.analysis.findFirst({
      where: {
        id: analysisId,
        userId,
        deletedAt: null,
      },
    });

    if (!analysis) {
      throw new NotFoundException('분석 결과를 찾을 수 없습니다');
    }

    // 2. Soft Delete
    await tx.analysis.update({
      where: { id: analysisId },
      data: {
        deletedAt: new Date(),
      },
    });

    // 3. 연관된 건강 기록도 Soft Delete (선택적)
    // await tx.healthRecord.updateMany({
    //   where: { analysisId },
    //   data: { deletedAt: new Date() },
    // });
  });
}
```

---

## 11. 환경 변수 설정

```bash
# .env

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/femcare?schema=public"

# JWT
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="7d"

# AWS S3
AWS_REGION="ap-northeast-2"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="femcare-images"

# AI Server
AI_SERVER_URL="https://ai.femcare.com"
AI_API_KEY="your-ai-api-key"

# Payment (Toss Payments)
TOSS_CLIENT_KEY="test_ck_xxx"
TOSS_SECRET_KEY="test_sk_xxx"
TOSS_WEBHOOK_SECRET="your-webhook-secret"

# Redis (Cache)
REDIS_HOST="localhost"
REDIS_PORT=6379

# Logging
LOG_LEVEL="info"
```

---

이 문서는 FemCare AI 분석 기능의 완전한 백엔드 개발 명세서입니다.
