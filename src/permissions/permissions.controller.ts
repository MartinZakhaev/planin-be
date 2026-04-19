import {
    Controller,
    Get,
    UseGuards,
    UseInterceptors,
    ClassSerializerInterceptor,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { PermissionEntity } from './entities/permission.entity';
import { AuthGuard } from '../auth/guards';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@ApiTags('Permissions')
@Controller('permissions')
@ApiCookieAuth('better-auth.session_token')
@UseGuards(AuthGuard, PermissionsGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all available permissions' })
    @ApiResponse({ status: 200, description: 'Return all permissions.', type: [PermissionEntity] })
    @RequirePermission('user', 'read')
    findAll() {
        return this.permissionsService.findAll();
    }

    @Get('grouped')
    @ApiOperation({ summary: 'Get all permissions grouped by resource' })
    @ApiResponse({ status: 200, description: 'Return permissions grouped by resource.' })
    @RequirePermission('user', 'read')
    findAllGrouped() {
        return this.permissionsService.findAllGrouped();
    }
}
