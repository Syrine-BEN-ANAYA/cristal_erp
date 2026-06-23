// ai.controller.ts

import {
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';

import { AiService } from './ai.service';

@Controller('ai')
export class AiController {

  constructor(
    private readonly aiService: AiService,
  ) {}

  @Post('ask')
  async ask(@Body() body: { question: string }) {

    return this.aiService.ask(body.question);
  }


  @Get()
  async askGet(
    @Query('q') question: string,
  ) {

    return this.aiService.ask(question);
  }
}