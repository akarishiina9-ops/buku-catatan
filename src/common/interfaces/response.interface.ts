import { time } from "console";
import { timestamp } from "rxjs";``

export interface IResponseEntity<T = any> {
    statusCode: number;
    message: string;
    data: T | null;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
    timestamp: string;
}