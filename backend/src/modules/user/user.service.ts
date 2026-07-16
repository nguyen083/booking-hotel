import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { Brackets, Repository } from 'typeorm';
import { AppPaginatedResponseDto } from '../../common/dto';
import { parseSortQuery } from '../../common/utils/sort-parser.util';
import { UserResponseDto } from './dto/create-user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    //Tìm xem email hoặc số điện thoại đã tồn tại chưa
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: createUserDto.email },
        { phoneNumber: createUserDto.phoneNumber },
      ],
    });
    if (existingUser) {
      throw new ConflictException('Email or phone number already exists');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(user);
    return plainToInstance(UserResponseDto, savedUser);
  }

  async findAll(
    page: number,
    limit: number,
    search?: string,
    sort?: string,
  ): Promise<AppPaginatedResponseDto<UserResponseDto>> {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 10;

    const sortQuery = parseSortQuery(sort, {
      allowedFields: [
        'email',
        'fullName',
        'phoneNumber',
        'role',
        'status',
        'createdAt',
        'updatedAt',
      ],
      defaultSort: { updatedAt: 'DESC' },
      maxFields: 3,
    });

    const qb = this.userRepository.createQueryBuilder('user');

    if (search?.trim()) {
      const normalizedSearch = `%${search.trim()}%`;
      qb.andWhere(
        new Brackets((whereQb) => {
          whereQb
            .where('user.email ILIKE :search', { search: normalizedSearch })
            .orWhere('user.fullName ILIKE :search', {
              search: normalizedSearch,
            })
            .orWhere('user.phoneNumber ILIKE :search', {
              search: normalizedSearch,
            });
        }),
      );
    }

    Object.entries(sortQuery).forEach(([field, direction], index) => {
      if (index === 0) {
        qb.orderBy(`user.${field}`, direction);
        return;
      }
      qb.addOrderBy(`user.${field}`, direction);
    });

    qb.skip((safePage - 1) * safeLimit).take(safeLimit);

    const [users, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / safeLimit);

    return {
      items: plainToInstance(UserResponseDto, users),
      total,
      page: safePage,
      limit: safeLimit,
      hasPrevious: safePage > 1,
      hasNext: safePage < totalPages,
      totalPages,
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return plainToInstance(UserResponseDto, user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    // Implement the logic to update a user by ID using the provided updateUserDto
    const user = await this.userRepository.preload({ id, ...updateUserDto });
    if (!user) {
      throw new NotFoundException();
    }

    return plainToInstance(
      UserResponseDto,
      await this.userRepository.save(user),
    );
  }

  async remove(id: string) {
    const result = await this.userRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
    return result;
  }
}
