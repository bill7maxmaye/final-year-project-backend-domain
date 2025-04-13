import { registerAs } from '@nestjs/config';
import { CONFIG_TOKEN } from './constant/config-token.constant';

export const rabbitmqConfig = registerAs(CONFIG_TOKEN.RABBITMQ, () => ({
  url: process.env.RABBITMQ_URL,
}));
