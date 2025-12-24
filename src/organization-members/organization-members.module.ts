import { Module } from '@nestjs/common';
import { OrganizationMembersService } from './organization-members.service';
import { OrganizationMembersController } from './organization-members.controller';

import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [OrganizationMembersController],
  providers: [OrganizationMembersService, PrismaService],
})
export class OrganizationMembersModule { }
