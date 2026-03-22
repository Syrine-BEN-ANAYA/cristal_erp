import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import type { Response as ExpressResponse } from 'express'; // ✅ important le "type" ici

@Controller('purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Get(':id/invoice')
  async getInvoice(@Param('id') id: string, @Res() res: ExpressResponse) {
    // Cast pour correspondre au type attendu par NestJS
    return this.purchaseService.generateInvoice(id, res as any);
  }
  @Post()
  // @Roles('ADMIN', 'MANAGER')
  async create(@Body() createPurchaseDto: CreatePurchaseDto, @Req() req) {
    // Si vous voulez passer l'utilisateur connecté, vous pouvez le faire via req.user, mais le service n'en a pas besoin ici.
    return this.purchaseService.createPurchase(createPurchaseDto);
  }

  @Get()
  // @Roles('ADMIN', 'MANAGER', 'USER')
  async findAll() {
    return this.purchaseService.findAll();
  }
  @Get('total')
async getTotalPurchaseAmount() {
  const total = await this.purchaseService.getTotalPurchaseAmount();
  return { totalPurchaseAmount: total };
}

  @Get(':id')
  // @Roles('ADMIN', 'MANAGER', 'USER')
  async findOne(@Param('id') id: string) {
    return this.purchaseService.findOne(id);
  }
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseDto) {
    return this.purchaseService.update(id, dto);
  }

}
