import { ApiProperty } from '@nestjs/swagger';
import { ComparisonTrend } from '@prisma/client';

/**
 * 출혈량 분석 DTO
 */
export class BloodFlowAnalysisDto {
  @ApiProperty({
    description: '출혈량 레벨 (1-5)',
    example: 3,
    minimum: 1,
    maximum: 5,
  })
  level: number;

  @ApiProperty({
    description: '출혈량 텍스트 설명',
    example: '보통',
    enum: ['매우 적음', '적음', '보통', '많음', '매우 많음'],
  })
  text: string;

  @ApiProperty({
    description: 'AI 신뢰도 (0-1)',
    example: 0.92,
    minimum: 0,
    maximum: 1,
  })
  confidence: number;

  @ApiProperty({
    description: 'AI 코멘트',
    example: '평소와 비슷한 출혈량입니다.',
  })
  comment: string;

  @ApiProperty({
    description: '이전 분석 대비 트렌드',
    example: 'SIMILAR',
    enum: ComparisonTrend,
    required: false,
  })
  comparisonTrend?: ComparisonTrend;

  @ApiProperty({
    description: '평균 출혈량 레벨',
    example: 2.8,
    required: false,
  })
  averageLevel?: number;
}
