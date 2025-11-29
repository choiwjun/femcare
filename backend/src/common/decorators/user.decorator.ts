import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 현재 인증된 사용자를 가져오는 데코레이터
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
