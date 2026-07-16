import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiQuery,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { AppPaginatedResponseDto, AppResponseDto } from '../../common/dto';
import { HttpError } from '../../common/filters/all-exception.filter';
import { UserResponseDto } from './dto/create-user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiExtraModels(AppResponseDto, UserResponseDto)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(AppResponseDto) },
        {
          properties: {
            result: { $ref: getSchemaPath(UserResponseDto) },
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'User creation failed',
    type: HttpError,
  })
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<AppResponseDto<UserResponseDto>> {
    const user = await this.userService.create(createUserDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      result: user,
    };
  }

  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search keyword by email, fullName, or phoneNumber',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    description:
      'Sort field: email, fullName, phoneNumber, role, status, createdAt, updatedAt. Example: sort=-fullName,email',
  })
  @ApiExtraModels(AppResponseDto, UserResponseDto, AppPaginatedResponseDto)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(AppResponseDto) },
        {
          properties: {
            result: {
              allOf: [
                { $ref: getSchemaPath(AppPaginatedResponseDto) },
                {
                  properties: {
                    items: {
                      type: 'array',
                      items: { $ref: getSchemaPath(UserResponseDto) },
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Users retrieval failed',
    type: HttpError,
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ): Promise<AppResponseDto<AppPaginatedResponseDto<UserResponseDto>>> {
    const users = await this.userService.findAll(page, limit, search, sort);
    return {
      statusCode: HttpStatus.OK,
      message: 'Users retrieved successfully',
      result: users,
    };
  }

  @Get(':id')
  @ApiExtraModels(AppResponseDto, UserResponseDto)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User information retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(AppResponseDto) },
        {
          properties: {
            result: { $ref: getSchemaPath(UserResponseDto) },
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'User information retrieval failed',
    type: HttpError,
  })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<AppResponseDto<UserResponseDto>> {
    const user = await this.userService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User information retrieved successfully',
      result: user,
    };
  }

  @Patch(':id')
  @ApiExtraModels(AppResponseDto, UserResponseDto)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(AppResponseDto) },
        {
          properties: {
            result: { $ref: getSchemaPath(UserResponseDto) },
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'User update failed',
    type: HttpError,
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<AppResponseDto<UserResponseDto>> {
    const user = await this.userService.update(id, updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'User updated successfully',
      result: user,
    };
  }

  @Delete(':id')
  @ApiExtraModels(AppResponseDto)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(AppResponseDto) },
        {
          properties: {
            result: { type: 'null' },
          },
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'User deletion failed',
    type: HttpError,
  })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<AppResponseDto<null>> {
    await this.userService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User deleted successfully',
      result: null,
    };
  }
}
