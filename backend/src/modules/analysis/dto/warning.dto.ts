import { ApiProperty } from '@nestjs/swagger';
import { WarningSeverity } from '@prisma/client';

/**
 * 경고/주의사항 DTO
 */
export class WarningDto {
  @ApiProperty({
    description: '경고 제목',
    example: '색상 주의',
  })
  title: string;

  @ApiProperty({
    description: '경고 메시지',
    example: '비정상적인 색상이 감지되었습니다. 전문의 상담을 권장합니다.',
  })
  message: string;

  @ApiProperty({
    description: '경고 심각도',
    example: 'CAUTION',
    enum: WarningSeverity,
  })
  severity: WarningSeverity;

  @ApiProperty({
    description: '조치 필요 여부',
    example: true,
  })
  actionRequired: boolean;

  @ApiProperty({
    description: '권장 조치 텍스트',
    example: '48시간 이내 전문의 상담',
    required: false,
  })
  actionText?: string;
}
