import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * 분석 결과의 소유자 확인 가드
 */
@Injectable()
export class AnalysisOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const analysisId = request.params.id;

    if (!user || !analysisId) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    const analysis = await this.prisma.analysis.findUnique({
      where: { id: analysisId },
      select: { userId: true },
    });

    if (!analysis) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    if (analysis.userId !== user.id) {
      throw new ForbiddenException('본인의 분석 결과만 접근할 수 있습니다.');
    }

    return true;
  }
}
