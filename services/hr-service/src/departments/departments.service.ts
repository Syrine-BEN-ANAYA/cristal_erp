import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
  ) {}

  async create(dto: CreateDepartmentDto): Promise<DepartmentDocument> {
    const department = new this.departmentModel(dto);
    return department.save();
  }

  async findAll(): Promise<DepartmentDocument[]> {
    return this.departmentModel.find().exec();
  }

  async findOne(id: string): Promise<DepartmentDocument> {
    const dep = await this.departmentModel.findById(id).exec();
    if (!dep) throw new NotFoundException('Department not found');
    return dep;
  }

  async update(id: string, dto: UpdateDepartmentDto): Promise<DepartmentDocument> {
    const dep = await this.departmentModel.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).exec();
    if (!dep) throw new NotFoundException('Department not found');
    return dep;
  }

  async delete(id: string): Promise<DepartmentDocument> {
    const dep = await this.departmentModel.findByIdAndDelete(id).exec();
    if (!dep) throw new NotFoundException('Department not found');
    return dep;
  }
}
