import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { ImageUploadFailedException } from '../analysis/exceptions';

interface UploadResult {
  imageUrl: string;
  thumbnailUrl: string;
  imageKey: string;
  imageSize: number;
}

/**
 * AWS S3 이미지 업로드 서비스
 */
@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION', 'ap-northeast-2');
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET', 'femcare-images');

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      },
    });
  }

  /**
   * 이미지 업로드 (원본 + 썸네일)
   */
  async uploadImage(file: Express.Multer.File, userId: string): Promise<UploadResult> {
    try {
      const imageKey = `analysis/${userId}/${uuidv4()}.jpg`;
      const thumbnailKey = `analysis/${userId}/thumb_${uuidv4()}.jpg`;

      // 원본 이미지 리사이징 (최대 1920x1920)
      const processedImage = await sharp(file.buffer)
        .resize(1920, 1920, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 90 })
        .toBuffer();

      // 썸네일 생성 (400x400)
      const thumbnail = await sharp(file.buffer)
        .resize(400, 400, {
          fit: 'cover',
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      // 원본 이미지 업로드
      await this.uploadToS3(imageKey, processedImage, 'image/jpeg');

      // 썸네일 업로드
      await this.uploadToS3(thumbnailKey, thumbnail, 'image/jpeg');

      const imageUrl = this.getPublicUrl(imageKey);
      const thumbnailUrl = this.getPublicUrl(thumbnailKey);

      this.logger.log(`Image uploaded successfully: ${imageKey}`);

      return {
        imageUrl,
        thumbnailUrl,
        imageKey,
        imageSize: processedImage.length,
      };
    } catch (error) {
      this.logger.error(`Image upload failed: ${error.message}`, error.stack);
      throw new ImageUploadFailedException(error.message);
    }
  }

  /**
   * S3에 파일 업로드
   */
  private async uploadToS3(key: string, buffer: Buffer, contentType: string): Promise<void> {
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read',
      },
    });

    await upload.done();
  }

  /**
   * S3에서 파일 삭제
   */
  async deleteImage(imageKey: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: imageKey,
      });

      await this.s3Client.send(command);

      // 썸네일도 삭제 (키 패턴 기반)
      const parts = imageKey.split('/');
      const fileName = parts[parts.length - 1];
      const thumbnailKey = imageKey.replace(fileName, `thumb_${fileName}`);

      const thumbnailCommand = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: thumbnailKey,
      });

      await this.s3Client.send(thumbnailCommand);

      this.logger.log(`Image deleted successfully: ${imageKey}`);
    } catch (error) {
      this.logger.error(`Image deletion failed: ${error.message}`, error.stack);
      // 삭제 실패는 critical하지 않으므로 예외를 던지지 않음
    }
  }

  /**
   * 공개 URL 생성
   */
  private getPublicUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
