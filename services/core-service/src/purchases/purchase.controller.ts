import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Response } from 'express';

@Controller('purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async create(@Body() dto: CreatePurchaseDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.purchaseService.createPurchase(dto, user, req);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'USER')
  async findAll(@Req() req: Request) {
    const user = (req as any).user;
    return this.purchaseService.findAll(user, req);
  }

  @Get('total')
  @Roles('SUPER_ADMIN', 'ADMIN', 'USER')
  async getTotalPurchaseAmount(@Req() req: Request) {
    const user = (req as any).user;
    return this.purchaseService.getTotalPurchaseAmount(user, req);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'USER')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.purchaseService.findOne(id, user, req);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdatePurchaseDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.purchaseService.update(id, dto, user, req);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.purchaseService.remove(id, user, req);
  }

  @Get(':id/invoice')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async generateInvoice(@Param('id') id: string, @Res() res: Response, @Req() req: Request) {
    const user = (req as any).user;
    return this.purchaseService.generateInvoice(id, res, user, req);
  }
}