import { Injectable } from '@nestjs/common';

export type IntentType =
  | 'TOP_PRODUCTS'
  | 'TOP_REVENUE'
  | 'STOCK_ALERTS'
  | 'UNKNOWN';

@Injectable()
export class IntentService {

  detectIntent(question: string): IntentType {
    const q = question.toLowerCase();

    // ---------------- TOP PRODUCTS ----------------
    if (
      q.includes('top') &&
      (q.includes('product') || q.includes('selling') || q.includes('best'))
    ) {
      return 'TOP_PRODUCTS';
    }

    // ---------------- REVENUE ----------------
    if (
      q.includes('revenue') ||
      q.includes('chiffre') ||
      q.includes('profit') ||
      q.includes('earnings')
    ) {
      return 'TOP_REVENUE';
    }

    // ---------------- STOCK ----------------
    if (
      q.includes('stock') ||
      q.includes('low stock') ||
      q.includes('rupture') ||
      q.includes('inventory')
    ) {
      return 'STOCK_ALERTS';
    }

    return 'UNKNOWN';
  }
}