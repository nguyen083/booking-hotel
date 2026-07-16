import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserResponseDto } from './dto/create-user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { UserService } from './user.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  const bcryptHashMock = bcrypt.hash as unknown as jest.Mock<
    Promise<string>,
    [string, string | number]
  >;
  let userRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
    preload: jest.Mock;
    softDelete: jest.Mock;
  };

  const createUserDto: CreateUserDto = {
    email: 'user@example.com',
    password: 'StrongP@ssw0rd1',
    fullName: 'Nguyen Van A',
    phoneNumber: '0901234567',
    avatarUrl: 'https://example.com/avatar.jpg',
    role: UserRole.CUSTOMER,
  };

  const hashedPassword = '$2b$10$mockedhashedpasswordvalue';

  const updateUserDto: UpdateUserDto = {
    fullName: 'Updated Name',
    phoneNumber: '0907654321',
  };

  const userEntity: User = {
    id: '8d2421b4-b546-44b9-8c31-e32974e6d551',
    email: createUserDto.email,
    password: createUserDto.password,
    fullName: createUserDto.fullName,
    phoneNumber: createUserDto.phoneNumber,
    avatarUrl: createUserDto.avatarUrl,
    role: UserRole.CUSTOMER,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2026-07-13T15:45:00Z'),
    updatedAt: new Date('2026-07-13T16:45:00Z'),
    deletedAt: undefined,
  };

  beforeEach(async () => {
    bcryptHashMock.mockReset();

    userRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
      preload: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a user response dto', async () => {
      const createdUser = { ...userEntity, password: hashedPassword };
      bcryptHashMock.mockResolvedValue(hashedPassword);
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(createdUser);
      userRepository.save.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: [
          { email: createUserDto.email },
          { phoneNumber: createUserDto.phoneNumber },
        ],
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
      expect(userRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result).toMatchObject({
        id: createdUser.id,
        email: createdUser.email,
        fullName: createdUser.fullName,
        phoneNumber: createdUser.phoneNumber,
      });
    });

    it('should throw when email or phone number already exists', async () => {
      userRepository.findOne.mockResolvedValue(userEntity);

      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException('Email or phone number already exists'),
      );
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should apply search, sort and pagination', async () => {
      const queryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[userEntity], 1]),
      };
      userRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll(2, 5, 'user', '-fullName,email');

      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(queryBuilder.andWhere).toHaveBeenCalledTimes(1);
      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'user.fullName',
        'DESC',
      );
      expect(queryBuilder.addOrderBy).toHaveBeenCalledWith('user.email', 'ASC');
      expect(queryBuilder.skip).toHaveBeenCalledWith(5);
      expect(queryBuilder.take).toHaveBeenCalledWith(5);
      expect(result).toMatchObject({
        total: 1,
        page: 2,
        limit: 5,
        hasPrevious: true,
        hasNext: false,
        totalPages: 1,
      });
      expect(result.items[0]).toBeInstanceOf(UserResponseDto);
    });

    it('should use safe defaults when page and limit are invalid', async () => {
      const queryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      userRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll(Number.NaN, 0, undefined, undefined);

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'user.updatedAt',
        'DESC',
      );
      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
      expect(queryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toMatchObject({
        total: 0,
        page: 1,
        limit: 10,
        hasPrevious: false,
        hasNext: false,
        totalPages: 0,
      });
    });
  });

  describe('findOne', () => {
    it('should return a user response dto by id', async () => {
      userRepository.findOne.mockResolvedValue(userEntity);

      const result = await service.findOne(userEntity.id);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userEntity.id },
      });
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.id).toBe(userEntity.id);
    });

    it('should throw when user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(userEntity.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return a user response dto', async () => {
      const updatedUser = { ...userEntity, ...updateUserDto };
      userRepository.preload.mockResolvedValue(updatedUser);
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(userEntity.id, updateUserDto);

      expect(userRepository.preload).toHaveBeenCalledWith({
        id: userEntity.id,
        ...updateUserDto,
      });
      expect(userRepository.save).toHaveBeenCalledWith(updatedUser);
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.fullName).toBe(updateUserDto.fullName);
    });

    it('should throw when user does not exist', async () => {
      userRepository.preload.mockResolvedValue(null);

      await expect(
        service.update(userEntity.id, updateUserDto),
      ).rejects.toThrow(NotFoundException);
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
      const deleteResult = { affected: 1 };
      userRepository.softDelete.mockResolvedValue(deleteResult);

      const result = await service.remove(userEntity.id);

      expect(userRepository.softDelete).toHaveBeenCalledWith(userEntity.id);
      expect(result).toBe(deleteResult);
    });

    it('should throw when user does not exist', async () => {
      userRepository.softDelete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(userEntity.id)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });
  });
});
