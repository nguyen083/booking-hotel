import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { UserRole, UserStatus } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({
    description: 'User`s ID',
    example: 'uuid',
  })
  id!: string;

  @ApiProperty({
    description: 'User`s email',
    example: 'user@example.com',
  })
  email!: string;

  @Exclude()
  password!: string;

  @ApiProperty({
    description: 'User`s full name',
    example: 'John Doe',
  })
  fullName!: string;

  @ApiProperty({
    description: 'User`s phone number',
    example: '+84912345678',
  })
  phoneNumber!: string;

  @ApiProperty({
    description: 'User`s avatar URL',
    example: 'https://example.com/avatar.jpg',
    type: String,
    nullable: true,
  })
  avatarUrl!: string | null;

  @ApiProperty({
    description: 'User`s role',
    enum: UserRole,
    example: UserRole.CUSTOMER,
  })
  role!: UserRole;

  @ApiProperty({
    description: 'User`s status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @ApiProperty({
    description: 'When user was created',
    type: String,
    format: 'date-time',
    example: '2026-07-13T15:45:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'When user was last updated',
    type: String,
    format: 'date-time',
    example: '2026-07-13T15:45:00Z',
  })
  updatedAt!: Date;

  @Exclude()
  deletedAt!: Date | null;
}
