import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtLocalGuard } from '../common/guards/jwt-local.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Response } from 'express';

@Controller('purchases')
@UseGuards(JwtLocalGuard, RolesGuard)
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Get(':id/invoice')
  @Roles('SUPER_ADMIN', 'USER')
  async getInvoice(@Param('id') id: string, @Res() res: Response) {
    return this.purchaseService.generateInvoice(id, res);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'USER')
  async create(@Body() createPurchaseDto: CreatePurchaseDto, @Req() req: Request) {
    return this.purchaseService.createPurchase(createPurchaseDto);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'USER')
  async findAll() {
    return this.purchaseService.findAll();
  }

  @Get('total')
  @Roles('SUPER_ADMIN', 'USER')
  async getTotalPurchaseAmount() {
    const total = await this.purchaseService.getTotalPurchaseAmount();
    return { totalPurchaseAmount: total };
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'USER')
  async findOne(@Param('id') id: string) {
    return this.purchaseService.findOne(id);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'USER')
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseDto) {
    return this.purchaseService.update(id, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'USER')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.purchaseService.remove(id);
  }
}