import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  IResponseEntity,
  IResponsePageWrapper,
} from '../interfaces/response.interface.js';
import { MessageService } from '../services/message.service.js';

function isPagedResponse(val: unknown): val is IResponsePageWrapper<unknown> {
  return (
    typeof val === 'object' &&
    val !== null &&
    'data' in val &&
    'meta' in val &&
    val.meta !== null
  );
}

type InterceptorResult = unknown[] | IResponsePageWrapper<unknown> | unknown;

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly messageService: MessageService) { }

  intercept(
    context: ExecutionContext,
    next: CallHandler<InterceptorResult>,
  ): Observable<IResponseEntity<unknown>> {
    const httpResponse = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((res: InterceptorResult): IResponseEntity<unknown> => {
        const response: IResponseEntity<unknown> = {
          code: httpResponse.statusCode,
          status: true,
          message:
            this.messageService?.getMessage() || 'Successfully retrieve data',
        };

        if (res) {
          if (Array.isArray(res)) {
            response.data = res;
          } else if (isPagedResponse(res)) {
            response.data = res.data;
            response.meta = res.meta;
          } else {
            response.data = res;
          }
        }

        return response;
      }),
    );
  }
}