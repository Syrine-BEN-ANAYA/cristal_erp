import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import * as client from 'prom-client';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // --- Activer CORS pour le front ---
  app.enableCors({
    origin: '*',
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

  // --- Metrics Prometheus ---
  client.collectDefaultMetrics();

  app.use('/metrics', async (req: Request, res: Response) => {
    res.setHeader('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  });

  const PORT = 3104;
  await app.listen(PORT);

  Logger.log(`🚀 API-Gateway démarrée sur le port ${PORT}`);
}

bootstrap();
