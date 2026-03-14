import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ProductThresholdDto } from './dto/product-threshold.dto';
import { N8nService } from '../n8n/n8n.service';

@Injectable()
export class EventsService {
  constructor(private readonly n8nService: N8nService) {}

  @OnEvent('product.threshold.reached')
  async handleProductThreshold(event: ProductThresholdDto) {
    console.log('Low stock detected:', event);

    try {
      await this.n8nService.triggerWorkflow('product_threshold_alert', event);
      console.log('Workflow triggered successfully in n8n');
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.error('Error triggering n8n workflow:', error.message);
    }
  }
}
