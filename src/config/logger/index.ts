import { LoggerModule } from 'nestjs-pino';

export default LoggerModule.forRoot({
  pinoHttp: {
    quietReqLogger: true,
    autoLogging: false,
    name: 'booking-hotel',
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              singleLine: true,
              colorize: true,
            },
          }
        : undefined,
  },
});
