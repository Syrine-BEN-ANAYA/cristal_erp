import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';

@Controller('purchases')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

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

  @Get(':id')
  // @Roles('ADMIN', 'MANAGER', 'USER')
  async findOne(@Param('id') id: string) {
    return this.purchaseService.findOne(id);
  }
  
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  // @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    await this.purchaseService.remove(id);
  }
}