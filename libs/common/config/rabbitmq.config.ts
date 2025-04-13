import { registerAs } from '@nestjs/config';
import { CONFIG_TOKEN } from './constant/config-token.constant';
import { RabbitMQConfig } from './interfaces/rabbitmq-config.interface';

export const rabbitmqConfig = registerAs(
  CONFIG_TOKEN.RABBITMQ,
  (): RabbitMQConfig => ({
    url: process.env.RABBITMQ_URL || '',
  }),
);
