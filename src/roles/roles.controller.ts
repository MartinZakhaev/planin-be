import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    UseInterceptors,
    ClassSerializerInterceptor,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { RoleEntity } from './entities/role.entity';
import { AuthGuard } from '../auth/guards';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@ApiTags('Roles')
@Controller('roles')
@ApiCookieAuth('better-auth.session_token')
@UseGuards(AuthGuard, PermissionsGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new role' })
    @ApiResponse({ status: 201, description: 'Role created successfully.', type: RoleEntity })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    @RequirePermission('user', 'create') // Role management tied to user management permission
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.rolesService.create(createRoleDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all roles' })
    @ApiResponse({ status: 200, description: 'Return all roles.', type: [RoleEntity] })
    @RequirePermission('user', 'read')
    findAll() {
        return this.rolesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a role by id' })
    @ApiResponse({ status: 200, description: 'Return the role.', type: RoleEntity })
    @ApiResponse({ status: 404, description: 'Role not found.' })
    @RequirePermission('user', 'read')
    findOne(@Param('id') id: string) {
        return this.rolesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a role' })
    @ApiResponse({ status: 200, description: 'Role updated successfully.', type: RoleEntity })
    @ApiResponse({ status: 400, description: 'Cannot modify system role.' })
    @ApiResponse({ status: 404, description: 'Role not found.' })
    @RequirePermission('user', 'update')
    update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
        return this.rolesService.update(id, updateRoleDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a role' })
    @ApiResponse({ status: 200, description: 'Role deleted successfully.', type: RoleEntity })
    @ApiResponse({ status: 400, description: 'Cannot delete system role or role with users.' })
    @ApiResponse({ status: 404, description: 'Role not found.' })
    @RequirePermission('user', 'delete')
    remove(@Param('id') id: string) {
        return this.rolesService.remove(id);
    }

    @Post(':id/permissions')
    @ApiOperation({ summary: 'Assign permissions to a role' })
    @ApiResponse({ status: 200, description: 'Permissions assigned.', type: RoleEntity })
    @RequirePermission('user', 'update')
    assignPermissions(@Param('id') id: string, @Body('permissionIds') permissionIds: string[]) {
        return this.rolesService.assignPermissions(id, permissionIds);
    }

    @Delete(':id/permissions/:permissionId')
    @ApiOperation({ summary: 'Remove a permission from a role' })
    @ApiResponse({ status: 200, description: 'Permission removed.', type: RoleEntity })
    @RequirePermission('user', 'update')
    removePermission(@Param('id') id: string, @Param('permissionId') permissionId: string) {
        return this.rolesService.removePermission(id, permissionId);
    }
}
