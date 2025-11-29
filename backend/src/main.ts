import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // 글로벌 Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger 문서 설정
  const config = new DocumentBuilder()
    .setTitle('FemCare API')
    .setDescription('FemCare AI Analysis Backend API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Analysis', 'AI 분석 관련 API')
    .addTag('Auth', '인증/인가 관련 API')
    .addTag('User', '사용자 관련 API')
    .addTag('Subscription', '구독 관련 API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`
  🚀 FemCare Backend Server is running!

  📍 API: http://localhost:${port}
  📚 Swagger Docs: http://localhost:${port}/api/docs
  🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}

  `);
}

bootstrap();
