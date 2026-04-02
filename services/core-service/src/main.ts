import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtLocalGuard } from './common/guards/jwt-local.guard';
import * as client from 'prom-client';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);

  // --- Guards ---
  app.useGlobalGuards(new JwtLocalGuard(), new RolesGuard(reflector));

  // --- CORS ---
  app.enableCors({
    origin: 'http://localhost:3105',
    credentials: true,
  });

  // --- Metrics Prometheus ---
  client.collectDefaultMetrics();
  // Middleware global pour /metrics
  app.use('/metrics', async (req: Request, res: Response) => {
    res.setHeader('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  });

  const port = process.env.PORT || 3102;
  await app.listen(port);
  console.log(`Core service running on http://localhost:${port}`);
}

bootstrap();