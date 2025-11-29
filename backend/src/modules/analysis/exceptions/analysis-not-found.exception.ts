import { NotFoundException } from '@nestjs/common';

/**
 * 분석 결과를 찾을 수 없을 때 발생하는 예외
 */
export class AnalysisNotFoundException extends NotFoundException {
  constructor(analysisId: string) {
    super({
      statusCode: 404,
      message: `분석 결과를 찾을 수 없습니다. (ID: ${analysisId})`,
      error: 'Analysis Not Found',
    });
  }
}
