import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserEntity } from './entities/user.entity';
import { randomUUID } from 'crypto';

/**
 * Users Service
 * 
 * Note: User creation with password should be done through Better Auth's
 * sign-up endpoints (/api/auth/sign-up/email). This service is for
 * administrative user management.
 */
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  private readonly userInclude = {
    role: {
      select: {
        id: true,
        name: true,
        displayName: true,
      },
    },
  };

  /**
   * Create a user (administrative - without password)
   * For user registration with password, use Better Auth sign-up endpoints
   */
  async create(createUserDto: CreateUserDto) {
    // Find the role by name if roleId is not provided but role name is
    let roleId = createUserDto.roleId;
    if (!roleId && createUserDto.role) {
      const role = await this.prisma.role.findUnique({
        where: { name: createUserDto.role },
      });
      roleId = role?.id;
    }

    const user = await this.prisma.user.create({
      data: {
        id: randomUUID(),
        email: createUserDto.email,
        fullName: createUserDto.fullName,
        profileFileId: createUserDto.profileFileId,
        roleId,
      },
      include: this.userInclude,
    });

    return new UserEntity(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: this.userInclude,
    });
    return users.map((user) => new UserEntity(user));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: this.userInclude,
    });
    if (!user) return null;
    return new UserEntity(user);
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: this.userInclude,
    });
    if (!user) return null;
    return new UserEntity(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Handle role update by name if needed
    let roleId = updateUserDto.roleId;
    if (!roleId && updateUserDto.role) {
      const role = await this.prisma.role.findUnique({
        where: { name: updateUserDto.role },
      });
      roleId = role?.id;
    }

    const { role: _role, ...restData } = updateUserDto;
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...restData,
        roleId: roleId ?? restData.roleId,
      },
      include: this.userInclude,
    });
    return new UserEntity(user);
  }

  async remove(id: string) {
    const user = await this.prisma.user.delete({
      where: { id },
      include: this.userInclude,
    });
    return new UserEntity(user);
  }

  /**
   * Ban a user
   */
  async banUser(id: string, reason?: string, expiresAt?: Date) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        banned: true,
        banReason: reason,
        banExpires: expiresAt,
      },
      include: this.userInclude,
    });
    return new UserEntity(user);
  }

  /**
   * Unban a user
   */
  async unbanUser(id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        banned: false,
        banReason: null,
        banExpires: null,
      },
      include: this.userInclude,
    });
    return new UserEntity(user);
  }

  /**
   * Set user role by role ID
   */
  async setRole(id: string, roleId: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { roleId },
      include: this.userInclude,
    });
    return new UserEntity(user);
  }

  /**
   * Set user role by role name
   */
  async setRoleByName(id: string, roleName: string) {
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });
    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }
    return this.setRole(id, role.id);
  }
}

