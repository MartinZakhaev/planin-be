import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FileEntity } from './entities/file.entity';

@Controller('files')
@ApiTags('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @Post()
  @ApiCreatedResponse({ type: FileEntity })
  create(@Body() createFileDto: CreateFileDto) {
    return this.filesService.create(createFileDto);
  }

  @Get()
  @ApiOkResponse({ type: FileEntity, isArray: true })
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: FileEntity })
  async findOne(@Param('id') id: string) {
    const file = await this.filesService.findOne(id);
    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }
    return file;
  }

  @Patch(':id')
  @ApiOkResponse({ type: FileEntity })
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.update(id, updateFileDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: FileEntity })
  remove(@Param('id') id: string) {
    return this.filesService.remove(id);
  }
}
