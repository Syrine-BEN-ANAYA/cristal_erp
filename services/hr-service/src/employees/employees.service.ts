import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';

import { Employee, EmployeeDocument } from './schemas/employee.schema';

import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name)
    private employeeModel: Model<EmployeeDocument>,
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

  // =========================
  // CREATE EMPLOYEE
  // =========================

  async create(dto: CreateEmployeeDto) {
    const emailExists = await this.employeeModel.findOne({
      email: dto.email,
    });

    if (emailExists) {
      throw new ConflictException('Email already exists');
    }

    return this.employeeModel.create(dto);
  }

  // =========================
  // GET ALL EMPLOYEES
  // =========================

  async findAll() {
    return this.employeeModel
      .find()
      .populate({
        path: 'departmentId',
        select: 'name',
      })
      .exec();
  }

  // =========================
  // GET ONE EMPLOYEE
  // =========================

  async findOne(id: string) {
    const objectId = this.validateId(id);
    const employee = await this.employeeModel
      .findById(objectId)
      .populate('departmentId')
      .exec();

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  // =========================
  // UPDATE EMPLOYEE
  // =========================

  async update(id: string, dto: UpdateEmployeeDto) {
    const objectId = this.validateId(id);
    const employee = await this.employeeModel.findById(objectId);

    if (!employee) throw new NotFoundException('Employee not found');

    Object.assign(employee, dto);

    await employee.save();

    return this.employeeModel
      .findById(objectId)
      .populate('departmentId')
      .exec();
  }

  // =========================
  // DELETE EMPLOYEE
  // =========================

  async remove(id: string) {
    const objectId = this.validateId(id);
    const employee = await this.employeeModel.findByIdAndDelete(objectId);

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return {
      message: 'Employee deleted successfully',
    };
  }
}
