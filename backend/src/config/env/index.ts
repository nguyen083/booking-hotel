import { ConfigModule } from '@nestjs/config';
import dataSource from '../db/database';
import configuration from './configuration';
import { validate } from './env.validation';

export default ConfigModule.forRoot({
  envFilePath: '.env',
  isGlobal: true,
  load: [configuration, dataSource],
  validate,
});
