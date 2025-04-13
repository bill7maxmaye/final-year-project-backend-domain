import { registerAs } from '@nestjs/config';
import { CONFIG_TOKEN } from './constant/config-token.constant';
import { DatabaseConfig } from './interfaces/database-config.interface';

export default registerAs(
  CONFIG_TOKEN.DATABASE,
  (): DatabaseConfig => ({
    uri: process.env.MONGO_URI || '',
  }),
);
