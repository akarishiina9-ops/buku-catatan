import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  initializeTransactionalContext();

  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const corsOrigin = process.env.CORS_ORIGIN ?? '*';
  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: corsOrigin !== '*',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Catatan Buku API')
      .setDescription('CRUD catatan buku dengan JWT auth')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  const port = parseInt(process.env.PORT ?? '3000', 10);
  const env = process.env.NODE_ENV ?? 'development';
  await app.listen(port);
  logger.log(`Application running on port ${port} [${env}]`);
}
bootstrap();