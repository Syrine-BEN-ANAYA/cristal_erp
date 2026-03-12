import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtLocalGuard } from './common/guards/jwt-local.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);

  app.useGlobalGuards(new JwtLocalGuard(), new RolesGuard(reflector));

  app.enableCors({
    origin: 'http://localhost:3105',
    credentials: true,
  });

  await app.listen(process.env.PORT || 3102);
  console.log(`Core service running on http://localhost:${process.env.PORT || 3102}`);
}
bootstrap();