import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString, IsOptional, IsArray, IsString } from 'class-validator';

/**
 * 분석 이미지 업로드 요청 DTO
 */
export class UploadAnalysisDto {
  @ApiProperty({
    description: '분석 날짜 (ISO 8601)',
    example: '2025-11-28T10:30:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  analysisDate: string;

  @ApiProperty({
    description: '추가 메모 (선택)',
    example: '생리통이 심함',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: '증상 목록 (선택)',
    example: ['cramps', 'headache', 'fatigue'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symptoms?: string[];
}
