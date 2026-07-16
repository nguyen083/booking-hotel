import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUrl,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'Registered email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Invalid email' })
  email!: string;

  @ApiProperty({
    description: 'User password',
    example: 'StrongP@ssw0rd',
  })
  @IsStrongPassword()
  password!: string;

  @ApiProperty({
    description: 'Full name user',
    example: 'Nguyễn Văn A',
  })
  @IsString()
  fullName!: string;

  @ApiProperty({
    description: 'Phone number',
    example: '0901234567',
  })
  @IsString()
  phoneNumber!: string;

  @ApiPropertyOptional({
    description: 'URL of avatar',
    example: 'https://example.com/avatar.jpg',
  })
  @IsString()
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'User role',
    enum: UserRole,
    example: UserRole.CUSTOMER,
    default: UserRole.CUSTOMER,
  })
  @IsEnum(UserRole)
  role?: UserRole;
}
