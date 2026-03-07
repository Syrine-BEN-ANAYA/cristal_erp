import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import type { Request } from 'express';

// DTOs et type Category
interface CreateCategoryDto {
  name: string;
  description?: string;
}

interface UpdateCategoryDto {
  name?: string;
  description?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

@Controller('categories')
export class CategoriesGateway {
  private CORE_SERVICE_URL =
    process.env.CORE_SERVICE_URL || 'http://localhost:3002';

  constructor() {
    Logger.log('CategoriesGateway chargé correctement', 'API-GATEWAY');
  }

  // ---------------------------
  // POST /categories → créer
  // ---------------------------
  @Post()
  async create(
    @Body() body: CreateCategoryDto,
    @Req() req: Request,
  ): Promise<Category> {
    try {
      const res = await axios.post<Category>(
        `${this.CORE_SERVICE_URL}/categories`,
        body,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur création catégorie',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // GET /categories → lister
  // ---------------------------
  @Get()
  async findAll(@Req() req: Request): Promise<Category[]> {
    try {
      const res = await axios.get<Category[]>(
        `${this.CORE_SERVICE_URL}/categories`,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur récupération catégories',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // GET /categories/:id → récupérer une catégorie
  // ---------------------------
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Category> {
    try {
      const res = await axios.get<Category>(
        `${this.CORE_SERVICE_URL}/categories/${id}`,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur récupération catégorie',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // PUT /categories/:id → mettre à jour
  // ---------------------------
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
    @Req() req: Request,
  ): Promise<Category> {
    try {
      const res = await axios.put<Category>(
        `${this.CORE_SERVICE_URL}/categories/${id}`,
        body,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur update catégorie',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // DELETE /categories/:id → supprimer
  // ---------------------------
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Category> {
    try {
      const res = await axios.delete<Category>(
        `${this.CORE_SERVICE_URL}/categories/${id}`,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur suppression catégorie',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
