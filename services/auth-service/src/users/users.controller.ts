import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserRole } from './schemas/user.schema';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ==========================================
  // GET ALL USERS
  // ==========================================
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  findAll(@Req() req: Request) {
    return this.usersService.findAll(req.user);
  }

  // ==========================================
  // GET ONE USER
  // ==========================================
  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.usersService.findOne(id, req.user);
  }

  // ==========================================
  // CREATE USER MANUALLY
  // ==========================================
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  create(@Body() dto: CreateUserDto, @Req() req: Request) {
    return this.usersService.create(dto, req.user);
  }

  // ==========================================
  // UPDATE USER
  // ==========================================
  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: Request,
  ) {
    return this.usersService.update(id, dto, req.user);
  }

  // ==========================================
  // DELETE USER
  // ==========================================
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.usersService.deleteUser(id, req.user);
  }

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================
  @Put('change-password/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROD_USER, UserRole.HR_USER)
  changePassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    return this.usersService.changePassword(id, dto, req.user);
  }

  // ==========================================
  // FORCE PASSWORD RESET
  // ==========================================
  @Put('force-change-password/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  forceChangePassword(@Param('id') id: string) {
    return this.usersService.forceChangePassword(id);
  }

  // ==========================================
  // CREATE USER FROM EMPLOYEE (MAIN FLOW)
  // ==========================================
  @Post('from-employee/:employeeId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  createFromEmployee(
    @Param('employeeId') employeeId: string,
    @Body() dto: CreateUserDto,
    @Req() req: Request,
  ) {
    return this.usersService.createFromEmployee(
      { _id: employeeId },
      dto,
      req.user,
    );
  }
  
}