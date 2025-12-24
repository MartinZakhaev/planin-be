import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    const { password, ...userData } = createUserDto;

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        passwordHash,
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

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(updateUserDto.password, salt);
      delete updateUserDto.password;
      (updateUserDto as any).passwordHash = passwordHash;
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto as any,
    });
    return new UserEntity(user);
  }

  async remove(id: string) {
    const user = await this.prisma.user.delete({
      where: { id },
    });
    return new UserEntity(user);
  }
}
