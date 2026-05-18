import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractService: ContractsService) {}

  // POST /contracts
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createContractDto: CreateContractDto) {
    return await this.contractService.create(createContractDto);
  }

  // GET /contracts
  @Get()
  async findAll() {
    return await this.contractService.findAll();
  }

  // GET /contracts/active
  @Get('active')
  async findActive() {
    return await this.contractService.findActiveContracts();
  }

  // GET /contracts/expired
  @Get('expired')
  async findExpired() {
    return await this.contractService.findExpiredContracts();
  }

  // GET /contracts/statistics
  @Get('statistics')
  async getStatistics() {
    return await this.contractService.getStatistics();
  }

  // GET /contracts/employee/:employeeId
  @Get('employee/:employeeId')
  async findByEmployee(@Param('employeeId') employeeId: string) {
    return await this.contractService.findByEmployee(employeeId);
  }

  // GET /contracts/status/:status
  @Get('status/:status')
  async findByStatus(@Param('status') status: string) {
    return await this.contractService.findByStatus(status);
  }

  // GET /contracts/type/:type
  @Get('type/:type')
  async findByType(@Param('type') type: string) {
    return await this.contractService.findByType(type);
  }

  // GET /contracts/:id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.contractService.findOne(id);
  }

  // PUT /contracts/:id
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    return await this.contractService.update(id, updateContractDto);
  }

  // PUT /contracts/:id/terminate
  @Put(':id/terminate')
  async terminate(
    @Param('id') id: string,
    @Body('terminationDate') terminationDate?: string,
  ) {
    return await this.contractService.terminateContract(
      id,
      terminationDate ? new Date(terminationDate) : undefined,
    );
  }

  // PUT /contracts/:id/renew
  @Put(':id/renew')
  async renew(
    @Param('id') id: string,
    @Body('newEndDate') newEndDate: string,
  ) {
    return await this.contractService.renewContract(id, new Date(newEndDate));
  }

  // DELETE /contracts/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return await this.contractService.remove(id);
  }

  // DELETE /contracts/employee/:employeeId
  @Delete('employee/:employeeId')
  @HttpCode(HttpStatus.OK)
  async removeByEmployee(@Param('employeeId') employeeId: string) {
    return await this.contractService.removeByEmployee(employeeId);
  }
}
