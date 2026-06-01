import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument } from './schemas/employee.schema';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name)
    private readonly employeeModel: Model<EmployeeDocument>,
  ) {}

  // =====================================================
  // CREATE EMPLOYEE (HR)
  // =====================================================
  async create(dto: CreateEmployeeDto): Promise<Employee> {
    return this.employeeModel.create({
      ...dto,
      accountStatus: dto.accountStatus ?? 'requested', // default HR
    });
  }

  // =====================================================
  // FIND ALL
  // =====================================================
  async findAll(): Promise<Employee[]> {
    return this.employeeModel.find().exec();
  }

  // =====================================================
  // FIND ONE
  // =====================================================
  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeModel.findById(id).exec();

    if (!employee) {
      throw new NotFoundException(`Employee ${id} not found`);
    }

    return employee;
  }

  // =====================================================
  // UPDATE BY HR (restricted rules)
  // HR cannot set "created"
  // =====================================================
  async updateByHr(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.employeeModel.findById(id);

    if (!employee) {
      throw new NotFoundException(`Employee ${id} not found`);
    }

    if (dto.accountStatus === 'created') {
      throw new ForbiddenException('HR cannot set accountStatus to created');
    }

    const updated = await this.employeeModel
      .findByIdAndUpdate(id, dto, { returnDocument: 'after' })
      .exec();

    return updated!;
  }

  // =====================================================
  // UPDATE GENERIC (ADMIN / SYSTEM)
  // =====================================================
  async update(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    const updated = await this.employeeModel
      .findByIdAndUpdate(id, dto, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Employee ${id} not found`);
    }

    return updated;
  }

  // =====================================================
  // GET EMPLOYEES READY FOR ACCOUNT CREATION
  // =====================================================
  async findPendingAccounts(): Promise<Employee[]> {
    return this.employeeModel.find({ accountStatus: 'requested' }).exec();
  }

  // =====================================================
  // MARK AS CREATED (CALLED BY USER SERVICE)
  // =====================================================
  async markAsCreated(employeeId: string): Promise<Employee> {
    const employee = await this.employeeModel.findById(employeeId);

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    employee.accountStatus = 'created';

    return employee.save();
  }
}
