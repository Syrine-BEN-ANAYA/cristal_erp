import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { UserRole } from './users/schemas/user.schema';
import { CreateUserDto } from './users/dto/create-user.dto';

async function bootstrap() {
  // DEBUG : vérifier les variables d'environnement chargées
  console.log('MONGO_URI =', process.env.MONGO_URI);
  console.log('PORT =', process.env.PORT);

  const app = await NestFactory.create(AppModule);

  // Configuration CORS (une seule fois suffit)
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3105',
    credentials: true,
  });

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const usersService = app.get(UsersService);

  try {
    // Vérifie si un SUPER_ADMIN existe déjà
    const existingSuperAdmins = await usersService.findAll({
      role: UserRole.SUPER_ADMIN,
    });

    if (!existingSuperAdmins.length) {
      const superAdminPassword = process.env.SUPERADMIN_PASSWORD;

      if (!superAdminPassword) {
        throw new Error('SUPERADMIN_PASSWORD non défini dans .env');
      }

      const dto: CreateUserDto = {
        username: process.env.SUPERADMIN_USERNAME!,
        password: superAdminPassword,
        role: UserRole.SUPER_ADMIN,
      };

      await usersService.create(dto, {
        _id: 'SYSTEM',
        role: UserRole.SUPER_ADMIN,
      });

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