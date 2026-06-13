import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  HttpException,
  HttpStatus,
  Logger,
  Put,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import type { Request } from 'express';

interface CreateProductDto {
  name: string;
  price: number;
  initialQuantity?: number;
  stock?: number;
  threshold?: number;
  supplierId?: string;
}

interface UpdateProductDto {
  name?: string;
  price?: number;
  initialQuantity?: number;
  stock?: number;
  threshold?: number;
  supplierId?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  initialQuantity: number;
  stock: number;
  threshold: number;
  supplierId?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Controller('products')
export class ProductsGateway {
  private readonly PRODUCTS_SERVICE_URL =
    process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3102';
  private readonly AUTH_SERVICE_URL =
    process.env.AUTH_SERVICE_URL || 'http://localhost:3101';

  constructor() {
    Logger.log('ProductsGateway chargé correctement', 'API-GATEWAY');
  }

  private handleAxiosError(err: AxiosError, defaultMsg: string): never {
    const errResponse = err.response?.data;
    let message = defaultMsg;

    if (errResponse) {
      if (typeof errResponse === 'string') message = errResponse;
      else if ((errResponse as any).message)
        message = (errResponse as any).message;
      else message = JSON.stringify(errResponse, null, 2);
    } else if (err.message) {
      message = err.message;
    }

    throw new HttpException(
      message,
      err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  private getHeaders(req: Request) {
    return { Authorization: req.headers.authorization || '' };
  }

  // ✅ Fonction pour envoyer les logs à auth-service
  private async sendAuditLog(data: {
    userId: string;
    username: string;
    action: string;
    entity: string;
    ip?: string;
    endpoint?: string;
    details?: any;
  }) {
    try {
      await axios.post(`${this.AUTH_SERVICE_URL}/audits/remote-log`, data, {
        headers: {
          'x-internal-token': process.env.INTERNAL_API_KEY || 'internal-secret',
        },
      });
    } catch (error) {
      Logger.error('Failed to send audit log', 'ProductsGateway');
    }
  }

  // -------------------- CRUD --------------------
  @Post()
  async create(
    @Body() dto: CreateProductDto,
    @Req() req: Request,
  ): Promise<Product> {
    try {
      const response = await axios.post<Product>(
        `${this.PRODUCTS_SERVICE_URL}/products`,
        dto,
        { headers: this.getHeaders(req) },
      );

      // ✅ Audit: Création produit
      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'CREATE_PRODUCT',
          entity: 'PRODUCT',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || '/products',
          details: {
            productId: response.data.id,
            name: response.data.name,
            price: response.data.price,
            stock: response.data.stock,
          },
        });
      }

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la création du produit',
      );
    }
  }

  @Get()
  async findAll(@Req() req: Request): Promise<Product[]> {
    try {
      const response = await axios.get<Product[]>(
        `${this.PRODUCTS_SERVICE_URL}/products`,
        { headers: this.getHeaders(req) },
      );

      // ✅ Audit: Consultation liste produits
      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'VIEW_ALL_PRODUCTS',
          entity: 'PRODUCT',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || '/products',
          details: { count: response.data.length },
        });
      }

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la récupération des produits',
      );
    }
  }

  @Get('low-stock/list')
  async getLowStockProducts(@Req() req: Request): Promise<Product[]> {
    try {
      const response = await axios.get<Product[]>(
        `${this.PRODUCTS_SERVICE_URL}/products/low-stock/list`,
        { headers: this.getHeaders(req) },
      );

      // ✅ Audit: Consultation produits en stock faible
      const user = (req as any).user;
      if (user && response.data.length > 0) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'VIEW_LOW_STOCK_PRODUCTS',
          entity: 'PRODUCT',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || '/products/low-stock/list',
          details: {
            count: response.data.length,
            products: response.data.map(p => ({
              id: p.id,
              name: p.name,
              stock: p.stock,
            })),
          },
        });
      }

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la récupération des produits en stock faible',
      );
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Product> {
    try {
      const response = await axios.get<Product>(
        `${this.PRODUCTS_SERVICE_URL}/products/${id}`,
        { headers: this.getHeaders(req) },
      );

      // ✅ Audit: Consultation produit spécifique
      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'VIEW_ONE_PRODUCT',
          entity: 'PRODUCT',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || `/products/${id}`,
          details: {
            productId: id,
            name: response.data.name,
            price: response.data.price,
            stock: response.data.stock,
          },
        });
      }

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la récupération du produit',
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Req() req: Request,
  ): Promise<Product> {
    try {
      const response = await axios.put<Product>(
        `${this.PRODUCTS_SERVICE_URL}/products/${id}`,
        dto,
        { headers: this.getHeaders(req) },
      );

      // ✅ Audit: Modification produit
      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'UPDATE_PRODUCT',
          entity: 'PRODUCT',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || `/products/${id}`,
          details: {
            productId: id,
            updatedFields: dto,
          },
        });
      }

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la mise à jour du produit',
      );
    }
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    try {
      const response = await axios.delete<{ message: string }>(
        `${this.PRODUCTS_SERVICE_URL}/products/${id}`,
        { headers: this.getHeaders(req) },
      );

      // ✅ Audit: Suppression produit
      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'DELETE_PRODUCT',
          entity: 'PRODUCT',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || `/products/${id}`,
          details: { productId: id },
        });
      }

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la suppression du produit',
      );
    }
  }

  // -------------------- Stock --------------------
  @Patch(':id/add-stock')
  async addStock(
    @Param('id') id: string,
    @Body() body: { quantity: number },
    @Req() req: Request,
  ): Promise<any> {
    try {
      const response = await axios.patch(
        `${this.PRODUCTS_SERVICE_URL}/products/${id}/add-stock`,
        body,
        { headers: this.getHeaders(req) },
      );

      // ✅ Audit: Ajout de stock
      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'ADD_STOCK',
          entity: 'PRODUCT',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || `/products/${id}/add-stock`,
          details: {
            productId: id,
            quantityAdded: body.quantity,
          },
        });
      }

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de l’ajout de stock',
      );
    }
  }

  @Patch(':id/remove-stock')
  async removeStock(
    @Param('id') id: string,
    @Body() body: { quantity: number },
    @Req() req: Request,
  ): Promise<any> {
    try {
      const response = await axios.patch(
        `${this.PRODUCTS_SERVICE_URL}/products/${id}/remove-stock`,
        body,
        { headers: this.getHeaders(req) },
      );

      // ✅ Audit: Retrait de stock
      const user = (req as any).user;
      if (user) {
        await this.sendAuditLog({
          userId: user._id?.toString() || user.id,
          username: user.username || user.email,
          action: 'REMOVE_STOCK',
          entity: 'PRODUCT',
          ip: req.ip || req.socket?.remoteAddress,
          endpoint: req.originalUrl || `/products/${id}/remove-stock`,
          details: {
            productId: id,
            quantityRemoved: body.quantity,
          },
        });
      }

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors du retrait de stock',
      );
    }
  }
}
