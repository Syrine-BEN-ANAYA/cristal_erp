import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { N8nModule } from '../n8n/n8n.module';

@Module({
  imports: [N8nModule],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
