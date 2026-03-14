import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { N8nModule } from './n8n/n8n.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(), // <-- active le bus d'événements
    N8nModule,
    EventsModule,
  ],
})
export class AppModule {}
