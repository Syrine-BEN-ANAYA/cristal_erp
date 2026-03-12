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

// DTOs et type Supplier
interface CreateSupplierDto {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface UpdateSupplierDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

@Controller('suppliers')
export class SuppliersGateway {
  private CONTACT_SERVICE_URL =
    process.env.CONTACT_SERVICE_URL || 'http://localhost:3102';

  constructor() {
    Logger.log('SuppliersGateway chargé correctement', 'API-GATEWAY');
  }

  // ---------------------------
  // POST /suppliers → créer
  // ---------------------------
  @Post()
  async create(
    @Body() body: CreateSupplierDto,
    @Req() req: Request,
  ): Promise<Supplier> {
    try {
      const res = await axios.post<Supplier>(
        `${this.CONTACT_SERVICE_URL}/suppliers`,
        body,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur création supplier',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // GET /suppliers → lister
  // ---------------------------
  @Get()
  async findAll(@Req() req: Request): Promise<Supplier[]> {
    try {
      const res = await axios.get<Supplier[]>(
        `${this.CONTACT_SERVICE_URL}/suppliers`,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur récupération suppliers',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // GET /suppliers/:id → récupérer
  // ---------------------------
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Supplier> {
    try {
      const res = await axios.get<Supplier>(
        `${this.CONTACT_SERVICE_URL}/suppliers/${id}`,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur récupération supplier',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // PUT /suppliers/:id → mettre à jour
  // ---------------------------
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateSupplierDto,
    @Req() req: Request,
  ): Promise<Supplier> {
    try {
      const res = await axios.put<Supplier>(
        `${this.CONTACT_SERVICE_URL}/suppliers/${id}`,
        body,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur update supplier',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // DELETE /suppliers/:id → supprimer
  // ---------------------------
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Supplier> {
    try {
      const res = await axios.delete<Supplier>(
        `${this.CONTACT_SERVICE_URL}/suppliers/${id}`,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur suppression supplier',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
