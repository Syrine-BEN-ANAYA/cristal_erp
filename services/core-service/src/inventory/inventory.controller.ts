import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { StockInDto } from './dto/stock-in.dto';
import { StockOutDto } from './dto/stock-out.dto';

@Controller('inventory')
//@UseGuards(JwtLocalGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // --- Ajouter du stock ---
  @Post('in')
  async stockIn(@Body() dto: StockInDto) {
    return this.inventoryService.stockIn(dto);
  }

  // --- Retirer du stock ---
  @Post('out')
  async stockOut(@Body() dto: StockOutDto) {
    return this.inventoryService.stockOut(dto);
  }

  // --- Vérifier le stock d’un produit ---
  @Get(':productId')
  async checkStock(@Param('productId') productId: string) {
    return this.inventoryService.checkStock(productId);
  }

  // --- Lister tout le stock ---
  @Get()
  async getAll() {
    return this.inventoryService.getAll();
  }

  // --- Rebuild inventory (repartir à neuf) ---
  @Post('rebuild')
  async rebuild() {
    return this.inventoryService.rebuildInventory();
  }
}