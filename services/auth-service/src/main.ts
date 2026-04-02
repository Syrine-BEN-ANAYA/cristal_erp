import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { UserRole } from './users/schemas/user.schema';
import * as client from 'prom-client';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- Metrics Prometheus ---
  client.collectDefaultMetrics(); // collecte métriques Node.js
  // Middleware Express global pour /metrics
  app.use('/metrics', async (req: Request, res: Response) => {
    res.setHeader('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  });

  // --- Configuration CORS ---
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3105',
    credentials: true,
  });

  // --- Validation globale ---
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // --- Création SUPER_ADMIN ---
  const usersService = app.get(UsersService);
  try {
    const existingSuperAdmins = await usersService.findAll({ role: UserRole.SUPER_ADMIN });
    if (!existingSuperAdmins.length) {
      const superAdminPassword = process.env.SUPERADMIN_PASSWORD;
      if (!superAdminPassword) throw new Error('SUPERADMIN_PASSWORD non défini dans .env');

      await usersService.create(
        {
          username: process.env.SUPERADMIN_USERNAME!,
          password: superAdminPassword,
          role: UserRole.SUPER_ADMIN,
        },
        { _id: 'SYSTEM', role: UserRole.SUPER_ADMIN },
      );
      console.log('SUPER_ADMIN créé avec succès');
    } else {
      console.log('SUPER_ADMIN déjà existant');
    }
  } catch (error) {
    console.error('Erreur lors de la création du SUPER_ADMIN:', error);
  }

  const port = process.env.PORT || 3101;
  await app.listen(port);
  console.log(`Auth Service running on http://localhost:${port}`);
}

bootstrap();