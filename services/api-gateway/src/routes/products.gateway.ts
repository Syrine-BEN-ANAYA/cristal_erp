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

  constructor() {
    Logger.log('ProductsGateway chargé correctement', 'API-GATEWAY');
  }

  private handleAxiosError(err: AxiosError, defaultMsg: string): never {
    const errResponse = err.response?.data;
    let message = defaultMsg;

    if (errResponse) {
      if (typeof errResponse === 'string') message = errResponse;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      else if ((errResponse as any).message)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
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
      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la récupération des produits',
      );
    }
  }

  @Get('low-stock/list') // correspond exactement au service
  async getLowStockProducts(@Req() req: Request): Promise<Product[]> {
    try {
      const response = await axios.get<Product[]>(
        `${this.PRODUCTS_SERVICE_URL}/products/low-stock/list`,
        { headers: this.getHeaders(req) },
      );
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
      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors de la récupération du produit',
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Req() req: Request,
  ): Promise<Product> {
    try {
      const response = await axios.patch<Product>(
        `${this.PRODUCTS_SERVICE_URL}/products/${id}`,
        dto,
        { headers: this.getHeaders(req) },
      );
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
      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error as AxiosError,
        'Erreur lors du retrait de stock',
      );
    }
  }
}
