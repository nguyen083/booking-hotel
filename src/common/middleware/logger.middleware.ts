import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: PinoLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    this.logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        params: req.params,
        query: req.query,
        headers: req.headers,
        remoteAddress: req.ip,
        remotePort: req.socket.remotePort,
      },
      'Incoming Request',
    );

    res.on('finish', () => {
      const responseTime = Date.now() - start;
      const statusCode = res.statusCode;

      const isSuccess = statusCode >= 200 && statusCode < 300;
      const isClientError = statusCode >= 400 && statusCode < 500;
      const isServerError = statusCode >= 500;

      const logData = {
        method: req.method,
        url: req.originalUrl,
        statusCode,
        responseTime: `${responseTime}ms`,
      };

      if (isSuccess) {
        this.logger.info(logData, 'Request Completed Successfully');
      } else if (isClientError) {
        this.logger.warn(logData, 'Request Failed - Client Error');
      } else if (isServerError) {
        this.logger.error(logData, 'Request Failed - Server Error');
      } else {
        this.logger.info(logData, 'Request Completed');
      }
    });

    next();
  }
}
