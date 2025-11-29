import { ApiProperty } from '@nestjs/swagger';
import { ImageQuality } from '@prisma/client';

/**
 * 분석 메타데이터 DTO
 */
export class AnalysisMetadataDto {
  @ApiProperty({
    description: 'AI 모델 버전',
    example: 'v2.1.0',
  })
  modelVersion: string;

  @ApiProperty({
    description: '처리 시간 (초)',
    example: 2.34,
  })
  processingTime: number;

  @ApiProperty({
    description: '이미지 품질 평가',
    example: 'GOOD',
    enum: ImageQuality,
  })
  imageQuality: ImageQuality;

  @ApiProperty({
    description: '이미지 크기 (bytes)',
    example: 524288,
  })
  imageSize: number;

  @ApiProperty({
    description: 'AI 요청 ID',
    example: 'ai-req-123456',
    required: false,
  })
  aiRequestId?: string;
}
