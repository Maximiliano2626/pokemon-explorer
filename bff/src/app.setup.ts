import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { AppConfig } from './config/configuration.js';

export function configureApp(app: INestApplication): void {
  const config = app.get<ConfigService<AppConfig, true>>(ConfigService);

  app.setGlobalPrefix('api');
  app.enableCors({ origin: config.get('corsOrigins', { infer: true }) });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // convierte query params a number y aplica defaults
      whitelist: true, // descarta propiedades no declaradas en el DTO
    }),
  );

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Pokémon Explorer · BFF')
      .setDescription('Backend for Frontend sobre PokéAPI')
      .setVersion('1.0')
      .build(),
  );
  SwaggerModule.setup('api/docs', app, document);
}