import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IResponseEntity } from '../interfaces/response.interface.js';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, IResponseEntity<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IResponseEntity<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((result) => {
        const isPaginated =
          result && typeof result === 'object' && 'data' in result && 'meta' in result;

        return {
          statusCode: response.statusCode,
          message: 'Success',
          data: isPaginated ? result.data : result ?? null,
          ...(isPaginated ? { meta: result.meta } : {}),
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}