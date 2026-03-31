import { Controller, Get, Post, Param, Body, Delete, Put, Res, UseGuards } from '@nestjs/common';
import express from 'express';
import PDFDocument from 'pdfkit';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDocument } from './schemas/order.schema';
import { JwtLocalGuard } from 'src/common/guards/jwt-local.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('orders')
@UseGuards(JwtLocalGuard, RolesGuard) 
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
    @Roles('SUPER_ADMIN', 'USER')
  
  async create(@Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(dto);
  }

  @Get('total')
    @Roles('SUPER_ADMIN', 'USER')

  async getTotalOrderAmount() {
    return this.ordersService.getTotalOrderAmount();
  }

  @Get()
    @Roles('SUPER_ADMIN', 'USER')

  async findAll() {
    return this.ordersService.findAll();
  }

  @Put(':id')
    @Roles('SUPER_ADMIN', 'USER')

  async update(
    @Param('id') id: string,
    @Body() dto: CreateOrderDto,
  ): Promise<OrderDocument> {
    return this.ordersService.updateOrder(id, dto);
  }

  @Get(':id')
    @Roles('SUPER_ADMIN', 'USER')

  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Delete(':id')
    @Roles('SUPER_ADMIN', 'USER')

  async remove(@Param('id') id: string) {
    return this.ordersService.removeOrder(id);
  }

  // --- Endpoint de facture PDF ---
  @Get(':id/invoice')
    @Roles('SUPER_ADMIN', 'USER')

  async getInvoice(@Param('id') orderId: string, @Res() res: express.Response) {
    // Utiliser le service pour récupérer la commande (qui popule déjà customerId et items.productId)
    const order = await this.ordersService.findOne(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Créer le document PDF
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=invoice-${orderId}.pdf`);
    doc.pipe(res);

    // En-tête
    doc.fontSize(20).text('AL RUBAI UNITED AL CRISTAL', { align: 'center' });
    doc.fontSize(10).text('INVOICE', { align: 'center' }).moveDown();
    doc.fontSize(12).text(`Order ID: ${order._id}`, { align: 'right' });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();

    // Informations client
    const customer = order.customerId as any;
    doc.fontSize(12).text(`Customer: ${customer.name}`, { underline: true });
    doc.text(`Email: ${customer.email}`);
    doc.moveDown();

    // En-têtes du tableau
    const startX = 50;
    let y = doc.y;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Product', startX, y);
    doc.text('Quantity', startX + 250, y);
    doc.text('Unit Price', startX + 350, y);
    doc.text('Total', startX + 450, y);
    doc.moveDown();

    // Lignes du tableau
    doc.font('Helvetica');
    for (const item of order.items) {
      const product = item.productId as any;
      const itemTotal = product.price * item.quantity;
      y = doc.y;
      doc.text(product.name, startX, y);
      doc.text(item.quantity.toString(), startX + 250, y);
      doc.text(`$${product.price.toFixed(2)}`, startX + 350, y);
      doc.text(`$${itemTotal.toFixed(2)}`, startX + 450, y);
      doc.moveDown();
    }

    doc.moveDown();
    doc.font('Helvetica-Bold');
    doc.text(`Total: $${order.totalAmount.toFixed(2)}`, startX + 450, doc.y);
    doc.font('Helvetica');

    doc.fontSize(8).text('Thank you for your business!', startX, doc.y + 20, { align: 'center' });
    doc.end();
  }
}