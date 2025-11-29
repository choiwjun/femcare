import { ApiProperty } from '@nestjs/swagger';
import { AnalysisStatus, OverallStatus } from '@prisma/client';
import { BloodFlowAnalysisDto } from './blood-flow-analysis.dto';
import { ColorAnalysisDto } from './color-analysis.dto';
import { WarningDto } from './warning.dto';
import { AnalysisMetadataDto } from './analysis-metadata.dto';

/**
 * 분석 결과 응답 DTO
 */
export class AnalysisResponseDto {
  @ApiProperty({
    description: '분석 ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: '사용자 ID',
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  userId: string;

  @ApiProperty({
    description: '이미지 URL',
    example: 'https://femcare-images.s3.amazonaws.com/analysis/abc123.jpg',
  })
  imageUrl: string;

  @ApiProperty({
    description: '썸네일 URL',
    example: 'https://femcare-images.s3.amazonaws.com/analysis/thumb_abc123.jpg',
  })
  thumbnailUrl: string;

  @ApiProperty({
    description: '분석 날짜',
    example: '2025-11-28T10:30:00Z',
  })
  analysisDate: Date;

  @ApiProperty({
    description: '처리 상태',
    example: 'COMPLETED',
    enum: AnalysisStatus,
  })
  status: AnalysisStatus;

  @ApiProperty({
    description: '전체 상태',
    example: 'NORMAL',
    enum: OverallStatus,
    required: false,
  })
  overallStatus?: OverallStatus;

  @ApiProperty({
    description: '출혈량 분석',
    type: BloodFlowAnalysisDto,
    required: false,
  })
  bloodFlowAnalysis?: BloodFlowAnalysisDto;

  @ApiProperty({
    description: '색상 분석',
    type: ColorAnalysisDto,
    required: false,
  })
  colorAnalysis?: ColorAnalysisDto;

  @ApiProperty({
    description: 'AI 건강 코멘트',
    example: '전반적으로 정상적인 생리 상태입니다. 충분한 수분 섭취와 휴식을 권장합니다.',
    required: false,
  })
  aiComment?: string;

  @ApiProperty({
    description: '경고/주의사항',
    type: WarningDto,
    required: false,
  })
  warning?: WarningDto;

  @ApiProperty({
    description: '메타데이터',
    type: AnalysisMetadataDto,
    required: false,
  })
  metadata?: AnalysisMetadataDto;

  @ApiProperty({
    description: '추가 메모',
    example: '생리통이 심함',
    required: false,
  })
  notes?: string;

  @ApiProperty({
    description: '증상 목록',
    example: ['cramps', 'headache', 'fatigue'],
    type: [String],
    required: false,
  })
  symptoms?: string[];

  @ApiProperty({
    description: '저장 여부',
    example: false,
  })
  saved: boolean;

  @ApiProperty({
    description: '생성일시',
    example: '2025-11-28T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정일시',
    example: '2025-11-28T10:35:00Z',
  })
  updatedAt: Date;
}
