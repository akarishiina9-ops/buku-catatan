import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import {
  IHttpExceptionResponse,
  IResponseEntity,
} from '../interfaces/response.interface.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const httpStatus: HttpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message: string = this.resolveMessage(exception);

    const responseBody: IResponseEntity = {
      code: httpStatus,
      status: false,
      message,
    };

    httpAdapter.reply(response, responseBody, httpStatus);
  }

  private resolveMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();

      if (typeof res === 'string') {
        return res;
      }

      if (typeof res === 'object' && res !== null) {
        const body = res as IHttpExceptionResponse;
        const { message } = body;
        return Array.isArray(message) ? message.join(', ') : message;
      }
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Internal server error';
  }
}