import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Contract, ContractDocument } from './schemas/contract.schema';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Injectable()
export class ContractsService {
  constructor(
    @InjectModel(Contract.name) private contractModel: Model<ContractDocument>,
  ) {}

  // CREATE - Créer un contrat
  async create(
    createContractDto: CreateContractDto,
  ): Promise<ContractDocument> {
    // Vérifier que endDate est après startDate
    if (
      createContractDto.endDate &&
      new Date(createContractDto.endDate) <=
        new Date(createContractDto.startDate)
    ) {
      throw new BadRequestException('End date must be after start date');
    }

    const newContract = new this.contractModel({
      ...createContractDto,
      employeeId: new Types.ObjectId(createContractDto.employeeId),
    });
    
    return await newContract.save();
  }

  // READ ALL - Récupérer tous les contrats
  async findAll(): Promise<ContractDocument[]> {
    return await this.contractModel
      .find()
      .populate('employeeId')
      .exec();
  }

  // READ ONE - Récupérer un contrat par ID
  async findOne(id: string): Promise<ContractDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid contract ID');
    }

    const contract = await this.contractModel
      .findById(id)
      .populate('employeeId')
      .exec();

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    return contract;
  }

  // READ - Récupérer les contrats par employé
  async findByEmployee(employeeId: string): Promise<ContractDocument[]> {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee ID');
    }

    return await this.contractModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .sort({ startDate: -1 })
      .exec();
  }

  // READ - Récupérer les contrats par statut
  async findByStatus(status: string): Promise<ContractDocument[]> {
    return await this.contractModel
      .find({ status })
      .populate('employeeId')
      .exec();
  }

  // READ - Récupérer les contrats par type
  async findByType(type: string): Promise<ContractDocument[]> {
    return await this.contractModel
      .find({ type })
      .populate('employeeId')
      .exec();
  }

  // READ - Récupérer les contrats actifs
  async findActiveContracts(): Promise<ContractDocument[]> {
    const now = new Date();
    return await this.contractModel
      .find({
        status: 'active',
        $or: [
          { endDate: { $gte: now } },
          { endDate: { $exists: false } }
        ]
      })
      .populate('employeeId')
      .exec();
  }

  // READ - Récupérer les contrats expirés
  async findExpiredContracts(): Promise<ContractDocument[]> {
    const now = new Date();
    return await this.contractModel
      .find({
        endDate: { $lt: now },
        status: { $ne: 'terminated' }
      })
      .populate('employeeId')
      .exec();
  }

  // UPDATE - Mettre à jour un contrat
  async update(id: string, updateContractDto: UpdateContractDto): Promise<ContractDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid contract ID');
    }

    // Vérifier la cohérence des dates si fournies
    if (updateContractDto.startDate && updateContractDto.endDate) {
      if (new Date(updateContractDto.endDate) <= new Date(updateContractDto.startDate)) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const existingContract = await this.findOne(id);
    
    // Si on met à jour employeeId
    if (updateContractDto.employeeId) {
      updateContractDto.employeeId = new Types.ObjectId(updateContractDto.employeeId) as any;
    }

    const updatedContract = await this.contractModel
      .findByIdAndUpdate(id, updateContractDto, { new: true, runValidators: true })
      .populate('employeeId')
      .exec();

    if (!updatedContract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    return updatedContract;
  }

  // UPDATE - Terminer un contrat
  async terminateContract(id: string, terminationDate?: Date): Promise<ContractDocument> {
    const contract = await this.findOne(id);
    
    contract.status = 'terminated';
    if (terminationDate) {
      contract.endDate = terminationDate;
    } else {
      contract.endDate = new Date();
    }
    
    return await contract.save();
  }

  // UPDATE - Renouveler un contrat
  async renewContract(id: string, newEndDate: Date): Promise<ContractDocument> {
    const contract = await this.findOne(id);
    
    if (contract.status === 'terminated') {
      throw new BadRequestException('Cannot renew a terminated contract');
    }
    
    if (newEndDate <= contract.startDate) {
      throw new BadRequestException('New end date must be after start date');
    }
    
    contract.endDate = newEndDate;
    contract.status = 'active';
    
    return await contract.save();
  }

  // DELETE - Supprimer un contrat (soft delete recommandé)
  async remove(id: string): Promise<{ deleted: boolean }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid contract ID');
    }

    const result = await this.contractModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }
    
    return { deleted: true };
  }

  // DELETE - Supprimer tous les contrats d'un employé
  async removeByEmployee(employeeId: string): Promise<{ deletedCount: number }> {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee ID');
    }

    const result = await this.contractModel.deleteMany({ 
      employeeId: new Types.ObjectId(employeeId) 
    }).exec();
    
    return { deletedCount: result.deletedCount };
  }

  // STATISTIQUES
  async getStatistics(): Promise<any> {
    const total = await this.contractModel.countDocuments();
    const active = await this.contractModel.countDocuments({ status: 'active' });
    const expired = await this.contractModel.countDocuments({ status: 'expired' });
    const terminated = await this.contractModel.countDocuments({ status: 'terminated' });
    
    const byType = await this.contractModel.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    const averageSalary = await this.contractModel.aggregate([
      { $group: { _id: null, avgSalary: { $avg: '$salary' } } }
    ]);
    
    return {
      total,
      active,
      expired,
      terminated,
      byType,
      averageSalary: averageSalary[0]?.avgSalary || 0
    };
  }
}