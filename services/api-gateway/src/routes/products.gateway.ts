import {
  Controller,
  Get,
  Post,
  Put,
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

// DTOs et type Product
interface CreateProductDto {
  name: string;
  categoryId: string;
  price: number;
  stock?: number;
  description?: string;
}

interface UpdateProductDto {
  name?: string;
  categoryId?: string;
  price?: number;
  stock?: number;
  description?: string;
}

interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  stock: number;
  description?: string;
}

@Controller('products')
export class ProductsGateway {
  private CORE_SERVICE_URL =
    process.env.CORE_SERVICE_URL || 'http://localhost:3002';

  constructor() {
    Logger.log('ProductsGateway chargé correctement', 'API-GATEWAY');
  }

  // ---------------------------
  // POST /products → créer
  // ---------------------------
  @Post()
  async create(
    @Body() body: CreateProductDto,
    @Req() req: Request,
  ): Promise<Product> {
    try {
      const res = await axios.post<Product>(
        `${this.CORE_SERVICE_URL}/products`,
        body,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur création produit',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // GET /products → lister
  // ---------------------------
  @Get()
  async findAll(@Req() req: Request): Promise<Product[]> {
    try {
      const res = await axios.get<Product[]>(
        `${this.CORE_SERVICE_URL}/products`,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur récupération produits',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // GET /products/:id → récupérer un produit
  // ---------------------------
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Product> {
    try {
      const res = await axios.get<Product>(
        `${this.CORE_SERVICE_URL}/products/${id}`,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur récupération produit',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // PUT /products/:id → mettre à jour
  // ---------------------------
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
    @Req() req: Request,
  ): Promise<Product> {
    try {
      const res = await axios.put<Product>(
        `${this.CORE_SERVICE_URL}/products/${id}`,
        body,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur update produit',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // DELETE /products/:id → supprimer
  // ---------------------------
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request): Promise<Product> {
    try {
      const res = await axios.delete<Product>(
        `${this.CORE_SERVICE_URL}/products/${id}`,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur suppression produit',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
