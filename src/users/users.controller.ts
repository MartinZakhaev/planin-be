import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  NotFoundException,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiQuery } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { AuthGuard } from '../auth/guards';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@ApiTags('Users')
@Controller('users')
@ApiCookieAuth('better-auth.session_token')
@UseGuards(AuthGuard, PermissionsGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.', type: UserEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires user create permission.' })
  @RequirePermission('user', 'create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users.', type: [UserEntity] })
  @RequirePermission('user', 'read')
  findAll() {
    return this.usersService.findAll();
  }

  @Get('lookup')
  @ApiOperation({ summary: 'Look up a user by exact email (auth only, no admin permission required)' })
  @ApiQuery({ name: 'email', required: true })
  @ApiResponse({ status: 200, description: 'Return minimal user info.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async lookupByEmail(@Query('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('No account found with that email address');
    return { id: user.id, fullName: user.fullName, email: user.email };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Return the user.', type: UserEntity })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @RequirePermission('user', 'read')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully updated.', type: UserEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires user update permission.' })
  @RequirePermission('user', 'update')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully deleted.', type: UserEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires user delete permission.' })
  @RequirePermission('user', 'delete')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
