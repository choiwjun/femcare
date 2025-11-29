import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';

/**
 * 스토리지 모듈 (S3)
 */
@Module({
  providers: [S3Service],
  exports: [S3Service],
})
export class StorageModule {}
