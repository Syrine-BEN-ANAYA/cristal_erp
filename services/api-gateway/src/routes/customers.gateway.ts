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

// DTOs et type Customer
interface CreateCustomerDto {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

@Controller('customers')
export class CustomersGateway {
  private CONTACT_SERVICE_URL =
    process.env.CONTACT_SERVICE_URL || 'http://localhost:3003';

  constructor() {
    Logger.log('CustomersGateway chargé correctement', 'API-GATEWAY');
  }

  // ---------------------------
  // POST /customers → créer
  // ---------------------------
  @Post()
  async create(
    @Body() body: CreateCustomerDto,
    @Req() req: Request,
  ): Promise<Customer> {
    try {
      const res = await axios.post<Customer>(
        `${this.CONTACT_SERVICE_URL}/customers`,
        body,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur création customer',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // GET /customers → lister
  // ---------------------------
  @Get()
  async findAll(@Req() req: Request): Promise<Customer[]> {
    try {
      const res = await axios.get<Customer[]>(
        `${this.CONTACT_SERVICE_URL}/customers`,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur récupération customers',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // GET /customers/:id → récupérer
  // ---------------------------
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Customer> {
    try {
      const res = await axios.get<Customer>(
        `${this.CONTACT_SERVICE_URL}/customers/${id}`,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur récupération customer',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // PUT /customers/:id → mettre à jour
  // ---------------------------
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCustomerDto,
    @Req() req: Request,
  ): Promise<Customer> {
    try {
      const res = await axios.put<Customer>(
        `${this.CONTACT_SERVICE_URL}/customers/${id}`,
        body,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur update customer',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ---------------------------
  // DELETE /customers/:id → supprimer
  // ---------------------------
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<Customer> {
    try {
      const res = await axios.delete<Customer>(
        `${this.CONTACT_SERVICE_URL}/customers/${id}`,
        { headers: { Authorization: req.headers.authorization || '' } },
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      throw new HttpException(
        err.response?.data || 'Erreur suppression customer',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
