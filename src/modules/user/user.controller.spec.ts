import { Test, TestingModule } from '@nestjs/testing';
import { UserRole, UserStatus } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  const userResponse = {
    id: '8d2421b4-b546-44b9-8c31-e32974e6d551',
    email: 'user@example.com',
    fullName: 'Nguyen Van A',
    phoneNumber: '0901234567',
    avatarUrl: 'https://example.com/avatar.jpg',
    role: UserRole.CUSTOMER,
    status: UserStatus.ACTIVE,
    createdAt: new Date('2026-07-13T15:45:00Z'),
    updatedAt: new Date('2026-07-13T16:45:00Z'),
  };

  beforeEach(async () => {
    userService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: userService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should wrap create response', async () => {
    const dto = {
      email: 'user@example.com',
      password: 'StrongP@ssw0rd1',
      fullName: 'Nguyen Van A',
      phoneNumber: '0901234567',
      avatarUrl: 'https://example.com/avatar.jpg',
      role: UserRole.CUSTOMER,
    };
    userService.create.mockResolvedValue(userResponse);

    const result = await controller.create(dto);

    expect(userService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      statusCode: 201,
      message: 'User created successfully',
      result: userResponse,
    });
  });

  it('should wrap paginated findAll response', async () => {
    const paginatedUsers = {
      items: [userResponse],
      total: 1,
      page: 1,
      limit: 10,
      hasPrevious: false,
      hasNext: false,
      totalPages: 1,
    };
    userService.findAll.mockResolvedValue(paginatedUsers);

    const result = await controller.findAll(1, 10, 'user', '-updatedAt');

    expect(userService.findAll).toHaveBeenCalledWith(
      1,
      10,
      'user',
      '-updatedAt',
    );
    expect(result).toEqual({
      statusCode: 200,
      message: 'Users retrieved successfully',
      result: paginatedUsers,
    });
  });

  it('should wrap findOne response', async () => {
    userService.findOne.mockResolvedValue(userResponse);

    const result = await controller.findOne(userResponse.id);

    expect(userService.findOne).toHaveBeenCalledWith(userResponse.id);
    expect(result).toEqual({
      statusCode: 200,
      message: 'User information retrieved successfully',
      result: userResponse,
    });
  });

  it('should wrap update response', async () => {
    const dto = { fullName: 'Updated Name' };
    const updatedUser = { ...userResponse, ...dto };
    userService.update.mockResolvedValue(updatedUser);

    const result = await controller.update(userResponse.id, dto);

    expect(userService.update).toHaveBeenCalledWith(userResponse.id, dto);
    expect(result).toEqual({
      statusCode: 200,
      message: 'User updated successfully',
      result: updatedUser,
    });
  });

  it('should wrap remove response', async () => {
    userService.remove.mockResolvedValue(undefined);

    const result = await controller.remove(userResponse.id);

    expect(userService.remove).toHaveBeenCalledWith(userResponse.id);
    expect(result).toEqual({
      statusCode: 200,
      message: 'User deleted successfully',
      result: null,
    });
  });
});
