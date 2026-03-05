import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Audit, AuditDocument } from './schemas/audit.schema';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(Audit.name) private auditModel: Model<AuditDocument>,
  ) {}

  /**
   * Log une action utilisateur pour audit
   * @param log { userId, action, entity, timestamp (optionnel) }
   */
  async log(log: {
    userId: string;
    action: string;
    entity: string;
    timestamp?: Date;
  }) {
    const audit = new this.auditModel({
      userId: log.userId,
      action: log.action,
      entity: log.entity,
      timestamp: log.timestamp || new Date(),
    });

    await audit.save();
  }

  /**
   * Récupérer tous les audits pour un utilisateur donné
   * @param userId
   */
  async findByUser(userId: string) {
    return this.auditModel
      .find({ userId })
      .sort({ timestamp: -1 })
      .lean();
  }

  /**
   * Récupérer tous les audits (pour ADMIN / SUPER_ADMIN)
   */
  async findAll() {
    return this.auditModel.find().sort({ timestamp: -1 }).lean();
  }
}