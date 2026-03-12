import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>
  ) {}

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const created = new this.customerModel(dto);
    return created.save();
  }

  async findAll(): Promise<Customer[]> {
    return this.customerModel.find().exec();
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerModel.findById(id).exec();
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }
async remove(id: string) {
  const customer = await this.customerModel.findByIdAndDelete(id);
  if (!customer) throw new NotFoundException('Customer not found');
  return { message: 'Customer deleted successfully' };
}
  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const updated = await this.customerModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!updated) throw new NotFoundException('Customer not found');
    return updated;
  }
}