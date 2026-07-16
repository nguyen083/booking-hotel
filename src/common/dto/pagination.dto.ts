import { ApiProperty } from '@nestjs/swagger';

export class AppPaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  total!: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit!: number;

  @ApiProperty({
    description: 'List of items for the current page',
  })
  items!: T[];

  @ApiProperty({
    description: 'Indicates if there is a previous page',
    example: false,
  })
  hasPrevious!: boolean;

  @ApiProperty({
    description: 'Indicates if there is a next page',
    example: true,
  })
  hasNext!: boolean;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages!: number;
}
