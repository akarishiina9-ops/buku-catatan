import { MiddlewareConsumer, Module, NestModule, ClassSerializerInterceptor } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { AuthModule } from './auth/auth.module.js';
import { NotesModule } from './notes/notes.module.js';
import { User } from './users/user.entity.js';
import { Note } from './notes/note.entity.js';
import { CommonModule } from './common/common.module.js';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptors.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({
      isGlobal: true,
      ttl: 5 * 60 * 1000, // 5 menit (ms)
      max: 500,           // max 500 item di memory
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000, // 60 detik (ms)
        limit: 100,  // max 100 request per ttl
      },
    ]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        entities: [User, Note],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
      dataSourceFactory: async (options) => {
        const dataSource = new DataSource(options!);
        return addTransactionalDataSource(await dataSource.initialize());
      },
    }),
    AuthModule,
    NotesModule,
    CommonModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    Reflector,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}