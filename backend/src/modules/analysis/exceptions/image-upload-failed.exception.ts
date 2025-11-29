import { InternalServerErrorException } from '@nestjs/common';

/**
 * 이미지 업로드 실패 시 발생하는 예외
 */
export class ImageUploadFailedException extends InternalServerErrorException {
  constructor(reason?: string) {
    super({
      statusCode: 500,
      message: reason
        ? `이미지 업로드에 실패했습니다: ${reason}`
        : '이미지 업로드에 실패했습니다.',
      error: 'Image Upload Failed',
    });
  }
}
