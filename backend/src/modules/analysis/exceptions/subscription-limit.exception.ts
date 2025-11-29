import { ForbiddenException } from '@nestjs/common';

/**
 * 구독 한도를 초과했을 때 발생하는 예외
 */
export class SubscriptionLimitException extends ForbiddenException {
  constructor(currentCount: number, maxCount: number) {
    super({
      statusCode: 403,
      message: `이번 달 분석 횟수를 모두 사용하셨습니다. (${currentCount}/${maxCount})`,
      error: 'Subscription Limit Exceeded',
      upgradeRequired: true,
    });
  }
}
