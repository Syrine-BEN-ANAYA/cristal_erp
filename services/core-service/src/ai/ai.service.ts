// ai.service.ts

import { Injectable } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Injectable()
export class AiService {

  constructor(
    private readonly analyticsService: AnalyticsService,
  ) {}

  // MAIN AI ENTRY
  async ask(question: string) {

    const q = question.toLowerCase().trim();

    // ================= DETECT INTENT =================
    const detected = this.detectIntent(q);

    // ================= EXECUTE =================
    const data = await this.executeIntent(detected);

    // ================= RESPONSE =================
    return {
      success: true,
      question,
      intent: detected.intent,
      chartType: this.getChartType(detected.intent),
      answer: this.generateAnswer(detected.intent, data),
      data,
    };
  }

  // DETECT INTENT + ENTITIES
  private detectIntent(q: string): any {

    // ================= TOTAL REVENUE =================
    if (
      q.includes('revenue') ||
      q.includes('income') ||
      q.includes('sales') ||
      q.includes('profit')||
      q.includes('gain')||
      q.includes('recent profit')||
      q.includes('today sales')||
      q.includes('recent sales')




    ) {
      return {
        intent: 'TOTAL_REVENUE'
      };
    }

    // ================= TOTAL ORDERS =================
    if (
      q.includes('how many orders') ||
      q.includes('orders count') ||
      q.includes('total orders')||
      q.includes('orders')||
      q.includes('total sales')||
      q.includes(' sales')||
      q.includes('list orders')||
      q.includes('list sales')



    ) {
      return {
        intent: 'ORDERS_COUNT'
      };
    }

    // ================= TODAY ORDERS =================
    if (
      q.includes('orders today') ||
      q.includes('today orders')
    ) {
      return {
        intent: 'TODAY_ORDERS'
      };
    }

    // ================= TOP PRODUCTS =================
    if (
      q.includes('top products') ||
      q.includes('best products') ||
      q.includes('most sold') ||
      q.includes('top selling')||
      q.includes('best products')||
      q.includes('list products')


    ) {
      return {
        intent: 'TOP_PRODUCTS'
      };
    }

    // ================= TOP CUSTOMERS =================
    if (
      q.includes('top customers') ||
      q.includes('best customers') ||
     q.includes(' customers') ||
     q.includes('list customers') ||


      q.includes('highest customers')

    ) {
      return {
        intent: 'TOP_CUSTOMERS'
      };
    }

    // ================= LOW STOCK =================
    if (
      q.includes('low stock') ||
      q.includes('stock alert') ||
      q.includes('inventory')
    ) {
      return {
        intent: 'STOCK_ALERTS'
      };
    }

    // ================= BIGGEST ORDERS =================
    if (
      q.includes('largest orders') ||
      q.includes('biggest orders')
    ) {
      return {
        intent: 'BIGGEST_ORDERS'
      };
    }

    // ================= AVERAGE ORDER =================
    if (
      q.includes('average order') ||
      q.includes('average value')
    ) {
      return {
        intent: 'AVERAGE_ORDER_VALUE'
      };
    }

    // ================= ORDERS ABOVE AMOUNT =================
    if (
      q.includes('orders above') ||
      q.includes('greater than')
    ) {

      const amount = this.extractAmount(q);

      return {
        intent: 'ORDERS_ABOVE_AMOUNT',
        amount,
      };
    }

    // ================= RECENT ORDERS =================
    if (
      q.includes('recent orders') ||
      q.includes('latest orders')
    ) {
      return {
        intent: 'RECENT_ORDERS'
      };
    }

    // ================= ALL PRODUCTS =================
    if (
      q.includes('all products') ||
      q.includes('list products') ||
      q.includes('stock') ||
      q.includes('products') ||
       q.includes('product') ||
      q.includes('products list')
    ) {
      return {
        intent: 'ALL_PRODUCTS'
      };
    }

    // ================= ALL CUSTOMERS =================
    if (
      q.includes('all customers') ||
      q.includes('customers list')||
    q.includes('customers ')||
     q.includes('customers list')


    ) {
      return {
        intent: 'ALL_CUSTOMERS'
      };
    }

    return {
      intent: 'UNKNOWN'
    };
  }

  // =====================================================
  // EXECUTE ANALYTICS
  // =====================================================
  private async executeIntent(detected: any) {

    const { intent } = detected;

    switch (intent) {

      case 'TOTAL_REVENUE':
        return this.analyticsService.getTotalRevenue();

      case 'ORDERS_COUNT':
        return this.analyticsService.getOrdersCount();

      case 'TODAY_ORDERS':
        return this.analyticsService.getTodayOrders();

      case 'TOP_PRODUCTS':
        return this.analyticsService.getTopProducts();

      case 'TOP_CUSTOMERS':
        return this.analyticsService.getTopCustomers();

      case 'STOCK_ALERTS':
        return this.analyticsService.getStockAlerts();

      case 'BIGGEST_ORDERS':
        return this.analyticsService.getBiggestOrders();

      case 'AVERAGE_ORDER_VALUE':
        return this.analyticsService.getAverageOrderValue();

      case 'ORDERS_ABOVE_AMOUNT':
        return this.analyticsService.getOrdersAboveAmount(
          detected.amount,
        );

      case 'RECENT_ORDERS':
        return this.analyticsService.getRecentOrders();

      case 'ALL_PRODUCTS':
        return this.analyticsService.getAllProducts();

      case 'ALL_CUSTOMERS':
        return this.analyticsService.getAllCustomers();

      default:
        return [];
    }
  }

  // =====================================================
  // AI ANSWERS
  // =====================================================
  private generateAnswer(intent: string, data: any): string {

    switch (intent) {

      case 'TOTAL_REVENUE':
        return `Total ERP revenue is ${data.totalRevenue} OMR`;

      case 'ORDERS_COUNT':
        return `There are ${data.totalOrders} orders in the ERP`;

      case 'TODAY_ORDERS':
        return `Found ${data.length} orders created today`;

      case 'TOP_PRODUCTS':
        return `Here are the best selling products`;

      case 'TOP_CUSTOMERS':
        return `These customers generated the highest revenue`;

      case 'STOCK_ALERTS':
        return `These products are low in stock`;

      case 'BIGGEST_ORDERS':
        return `Here are the largest customer orders`;

      case 'AVERAGE_ORDER_VALUE':
        return `Average order value is ${data.averageOrderValue} OMR`;

      case 'ORDERS_ABOVE_AMOUNT':
        return `Found ${data.length} orders above requested amount`;

      case 'RECENT_ORDERS':
        return `Here are the latest orders`;

      case 'ALL_PRODUCTS':
        return `Here is the products catalog`;

      case 'ALL_CUSTOMERS':
        return `Here is the customers list`;

      default:
        return `
I can help with:
- revenue
- orders
- products
- customers
- suppliers
- stock
`;
    }
  }

  // =====================================================
  // CHART TYPES
  // =====================================================
  private getChartType(intent: string) {

    switch (intent) {

      case 'TOTAL_REVENUE':
        return 'card';

      case 'ORDERS_COUNT':
        return 'card';

      case 'TOP_PRODUCTS':
        return 'bar';

      case 'TOP_CUSTOMERS':
        return 'bar';

      case 'STOCK_ALERTS':
        return 'table';

      case 'BIGGEST_ORDERS':
        return 'table';

      case 'AVERAGE_ORDER_VALUE':
        return 'card';

      case 'ORDERS_ABOVE_AMOUNT':
        return 'table';

      case 'RECENT_ORDERS':
        return 'table';

      case 'ALL_PRODUCTS':
        return 'table';

      case 'ALL_CUSTOMERS':
        return 'table';

      default:
        return null;
    }
  }

  // =====================================================
  // EXTRACT NUMBER FROM QUESTION
  // =====================================================
  private extractAmount(q: string): number {

    const match = q.match(/\d+/);

    return match ? Number(match[0]) : 0;
  }
}