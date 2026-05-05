import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Audit, AuditDocument } from './schemas/audit.schema';

interface FindAllOptions {
  page: number;
  limit: number;
  userId?: string;
  action?: string;
  entity?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(Audit.name) private auditModel: Model<AuditDocument>,
  ) {}

  async log(log: {
    userId: string;
    action: string;
    entity: string;
    ip?: string;
    endpoint?: string;
    details?: Record<string, any>;
  }): Promise<void> {
    const audit = new this.auditModel({
      userId: log.userId,
      action: log.action,
      entity: log.entity,
      ip: log.ip,
      endpoint: log.endpoint,
      details: log.details,
    });
    await audit.save();
  }

  async findByUser(userId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.auditModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.auditModel.countDocuments({ userId }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findAll(options: FindAllOptions) {
    const { page, limit, userId, action, entity } = options;
    const skip = (page - 1) * limit;
    
    // Construction du filtre dynamique
    const filter: any = {};
    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (entity) filter.entity = entity;
    
    const [data, total] = await Promise.all([
      this.auditModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.auditModel.countDocuments(filter),
    ]);
    
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}