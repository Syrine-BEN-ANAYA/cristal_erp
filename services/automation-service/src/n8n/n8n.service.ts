import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class N8nService {
  private readonly n8nUrl: string;

  constructor() {
    this.n8nUrl = process.env.N8N_URL || 'http://n8n:5678';
  }

  async triggerWorkflow(workflow: string, payload: any) {
    const url = `${this.n8nUrl}/webhook/${workflow}`;
    await axios.post(url, payload);
  }
}
