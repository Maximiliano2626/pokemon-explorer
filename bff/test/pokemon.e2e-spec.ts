import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { POKEMON_REPOSITORY } from '../src/pokemon/application/ports/pokemon-repository.port.js';
import { PokemonSourceUnavailableError } from '../src/pokemon/domain/pokemon.errors.js';
import { InMemoryPokemonRepository } from './fakes/in-memory-pokemon.repository.js';

/**
 * Levanta la app completa (prefijo, validación, controller, casos de uso,
 * filtro de errores) reemplazando SOLO el adaptador de PokéAPI por uno en
 * memoria. Así el test no depende de internet.
 */
describe('API de Pokémon (e2e)', () => {
  let app: INestApplication;
  const repository = new InMemoryPokemonRepository();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(POKEMON_REPOSITORY)
      .useValue(repository)
      .compile();

    app = moduleRef.createNestApplication();
    configureApp(app); // la misma configuración que main.ts
    await app.init();
  });

  beforeEach(() => {
    repository.failWith = null;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/pokemon', () => {
    it('devuelve la primera página con los valores por defecto', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/pokemon')
        .expect(200);

      expect(response.body).toMatchObject({
        total: 6,
        page: 1,
        pageSize: 24,
        totalPages: 1,
      });
      expect(response.body.items[0]).toMatchObject({ id: 1, name: 'bulbasaur' });
      expect(response.headers['cache-control']).toBe('public, max-age=300');
    });

    it('filtra por nombre y pagina los resultados', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/api/pokemon')
        .query({ search: 'char', pageSize: 2 })
        .expect(200);

      expect(body.items.map((p: { name: string }) => p.name)).toEqual([
        'charmander',
        'charmeleon',
      ]);
      expect(body).toMatchObject({ total: 3, totalPages: 2 });
    });

    it('responde 400 si los parámetros no son válidos', async () => {
      await request(app.getHttpServer())
        .get('/api/pokemon')
        .query({ pageSize: 500 })
        .expect(400);
      await request(app.getHttpServer())
        .get('/api/pokemon')
        .query({ page: 'abc' })
        .expect(400);
    });

    it('responde 502 si la fuente de datos falla', async () => {
      repository.failWith = new PokemonSourceUnavailableError('error');

      await request(app.getHttpServer()).get('/api/pokemon').expect(502);
    });

    it('responde 504 si la fuente de datos no responde a tiempo', async () => {
      repository.failWith = new PokemonSourceUnavailableError('timeout');

      await request(app.getHttpServer()).get('/api/pokemon').expect(504);
    });
  });

  describe('GET /api/pokemon/:name', () => {
    it('devuelve el detalle del Pokémon', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/api/pokemon/pikachu')
        .expect(200);

      expect(body).toMatchObject({ id: 25, types: ['electric'], weightKg: 6 });
    });

    it('acepta también el número de Pokédex', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/api/pokemon/25')
        .expect(200);

      expect(body.name).toBe('pikachu');
    });

    it('responde 404 con un mensaje claro si no existe', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/api/pokemon/missingno')
        .expect(404);

      expect(body).toMatchObject({
        statusCode: 404,
        message: 'No encontramos un Pokémon llamado "missingno"',
      });
    });

    it('responde 400 si el nombre tiene caracteres no permitidos', async () => {
      await request(app.getHttpServer())
        .get('/api/pokemon/pika%20chu!')
        .expect(400);
    });
  });
});