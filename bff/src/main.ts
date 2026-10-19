import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import type { AppConfig } from './config/configuration.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  app.enableShutdownHooks();

  const port = app
    .get<ConfigService<AppConfig, true>>(ConfigService)
    .get('port', { infer: true });
  await app.listen(port);

  Logger.log(
    `BFF escuchando en http://localhost:${port}/api (Swagger en /api/docs)`,
    'Bootstrap',
  );
}
await bootstrap();