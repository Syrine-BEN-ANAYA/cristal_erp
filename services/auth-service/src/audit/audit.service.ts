import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Audit, AuditDocument } from './schemas/audit.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

interface FindAllOptions {
  page: number;
  limit: number;
  userId?: string;
  action?: string;
  entity?: string;
}

// ✅ Définir un type pour les logs avec timestamps
interface AuditWithTimestamps extends Audit {
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(Audit.name) private auditModel: Model<AuditDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async log(data: {
    userId: string;
    action: string;
    entity: string;
    username?: string;
    ip?: string;
    endpoint?: string;
    details?: Record<string, any>;
  }): Promise<void> {
    const audit = new this.auditModel({
      userId: data.userId,
      username: data.username || 'unknown',
      action: data.action,
      entity: data.entity,
      ip: data.ip,
      endpoint: data.endpoint,
      details: data.details,
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
    
    const enrichedData = await this.enrichWithUserInfo(data);
    return { data: enrichedData, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findAll(options: FindAllOptions) {
    const { page, limit, userId, action, entity } = options;
    const skip = (page - 1) * limit;
    
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
    
    const enrichedData = await this.enrichWithUserInfo(data);
    return { data: enrichedData, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async countLogs(): Promise<number> {
    return this.auditModel.countDocuments();
  }

  // ✅ CORRECTION FINALE: Utiliser as any pour contourner l'erreur TypeScript
  async getStorageStats(): Promise<{
    totalLogs: number;
    oldestLogDate: Date | null;
    newestLogDate: Date | null;
    logsByMonth: any[];
  }> {
    const totalLogs = await this.auditModel.countDocuments();
    
    // ✅ Solution 1: Utiliser as any
    const oldestLog = await this.auditModel
      .findOne()
      .sort({ createdAt: 1 })
      .select('createdAt')
      .lean() as any;
    
    const newestLog = await this.auditModel
      .findOne()
      .sort({ createdAt: -1 })
      .select('createdAt')
      .lean() as any;
    
    const logsByMonth = await this.auditModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);
    
    return {
      totalLogs,
      oldestLogDate: oldestLog?.createdAt || null,
      newestLogDate: newestLog?.createdAt || null,
      logsByMonth,
    };
  }

  async deleteLogsOlderThan(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const result = await this.auditModel.deleteMany({
      createdAt: { $lt: cutoffDate }
    });
    
    return result.deletedCount;
  }

  async deleteLogsExceedingLimit(maxLogs: number): Promise<number> {
    const totalLogs = await this.auditModel.countDocuments();
    
    if (totalLogs <= maxLogs) {
      return 0;
    }
    
    const toDelete = totalLogs - maxLogs;
    
    const logsToDelete = await this.auditModel
      .find()
      .sort({ createdAt: 1 })
      .limit(toDelete)
      .select('_id')
      .lean();
    
    const idsToDelete = logsToDelete.map(log => log._id);
    const result = await this.auditModel.deleteMany({ _id: { $in: idsToDelete } });
    
    return result.deletedCount;
  }

  async autoCleanup(): Promise<{ deletedCount: number; reason: string }> {
    const MAX_LOGS = 1000;
    const MAX_DAYS = 90;
    
    const totalLogs = await this.auditModel.countDocuments();
    let deletedCount = 0;
    let reason = '';
    
    if (totalLogs > MAX_LOGS) {
      deletedCount = await this.deleteLogsExceedingLimit(MAX_LOGS);
      reason = `Logs exceed limit of ${MAX_LOGS}`;
    } else {
      deletedCount = await this.deleteLogsOlderThan(MAX_DAYS);
      reason = `Logs older than ${MAX_DAYS} days`;
    }
    
    return { deletedCount, reason };
  }

  async resetAllLogs(): Promise<number> {
    const result = await this.auditModel.deleteMany({});
    return result.deletedCount;
  }

  private async enrichWithUserInfo(logs: any[]): Promise<any[]> {
    if (!logs.length) return logs;
    
    const userIds = [...new Set(logs.map(log => log.userId).filter(id => id))];
    
    if (!userIds.length) return logs;
    
    const users = await this.userModel
      .find({ _id: { $in: userIds } })
      .select('username email')
      .lean();
    
    const userMap = new Map();
    users.forEach(user => {
      userMap.set(user._id.toString(), user);
    });
    
    return logs.map(log => {
      const user = userMap.get(log.userId);
      return {
        ...log,
        username: user?.username || log.username || log.userId?.slice(-8),
        userEmail: user?.email || null,
      };
    });
  }
  
  async findAllForExport(filter: any = {}): Promise<any[]> {
  return this.auditModel
    .find(filter)
    .sort({ createdAt: -1 })
    .lean();
}
async deleteLogsByDateRange(startDate: Date, endDate: Date): Promise<number> {
  const filter = {
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  const result = await this.auditModel.deleteMany(filter);
  return result.deletedCount;
}
async getLogsByMonth(year: number, month: number): Promise<any[]> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  return this.auditModel
    .find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .sort({ createdAt: -1 })
    .lean();
}
async getLogsCountByMonth(year: number, month: number): Promise<number> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  return this.auditModel.countDocuments({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  });
}
}