import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import type { Request } from 'express';

// DTOs pour la création et mise à jour
interface CreatePurchaseDto {
  supplierId: string;
  items: { productId: string; quantity: number }[];
  // Ajoutez d'autres champs si nécessaire (ex: date, status, etc.)
}

interface UpdatePurchaseDto {
  items?: { productId: string; quantity: number }[];
  status?: string;
}

// Interface représentant un achat (réponse du microservice)
interface Purchase {
  id: string;
  supplierId: string;
  items: { productId: string; quantity: number }[];
  status: string; // ex: 'pending', 'received', 'cancelled'
  createdAt?: string;
  updatedAt?: string;
}

@Controller('purchases')
export class PurchasesGateway {
  private readonly PURCHASE_SERVICE_URL =
    process.env.PURCHASE_SERVICE_URL || 'http://localhost:3102';

  constructor() {
    Logger.log('PurchasesGateway chargé correctement', 'API-GATEWAY');
  }

  // Récupère le header Authorization ou lance une erreur
  private getAuthHeader(req: Request) {
    const auth = req.headers.authorization;
    if (!auth) {
      throw new HttpException('Authorization header missing', HttpStatus.UNAUTHORIZED);
    }
    return { Authorization: auth };
  }

  // Gère les erreurs Axios
  private handleAxiosError(error: unknown, fallbackMessage: string): never {
    const err = error as AxiosError;
    throw new HttpException(
      err.response?.data || fallbackMessage,
      err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  // ---------------------------
  // POST /purchases
  // ---------------------------
  @Post()
  async create(@Body() body: CreatePurchaseDto, @Req() req: Request): Promise<Purchase> {
    try {
      const res = await axios.post<Purchase>(
        `${this.PURCHASE_SERVICE_URL}/purchases`,
        body,
        { headers: this.getAuthHeader(req) }
      );
      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur création achat');
    }
  }

  // ---------------------------
  // GET /purchases
  // ---------------------------
  @Get()
  async findAll(@Req() req: Request): Promise<Purchase[]> {
    try {
      const res = await axios.get<Purchase[]>(
        `${this.PURCHASE_SERVICE_URL}/purchases`,
        { headers: this.getAuthHeader(req) }
      );
      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur récupération achats');
    }
  }

  // ---------------------------
  // GET /purchases/:id
  // ---------------------------
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request): Promise<Purchase> {
    try {
      const res = await axios.get<Purchase>(
        `${this.PURCHASE_SERVICE_URL}/purchases/${id}`,
        { headers: this.getAuthHeader(req) }
      );
      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur récupération achat');
    }
  }

  // ---------------------------
  // PUT /purchases/:id
  // ---------------------------
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdatePurchaseDto,
    @Req() req: Request,
  ): Promise<Purchase> {
    try {
      const res = await axios.put<Purchase>(
        `${this.PURCHASE_SERVICE_URL}/purchases/${id}`,
        body,
        { headers: this.getAuthHeader(req) }
      );
      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur mise à jour achat');
    }
  }

  // ---------------------------
  // DELETE /purchases/:id
  // ---------------------------
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request): Promise<Purchase> {
    try {
      const res = await axios.delete<Purchase>(
        `${this.PURCHASE_SERVICE_URL}/purchases/${id}`,
        { headers: this.getAuthHeader(req) }
      );
      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur suppression achat');
    }
  }

  // ---------------------------
  // DELETE /purchases?month=YYYY-MM
  // Exemple de suppression par mois (si le microservice le supporte)
  // ---------------------------
  @Delete()
  async deleteByMonth(
    @Query('month') month: string,
    @Req() req: Request,
  ): Promise<{ deleted: number }> {
    try {
      const res = await axios.delete<{ deleted: number }>(
        `${this.PURCHASE_SERVICE_URL}/purchases?month=${month}`,
        { headers: this.getAuthHeader(req) }
      );
      return res.data;
    } catch (error) {
      this.handleAxiosError(error, 'Erreur suppression achats par mois');
    }
  }
}