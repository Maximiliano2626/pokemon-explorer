import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration.js';
import { PokemonModule } from './pokemon/pokemon.module.js';

@Module({
  imports: [
    // Lee variables de entorno (y un archivo .env si existe).
    ConfigModule.forRoot({ isGlobal: true, cache: true, load: [configuration] }),
    // Caché en memoria del proceso. El TTL se define en cada escritura.
    CacheModule.register({ isGlobal: true }),
    PokemonModule,
  ],
})
export class AppModule {}