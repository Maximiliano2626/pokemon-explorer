import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { Cache } from 'cache-manager';
import {
  pikachuFixture,
  pikachuSpeciesFixture,
  pokemonIndexFixture,
} from '../../../../test/fixtures/pokeapi.fixtures.js';
import type { AppConfig } from '../../../config/configuration.js';
import { PokemonSourceUnavailableError } from '../../domain/pokemon.errors.js';
import { PokeApiPokemonRepository } from './pokeapi-pokemon.repository.js';

const BASE_URL = 'https://pokeapi.test/api/v2';

/** Caché mínima en memoria con la parte de la interfaz que usamos. */
function createMemoryCache(): Cache {
  const store = new Map<string, unknown>();
  return {
    get: async (key: string) => store.get(key),
    set: async (key: string, value: unknown) => {
      store.set(key, value);
      return value;
    },
  } as unknown as Cache;
}

const config = {
  get: () => ({ baseUrl: BASE_URL, timeoutMs: 1000, cacheTtlMs: 60_000 }),
} as unknown as ConfigService<AppConfig, true>;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

/**
 * Reemplaza fetch por una versión falsa que responde según la ruta pedida.
 * Las rutas no definidas responden 404.
 */
function mockFetch(routes: Record<string, () => Response | Promise<Response>>) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const path = String(input).replace(BASE_URL, '');
    const handler = routes[path];
    return handler ? handler() : new Response('Not Found', { status: 404 });
  });
}

describe('PokeApiPokemonRepository', () => {
  let repository: PokeApiPokemonRepository;

  beforeEach(() => {
    repository = new PokeApiPokemonRepository(createMemoryCache(), config);
    // Los errores se registran a propósito; los silenciamos para no ensuciar la salida.
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('findAllSummaries', () => {
    it('devuelve el índice traducido al dominio y lo guarda en caché', async () => {
      const fetchMock = mockFetch({
        '/pokemon?limit=100000&offset=0': () => json(pokemonIndexFixture),
      });

      const first = await repository.findAllSummaries();
      const second = await repository.findAllSummaries();

      expect(first).toHaveLength(6);
      expect(first[0]).toEqual({
        id: 1,
        name: 'bulbasaur',
        imageUrl: expect.stringContaining('/official-artwork/1.png'),
      });
      expect(second).toEqual(first);
      // La segunda llamada salió de la caché.
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('reutiliza la petición en curso si llegan dos iguales a la vez', async () => {
      const fetchMock = mockFetch({
        '/pokemon?limit=100000&offset=0': () => json(pokemonIndexFixture),
      });

      await Promise.all([
        repository.findAllSummaries(),
        repository.findAllSummaries(),
      ]);

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('si el índice no existe, la fuente se considera no disponible', async () => {
      mockFetch({}); // todo responde 404

      await expect(repository.findAllSummaries()).rejects.toBeInstanceOf(
        PokemonSourceUnavailableError,
      );
    });
  });

  describe('findByName', () => {
    it('combina pokemon + especie en un modelo del dominio', async () => {
      mockFetch({
        '/pokemon/pikachu': () => json(pikachuFixture),
        '/pokemon-species/pikachu': () => json(pikachuSpeciesFixture),
      });

      const pokemon = await repository.findByName('pikachu');

      expect(pokemon).toMatchObject({
        id: 25,
        name: 'pikachu',
        types: ['electric'],
        weightKg: 6,
        genus: 'Pokémon Ratón',
      });
    });

    it('devuelve null si no existe y no guarda el 404 en caché', async () => {
      const fetchMock = mockFetch({});

      expect(await repository.findByName('missingno')).toBeNull();
      expect(await repository.findByName('missingno')).toBeNull();
      // Dos llamadas reales: el "no encontrado" no quedó en caché.
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('si falla la especie, devuelve el Pokémon sin descripción', async () => {
      mockFetch({
        '/pokemon/pikachu': () => json(pikachuFixture),
        '/pokemon-species/pikachu': () => new Response('boom', { status: 500 }),
      });

      const pokemon = await repository.findByName('pikachu');

      expect(pokemon?.name).toBe('pikachu');
      expect(pokemon?.description).toBeNull();
      expect(pokemon?.genus).toBeNull();
    });
  });

  describe('errores de la fuente', () => {
    it('traduce un 5xx a PokemonSourceUnavailableError("error")', async () => {
      mockFetch({ '/pokemon/pikachu': () => new Response('boom', { status: 500 }) });

      const error = await repository.findByName('pikachu').catch((e: unknown) => e);

      expect(error).toBeInstanceOf(PokemonSourceUnavailableError);
      expect((error as PokemonSourceUnavailableError).reason).toBe('error');
    });

    it('traduce un error de red a PokemonSourceUnavailableError("error")', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('fetch failed'));

      const error = await repository.findByName('pikachu').catch((e: unknown) => e);

      expect(error).toBeInstanceOf(PokemonSourceUnavailableError);
      expect((error as PokemonSourceUnavailableError).reason).toBe('error');
    });

    it('traduce el timeout a PokemonSourceUnavailableError("timeout")', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(
        new DOMException('The operation timed out.', 'TimeoutError'),
      );

      const error = await repository.findByName('pikachu').catch((e: unknown) => e);

      expect(error).toBeInstanceOf(PokemonSourceUnavailableError);
      expect((error as PokemonSourceUnavailableError).reason).toBe('timeout');
    });
  });
});