import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags, ApiCookieAuth, ApiResponse } from '@nestjs/swagger';
import { FileEntity } from './entities/file.entity';
import { AuthGuard } from '../auth/guards';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@Controller('files')
@ApiTags('files')
@ApiCookieAuth('better-auth.session_token')
@UseGuards(AuthGuard, PermissionsGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @Post()
  @ApiCreatedResponse({ type: FileEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires project update permission.' })
  @RequirePermission('project', 'update')
  create(@Body() createFileDto: CreateFileDto) {
    return this.filesService.create(createFileDto);
  }

  @Get()
  @ApiOkResponse({ type: FileEntity, isArray: true })
  @RequirePermission('project', 'read')
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: FileEntity })
  @RequirePermission('project', 'read')
  async findOne(@Param('id') id: string) {
    const file = await this.filesService.findOne(id);
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    return file;
  }

  @Patch(':id')
  @ApiOkResponse({ type: FileEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires project update permission.' })
  @RequirePermission('project', 'update')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.update(id, updateFileDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: FileEntity })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires project update permission.' })
  @RequirePermission('project', 'update')
  remove(@Param('id') id: string) {
    return this.filesService.remove(id);
  }
}
