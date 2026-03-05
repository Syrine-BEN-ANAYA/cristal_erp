import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Alert, AlertDocument } from './schemas/alert.schema';

@Injectable()
export class AlertsService {
  constructor(
    @InjectModel(Alert.name)
    private alertModel: Model<AlertDocument>,
  ) {}

  async setAlert(dto: { productId: string; threshold: number; currentQuantity?: number }) {
    let alert = await this.alertModel.findOne({ productId: dto.productId });
    if (!alert) {
      alert = new this.alertModel({
        productId: dto.productId,
        threshold: dto.threshold,
        currentQuantity: dto.currentQuantity ?? 0,
      });
    } else {
      alert.threshold = dto.threshold;
      if (dto.currentQuantity !== undefined) {
        alert.currentQuantity = dto.currentQuantity;
        alert.active = dto.currentQuantity <= dto.threshold;
      }
    }
    return alert.save();
  }

  async checkAlert(productId: string, currentQuantity: number) {
    const alert = await this.alertModel.findOne({ productId });
    if (!alert) return;

    alert.currentQuantity = currentQuantity;
    alert.active = currentQuantity <= alert.threshold;
    await alert.save();
  }

  async findAll(): Promise<Alert[]> {
    return this.alertModel.find();
  }

  async findOne(productId: string): Promise<Alert> {
    const alert = await this.alertModel.findOne({ productId });
    if (!alert) throw new NotFoundException('Alerte non trouvée');
    return alert;
  }

  // ---------------- DELETE ALERT ----------------
  async delete(productId: string): Promise<{ message: string }> {
    const alert = await this.alertModel.findOne({ productId });
    if (!alert) throw new NotFoundException('Alerte non trouvée');

    await this.alertModel.deleteOne({ productId });
    return { message: `Alerte pour le produit ${productId} supprimée avec succès` };
  }
}