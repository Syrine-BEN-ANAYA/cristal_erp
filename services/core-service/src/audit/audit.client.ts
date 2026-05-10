import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuditClient {
  private readonly logger = new Logger(AuditClient.name);
  private authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3101';

  async log(data: {
    userId: string;
    username: string;
    action: string;
    entity: string;
    ip?: string;
    endpoint?: string;
    details?: any;
  }) {
    try {
      await axios.post(`${this.authServiceUrl}/audits/remote-log`, data, {
        headers: { 
          'x-internal-token': process.env.INTERNAL_API_KEY || 'internal-secret'
        }
      });
    } catch (error: any) { 
      this.logger.error(`Failed to send audit log: ${error?.message || 'Unknown error'}`);
    }
  }
}