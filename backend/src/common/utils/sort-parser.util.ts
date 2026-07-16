// src/common/utils/sort-parser.util.ts

import { BadRequestException } from '@nestjs/common';

export type SortOrder = 'ASC' | 'DESC';

export interface SortConfig {
  [field: string]: SortOrder;
}

export interface ParseSortOptions {
  allowedFields: string[];
  defaultSort?: SortConfig;
  maxFields?: number;
}

/**
 * Parse sort query string to TypeORM order object
 *
 * @example
 * // Input: "-createdAt,username"
 * // Output: { createdAt: 'DESC', username: 'ASC' }
 *
 * @param sortQuery - Sort string with comma-separated fields (prefix '-' for DESC)
 * @param options - Configuration options
 * @returns Sort configuration object
 */
export function parseSortQuery(
  sortQuery: string | undefined,
  options: ParseSortOptions,
): SortConfig {
  const { allowedFields, defaultSort, maxFields = 5 } = options;

  // Return default if no sort query
  if (!sortQuery || sortQuery.trim() === '') {
    return defaultSort || {};
  }

  const fields = sortQuery
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);

  // Validate max fields
  if (fields.length > maxFields) {
    throw new BadRequestException(
      `Too many sort fields. Maximum allowed: ${maxFields}`,
    );
  }

  const result: SortConfig = {};

  for (const item of fields) {
    const isDesc = item.startsWith('-');
    const fieldName = isDesc ? item.substring(1) : item;

    // Validate field name
    if (!allowedFields.includes(fieldName)) {
      throw new BadRequestException(
        `Invalid sort field: "${fieldName}". Allowed fields: ${allowedFields.join(', ')}`,
      );
    }

    // Check duplicate fields
    if (result[fieldName]) {
      throw new BadRequestException(`Duplicate sort field: "${fieldName}"`);
    }

    result[fieldName] = isDesc ? 'DESC' : 'ASC';
  }

  return result;
}
