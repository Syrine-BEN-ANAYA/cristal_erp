import {
  Controller,
  Get,
  Post,
  Put,
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

// DTOs internes (peuvent être externalisés si besoin)
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

  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request,
  ): Promise<Product> {
    try {
      const response = await axios.post<Product>(
        `${this.PRODUCTS_SERVICE_URL}/products`,
        createProductDto,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur lors de la création du produit',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll(@Req() req: Request): Promise<Product[]> {
    try {
      const response = await axios.get<Product[]>(
        `${this.PRODUCTS_SERVICE_URL}/products`,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur lors de la récupération des produits',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('low-stock')
  async getLowStockProducts(@Req() req: Request): Promise<Product[]> {
    try {
      const response = await axios.get<Product[]>(
        `${this.PRODUCTS_SERVICE_URL}/products/low-stock`,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data ||
          'Erreur lors de la récupération des produits en stock faible',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
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
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur lors de la récupération du produit',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: Request,
  ): Promise<Product> {
    try {
      const response = await axios.put<Product>(
        `${this.PRODUCTS_SERVICE_URL}/products/${id}`,
        updateProductDto,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur lors de la mise à jour du produit',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
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
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur lors de la suppression du produit',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur lors de l’ajout de stock',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
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
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur lors du retrait de stock',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
