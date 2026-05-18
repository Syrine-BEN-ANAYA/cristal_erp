// purchase.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Res,
} from '@nestjs/common';

import { Response } from 'express';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

@Controller('purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  create(@Body() dto: CreatePurchaseDto) {
    return this.purchaseService.createPurchase(dto);
  }

  @Get()
  findAll() {
    return this.purchaseService.findAll();
  }

  @Get('total')
  getTotal() {
    return this.purchaseService.getTotalPurchaseAmount();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseDto) {
    return this.purchaseService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchaseService.remove(id);
  }

  @Get(':id/invoice')
  generateInvoice(@Param('id') id: string, @Res() res: Response) {
    return this.purchaseService.generateInvoice(id, res);
  }
}