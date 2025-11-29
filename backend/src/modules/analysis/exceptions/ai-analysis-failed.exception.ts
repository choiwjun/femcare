import { InternalServerErrorException } from '@nestjs/common';

/**
 * AI 분석 실패 시 발생하는 예외
 */
export class AIAnalysisFailedException extends InternalServerErrorException {
  constructor(reason?: string) {
    super({
      statusCode: 500,
      message: reason
        ? `AI 분석에 실패했습니다: ${reason}`
        : 'AI 분석에 실패했습니다. 잠시 후 다시 시도해주세요.',
      error: 'AI Analysis Failed',
    });
  }
}
