import { ApiProperty } from '@nestjs/swagger';

export class AppResponseDto<T> {
  @ApiProperty({
    description: 'HTTP status code of the response',
    example: 200,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'The result of the response',
  })
  result!: T;

  @ApiProperty({
    description: 'A message describing the response',
    example: 'Request successful',
  })
  message!: string;
}
