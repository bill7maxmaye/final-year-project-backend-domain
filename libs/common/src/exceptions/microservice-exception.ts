import { RpcException } from '@nestjs/microservices';
import { MicroserviceErrorCode } from '../enum/error/microservice-error.enum';

export class MicroserviceException extends RpcException {
  constructor(
    public message: string,
    public statusCode: number,
    public errorCode: MicroserviceErrorCode,
    public type: string = MicroserviceException.name,
  ) {
    super(message);
  }

  static fromException(
    message: string,
    statusCode: number,
    errorCode: MicroserviceErrorCode,
  ): MicroserviceException {
    return new MicroserviceException(message, statusCode, errorCode);
  }

  getError() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      type: this.type,
    };
  }
}
