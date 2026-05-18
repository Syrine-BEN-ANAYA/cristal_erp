import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Leave, LeaveDocument } from './schemas/leave.schema';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';

@Injectable()
export class LeavesService {
  constructor(
    @InjectModel(Leave.name) private leaveModel: Model<LeaveDocument>,
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

  async create(createLeaveDto: CreateLeaveDto): Promise<LeaveDocument> {
    return this.leaveModel.create(createLeaveDto);
  }

  async findAll(): Promise<LeaveDocument[]> {
    return this.leaveModel.find().populate('employeeId').exec();
  }

  async findOne(id: string): Promise<LeaveDocument> {
    const objectId = this.validateId(id);
    const leave = await this.leaveModel.findById(objectId).populate('employeeId').exec();
    if (!leave) throw new NotFoundException('Leave not found');
    return leave;
  }

  async findByEmployee(employeeId: string): Promise<LeaveDocument[]> {
    if (!employeeId || employeeId.trim() === '' || !Types.ObjectId.isValid(employeeId)) {
      return [];
    }
    return this.leaveModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .populate('employeeId')
      .exec();
  }

  async update(id: string, updateLeaveDto: UpdateLeaveDto): Promise<LeaveDocument> {
    const objectId = this.validateId(id);
    const leave = await this.leaveModel
      .findByIdAndUpdate(objectId, updateLeaveDto, { new: true, runValidators: true })
      .populate('employeeId')
      .exec();
    if (!leave) throw new NotFoundException('Leave not found');
    return leave;
  }

  async remove(id: string): Promise<LeaveDocument> {
    const objectId = this.validateId(id);
    const leave = await this.leaveModel.findByIdAndDelete(objectId).exec();
    if (!leave) throw new NotFoundException('Leave not found');
    return leave;
  }
}
