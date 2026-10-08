/** Shape of the object returned by HttpException.getResponse() */
export interface IHttpExceptionResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface ImetaPagination {
  totalPages: number;
  totalData: number;
  totalDataPerPage: number;
  page: number;
  limit: number;
}

export interface IResponseEntity<T = unknown> {
  code: number;
  status: boolean;
  message: string;
  data?: T;
  meta?: ImetaPagination;
  path?: string;
}

export interface IResponsePageWrapper<T> {
  data: T[];
  meta: ImetaPagination;
}