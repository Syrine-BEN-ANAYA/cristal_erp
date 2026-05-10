import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuditService } from './audit.service';

@Injectable()
export class AuditCron {
  private readonly logger = new Logger(AuditCron.name);

  constructor(private readonly auditService: AuditService) {}

  // ✅ S'exécute le 1er de chaque mois à 00:00
  @Cron('0 0 0 1 * *')
  async handleMonthlyCleanup() {
    this.logger.log('Début du nettoyage mensuel des logs...');
    
    const result = await this.auditService.autoCleanup();
    
    this.logger.log(`Nettoyage terminé: ${result.deletedCount} logs supprimés (${result.reason})`);
    
    // Ici tu peux ajouter une notification (email, WebSocket, etc.)
  }
}