import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payroll, PayrollDocument } from './schemas/payroll.schema';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';

@Injectable()
export class PayrollService {
  constructor(
    @InjectModel(Payroll.name) private payrollModel: Model<PayrollDocument>,
  ) {}

  private validateId(id: string, fieldName = 'ID'): Types.ObjectId {
    if (!id || id.trim() === '') {
      throw new BadRequestException(`${fieldName} is required`);
    }
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${fieldName} format`);
    }
    return new Types.ObjectId(id);
  }

  private calculateNetSalary(
    basicSalary: number,
    bonuses: number = 0,
    deductions: number = 0,
  ): number {
    return basicSalary + bonuses - deductions;
  }

  // ================= CREATE =================
  async create(createPayrollDto: CreatePayrollDto): Promise<PayrollDocument> {
    // Vérifier si un payroll existe déjà pour cette période
    const existing = await this.payrollModel.findOne({
      employeeId: new Types.ObjectId(createPayrollDto.employeeId),
      month: createPayrollDto.month,
      year: createPayrollDto.year,
    });

    if (existing) {
      throw new ConflictException(
        `Payroll already exists for this employee in ${createPayrollDto.month}/${createPayrollDto.year}`,
      );
    }

    // Vérifier la cohérence du net salary
    const calculatedNet = this.calculateNetSalary(
      createPayrollDto.basicSalary,
      createPayrollDto.bonuses || 0,
      createPayrollDto.deductions || 0
    );

    if (createPayrollDto.netSalary !== calculatedNet) {
      throw new BadRequestException(
        `Net salary (${createPayrollDto.netSalary}) does not match calculated value (${calculatedNet})`,
      );
    }

    const payroll = new this.payrollModel({
      ...createPayrollDto,
      employeeId: new Types.ObjectId(createPayrollDto.employeeId),
    });

    return await payroll.save();
  }

  // ================= FIND ALL =================
  async findAll(): Promise<PayrollDocument[]> {
    return await this.payrollModel
      .find()
      .populate('employeeId')
      .sort({ year: -1, month: -1 })
      .exec();
  }

  // ================= FIND ONE =================
  async findOne(id: string): Promise<PayrollDocument> {
    const objectId = this.validateId(id);
    const payroll = await this.payrollModel
      .findById(objectId)
      .populate('employeeId')
      .exec();

    if (!payroll) {
      throw new NotFoundException('Payroll not found');
    }
    return payroll;
  }

  // ================= FIND BY EMPLOYEE =================
  async findByEmployee(employeeId: string): Promise<PayrollDocument[]> {
    if (
      !employeeId ||
      employeeId.trim() === '' ||
      !Types.ObjectId.isValid(employeeId)
    ) {
      return [];
    }
    return await this.payrollModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .populate('employeeId')
      .sort({ year: -1, month: -1 })
      .exec();
  }

  // ================= FIND BY PERIOD =================
  async findByPeriod(month: number, year: number): Promise<PayrollDocument[]> {
    if (!month || !year) {
      return [];
    }
    return await this.payrollModel
      .find({ month, year })
      .populate('employeeId')
      .sort({ 'employeeId.firstName': 1 })
      .exec();
  }

  // ================= FIND BY STATUS =================
  async findByStatus(status: string): Promise<PayrollDocument[]> {
    if (!status) {
      return [];
    }
    return await this.payrollModel
      .find({ status })
      .populate('employeeId')
      .sort({ year: -1, month: -1 })
      .exec();
  }

  // ================= UPDATE =================
  async update(
    id: string,
    updatePayrollDto: UpdatePayrollDto,
  ): Promise<PayrollDocument> {
    const objectId = this.validateId(id);

    // Si les champs de salaire sont modifiés, recalculer le net
    if (
      updatePayrollDto.basicSalary !== undefined ||
      updatePayrollDto.bonuses !== undefined ||
        updatePayrollDto.deductions !== undefined) {
      
      const current = await this.findOne(id);
      const basicSalary = updatePayrollDto.basicSalary ?? current.basicSalary;
      const bonuses = updatePayrollDto.bonuses ?? current.bonuses ?? 0;
      const deductions = updatePayrollDto.deductions ?? current.deductions ?? 0;
      const calculatedNet = this.calculateNetSalary(basicSalary, bonuses, deductions);
      
      if (updatePayrollDto.netSalary !== undefined && updatePayrollDto.netSalary !== calculatedNet) {
        throw new BadRequestException(
          `Net salary (${updatePayrollDto.netSalary}) does not match calculated value (${calculatedNet})`
        );
      }
      
      updatePayrollDto.netSalary = calculatedNet;
    }

    // Si le statut devient "processed", ajouter la date de traitement
    if (updatePayrollDto.status === 'processed') {
      (updatePayrollDto as any).processedAt = new Date();
    }

    // Si le statut devient "paid", ajouter la date de paiement
    if (updatePayrollDto.status === 'paid') {
      (updatePayrollDto as any).paymentDate = new Date();
    }

    const payroll = await this.payrollModel
      .findByIdAndUpdate(objectId, updatePayrollDto, { new: true, runValidators: true })
      .populate('employeeId')
      .exec();

    if (!payroll) {
      throw new NotFoundException('Payroll not found');
    }

    return payroll;
  }

  // ================= DELETE =================
  async remove(id: string): Promise<{ deleted: boolean }> {
    const objectId = this.validateId(id);
    const payroll = await this.payrollModel.findByIdAndDelete(objectId).exec();
    
    if (!payroll) {
      throw new NotFoundException('Payroll not found');
    }
    
    return { deleted: true };
  }

  // ================= DELETE BY EMPLOYEE =================
  async removeByEmployee(employeeId: string): Promise<{ deletedCount: number }> {
    const objectId = this.validateId(employeeId, 'Employee ID');
    const result = await this.payrollModel.deleteMany({ employeeId: objectId }).exec();
    return { deletedCount: result.deletedCount };
  }

  // ================= STATISTICS =================
  async getStatistics(): Promise<any> {
    const total = await this.payrollModel.countDocuments();
    const draft = await this.payrollModel.countDocuments({ status: 'draft' });
    const processed = await this.payrollModel.countDocuments({ status: 'processed' });
    const paid = await this.payrollModel.countDocuments({ status: 'paid' });

    const totalAmountResult = await this.payrollModel.aggregate([
      { $group: { _id: null, total: { $sum: '$netSalary' } } }
    ]);

    const averageSalaryResult = await this.payrollModel.aggregate([
      { $group: { _id: null, avg: { $avg: '$netSalary' } } }
    ]);

    const byMonth = await this.payrollModel.aggregate([
      { $group: { _id: { month: '$month', year: '$year' }, count: { $sum: 1 }, total: { $sum: '$netSalary' } } },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    return {
      total,
      draft,
      processed,
      paid,
      totalAmount: totalAmountResult[0]?.total || 0,
      averageSalary: averageSalaryResult[0]?.avg || 0,
      byMonth,
    };
  }

  // ================= PROCESS BULK PAYROLL (CORRIGÉ) =================
  async processBulkPayroll(month: number, year: number, employeeIds: string[]): Promise<{ created: number; errors: Array<{ employeeId: string; error: string }> }> {
    let created = 0;
    const errors: Array<{ employeeId: string; error: string }> = [];

    for (const employeeId of employeeIds) {
      try {
        // Vérifier si un payroll existe déjà pour cette période
        const existing = await this.payrollModel.findOne({
          employeeId: new Types.ObjectId(employeeId),
          month,
          year,
        });

        if (!existing) {
          // Récupérer l'employé pour avoir son salaire de base
          // (Vous devrez injecter EmployeeService ou faire une requête)
          // Pour l'instant, on met des valeurs par défaut
          await this.create({
            employeeId,
            month,
            year,
            basicSalary: 0,
            bonuses: 0,
            deductions: 0,
            netSalary: 0,
            status: 'draft',
          });
          created++;
        }
      } catch (error) {
        errors.push({ employeeId, error: error.message });
      }
    }

    return { created, errors };
  }
}
