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

  /**
   * Create a user (administrative - without password)
   * For user registration with password, use Better Auth sign-up endpoints
   */
  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: {
        id: randomUUID(),
        email: createUserDto.email,
        fullName: createUserDto.fullName,
        profileFileId: createUserDto.profileFileId,
        role: createUserDto.role ?? 'user',
      },
    });

    return new UserEntity(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map((user) => new UserEntity(user));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    return new UserEntity(user);
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) return null;
    return new UserEntity(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    return new UserEntity(user);
  }

  async remove(id: string) {
    const user = await this.prisma.user.delete({
      where: { id },
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
    });
    return new UserEntity(user);
  }

  /**
   * Set user role
   */
  async setRole(id: string, role: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { role },
    });
    return new UserEntity(user);
  }
}
