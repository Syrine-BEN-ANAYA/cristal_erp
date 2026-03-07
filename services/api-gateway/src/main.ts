import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- Activer CORS pour le front ---
  app.enableCors({
    origin: '*', // tu peux mettre ton URL front
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // --- Validation globale des DTOs ---
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // --- Logging global ---
  app.useGlobalInterceptors(new LoggingInterceptor());

  // --- Gestion globale des exceptions ---
  app.useGlobalFilters(new HttpExceptionFilter());

  const PORT = 3004;
  await app.listen(PORT);

  Logger.log(`🚀 API-Gateway démarrée sur le port ${PORT}`);
}

bootstrap();
