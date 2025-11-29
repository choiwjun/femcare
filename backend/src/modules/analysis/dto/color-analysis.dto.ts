import { ApiProperty } from '@nestjs/swagger';
import { OverallStatus } from '@prisma/client';

/**
 * 색상 분석 DTO
 */
export class ColorAnalysisDto {
  @ApiProperty({
    description: '색상 상태',
    example: 'NORMAL',
    enum: OverallStatus,
  })
  status: OverallStatus;

  @ApiProperty({
    description: 'HEX 색상 코드',
    example: '#8B0000',
  })
  colorCode: string;

  @ApiProperty({
    description: '색상 텍스트 설명',
    example: '진한 적색',
  })
  text: string;

  @ApiProperty({
    description: 'RGB 값',
    example: { r: 139, g: 0, b: 0 },
  })
  rgb: {
    r: number;
    g: number;
    b: number;
  };

  @ApiProperty({
    description: 'AI 신뢰도 (0-1)',
    example: 0.88,
    minimum: 0,
    maximum: 1,
  })
  confidence: number;

  @ApiProperty({
    description: 'AI 코멘트',
    example: '정상적인 생리 색상입니다.',
  })
  comment: string;
}
