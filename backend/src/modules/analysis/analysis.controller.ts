import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { AnalysisService } from './services/analysis.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnalysisOwnerGuard } from './guards/analysis-owner.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { UploadAnalysisDto, AnalysisResponseDto, AnalysisHistoryQueryDto } from './dto';

/**
 * 분석 API 컨트롤러
 */
@ApiTags('Analysis')
@ApiBearerAuth()
@Controller('api/v1/analysis')
@UseGuards(JwtAuthGuard)
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  /**
   * 이미지 업로드 및 분석 시작
   */
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '이미지 업로드 및 분석 시작',
    description: '생리대 이미지를 업로드하고 AI 분석을 시작합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '분석 시작 성공 (PROCESSING 상태)',
    type: AnalysisResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (파일 누락, 유효성 검증 실패)',
  })
  @ApiResponse({
    status: 403,
    description: '구독 한도 초과',
  })
  @ApiResponse({
    status: 500,
    description: '이미지 업로드 실패 또는 서버 오류',
  })
  async uploadAndAnalyze(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadAnalysisDto,
  ): Promise<AnalysisResponseDto> {
    return this.analysisService.uploadAndAnalyze(user.id, file, dto);
  }

  /**
   * 분석 결과 조회
   */
  @Get(':id')
  @ApiOperation({
    summary: '분석 결과 조회',
    description: '특정 분석 결과의 상세 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: AnalysisResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '분석 결과를 찾을 수 없음',
  })
  @UseGuards(AnalysisOwnerGuard)
  async getAnalysisById(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ): Promise<AnalysisResponseDto> {
    return this.analysisService.getAnalysisById(user.id, id);
  }

  /**
   * 분석 상태 조회
   */
  @Get('status/:id')
  @ApiOperation({
    summary: '분석 처리 상태 조회',
    description: '분석의 현재 처리 상태를 확인합니다 (PROCESSING, COMPLETED, FAILED).',
  })
  @ApiResponse({
    status: 200,
    description: '상태 조회 성공',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        status: 'COMPLETED',
        overallStatus: 'NORMAL',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '분석 결과를 찾을 수 없음',
  })
  @UseGuards(AnalysisOwnerGuard)
  async getAnalysisStatus(@CurrentUser() user: any, @Param('id') id: string) {
    const analysis = await this.analysisService.getAnalysisById(user.id, id);
    return {
      id: analysis.id,
      status: analysis.status,
      overallStatus: analysis.overallStatus,
    };
  }

  /**
   * 분석 히스토리 조회
   */
  @Get()
  @ApiOperation({
    summary: '분석 히스토리 조회',
    description: '사용자의 분석 히스토리를 페이지네이션과 필터링으로 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    schema: {
      example: {
        items: [],
        total: 42,
        page: 1,
        limit: 20,
        totalPages: 3,
      },
    },
  })
  async getAnalysisHistory(
    @CurrentUser() user: any,
    @Query() query: AnalysisHistoryQueryDto,
  ) {
    return this.analysisService.getAnalysisHistory(user.id, query);
  }

  /**
   * 분석 결과 삭제
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '분석 결과 삭제',
    description: '분석 결과를 삭제합니다 (소프트 삭제).',
  })
  @ApiResponse({
    status: 204,
    description: '삭제 성공',
  })
  @ApiResponse({
    status: 404,
    description: '분석 결과를 찾을 수 없음',
  })
  @UseGuards(AnalysisOwnerGuard)
  async deleteAnalysis(@CurrentUser() user: any, @Param('id') id: string): Promise<void> {
    await this.analysisService.deleteAnalysis(user.id, id);
  }

  /**
   * 분석 결과 저장 (건강 기록)
   */
  @Post(':id/save')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '분석 결과 저장',
    description: '분석 결과를 건강 기록으로 저장합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '저장 성공',
    schema: {
      example: {
        message: '분석 결과가 건강 기록에 저장되었습니다.',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '분석 결과를 찾을 수 없음',
  })
  @UseGuards(AnalysisOwnerGuard)
  async saveAnalysis(@CurrentUser() user: any, @Param('id') id: string) {
    await this.analysisService.saveAnalysis(user.id, id);
    return {
      message: '분석 결과가 건강 기록에 저장되었습니다.',
    };
  }

  /**
   * 분석 결과 공유 토큰 생성
   */
  @Post(':id/share')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '공유 토큰 생성',
    description: '분석 결과를 공유할 수 있는 임시 토큰을 생성합니다 (7일 유효).',
  })
  @ApiResponse({
    status: 200,
    description: '공유 토큰 생성 성공',
    schema: {
      example: {
        shareToken: '660e8400-e29b-41d4-a716-446655440002',
        shareUrl: 'https://femcare.app/share/660e8400-e29b-41d4-a716-446655440002',
        expiresAt: '2025-12-05T10:30:00Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '분석 결과를 찾을 수 없음',
  })
  @UseGuards(AnalysisOwnerGuard)
  async createShareToken(@CurrentUser() user: any, @Param('id') id: string) {
    const shareToken = await this.analysisService.createShareToken(user.id, id);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return {
      shareToken,
      shareUrl: `https://femcare.app/share/${shareToken}`,
      expiresAt: expiresAt.toISOString(),
    };
  }
}
