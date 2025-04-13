import { registerAs } from '@nestjs/config';
import { CONFIG_TOKEN } from './constant/config-token.constant';

export default registerAs(CONFIG_TOKEN.SOCKET, () => ({
  port: Number(process.env.SOCKET_PORT || 3001),
  path: process.env.SOCKET_PATH ?? '/socket.io',
  corsOrigin: (process.env.SOCKET_CORS_ORIGIN ?? '').split(','),
  maxDisconnectionDuration: Number(
    process.env.SOCKET_MAX_DISCONNECTION_DURATION || 10000,
  ),
}));
