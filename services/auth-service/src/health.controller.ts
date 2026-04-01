// src/health.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  @Public() 
  check() {
    return { status: 'ok' }; // PUBLIC: aucun JWT requis
  }
}

function Public(): (target: HealthController, propertyKey: "check", descriptor: TypedPropertyDescriptor<() => { status: string; }>) => void | TypedPropertyDescriptor<() => { status: string; }> {
    throw new Error('Function not implemented.');
}
