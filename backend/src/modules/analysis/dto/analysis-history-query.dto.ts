import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { OverallStatus, AnalysisStatus } from '@prisma/client';

/**
 * 분석 히스토리 조회 쿼리 DTO
 */
export class AnalysisHistoryQueryDto {
  @ApiProperty({
    description: '페이지 번호',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: '페이지 당 항목 수',
    example: 20,
    default: 20,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: '시작 날짜 (ISO 8601)',
    example: '2025-11-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: '종료 날짜 (ISO 8601)',
    example: '2025-11-30T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: '전체 상태 필터',
    example: 'NORMAL',
    enum: OverallStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(OverallStatus)
  overallStatus?: OverallStatus;

  @ApiProperty({
    description: '처리 상태 필터',
    example: 'COMPLETED',
    enum: AnalysisStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(AnalysisStatus)
  status?: AnalysisStatus;

  @ApiProperty({
    description: '저장된 항목만 조회',
    example: true,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  savedOnly?: boolean;
}
