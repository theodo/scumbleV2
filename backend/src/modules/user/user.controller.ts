import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesGuard } from 'auth/role.guard';
import { UseUser } from 'auth/user.decorator';
import { Public } from 'auth/public.decorator';
import { GetUserDto } from './interfaces/getUser.dto';
import { CreateUserDto } from './interfaces/createUser.dto';
import { AdminUpdateUserDto, UpdateUserDto } from './interfaces/updateUser.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    public readonly service: UserService,
  ) {}

  @Post()
  @Public()
  createOne(@Body() userDto: CreateUserDto): Promise<GetUserDto> {
    return this.service.createUser(userDto);
  }

  @Patch()
  @ApiBearerAuth('access-token')
  async updateMe(@UseUser() user: User, @Body() userDto: UpdateUserDto): Promise<GetUserDto> {
    return await this.service.updateUser(user.id, userDto);
  }

  @Patch('/:id')
  @ApiBearerAuth('access-token')
  @UseGuards(new RolesGuard(['admin']))
  updateOne(@Param('id') userId: string, @Body() userDto: AdminUpdateUserDto): Promise<GetUserDto> {
    return this.service.updateUser(userId, userDto);
  }
}
