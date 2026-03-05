import { Controller, Post, Body, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { SetAlertDto } from './dto/set-alert.dto';
import { JwtLocalGuard } from 'src/common/guards/jwt-local.guard';

@Controller('alerts')
@UseGuards(JwtLocalGuard) // appliquer le guard à toutes les routes
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  // Créer ou mettre à jour une alerte
  @Post()
  async setAlert(@Body() dto: SetAlertDto) {
    return this.alertsService.setAlert(dto);
  }

  // Lister toutes les alertes
  @Get()
  async findAll() {
    return this.alertsService.findAll();
  }

  // Récupérer une alerte par produit
  @Get(':productId')
  async findOne(@Param('productId') productId: string) {
    return this.alertsService.findOne(productId);
  }

  // Supprimer une alerte par produit
  @Delete(':productId')
  async delete(@Param('productId') productId: string) {
    return this.alertsService.delete(productId);
  }
}