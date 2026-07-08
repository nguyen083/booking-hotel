import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class Message {
  @ApiProperty({
    description: 'Field name',
    type: String,
    example: 'field',
  })
  field!: string;
  @ApiProperty({
    description: 'Error messages',
    type: [String],
    example: ['Error message 1', 'Error message 2'],
  })
  errors!: string[];
}

export class HttpError {
  @ApiProperty({
    description: 'Status code',
    type: Number,
    example: 500,
  })
  statusCode!: HttpStatus;

  @ApiProperty({
    description: 'Error description message',
    oneOf: [
      { type: 'string' },
      { type: 'array', items: { $ref: getSchemaPath(Message) } },
    ],
  })
  message!: string | Message[];

  @ApiProperty({
    description: 'Path url',
    type: String,
    example: '/',
  })
  path!: string;

  @ApiProperty({
    description: 'When response sended',
    type: String,
    format: 'date-time',
    example: '2026-07-13T15:45:00Z',
  })
  timestamp!: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | Message[] = 'Internal server error';

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        message = response;
      } else if (
        response &&
        typeof response === 'object' &&
        'message' in response
      ) {
        const responseMessage = response.message;

        if (
          typeof responseMessage === 'string' ||
          Array.isArray(responseMessage)
        ) {
          message = responseMessage;
        } else {
          message = exception.message;
        }
      } else {
        message = exception.message;
      }
    }

    const responseBody: HttpError = {
      statusCode: httpStatus,
      message,
      path: httpAdapter.getRequestUrl(ctx.getRequest()) as string,
      timestamp: new Date().toISOString(),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
