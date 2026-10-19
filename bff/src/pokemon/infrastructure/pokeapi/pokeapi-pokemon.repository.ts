import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Cache } from 'cache-manager';
import type { AppConfig } from '../../../config/configuration.js';
import type { PokemonRepository } from '../../application/ports/pokemon-repository.port.js';
import type { Pokemon, PokemonSummary } from '../../domain/pokemon.js';
import { PokemonSourceUnavailableError } from '../../domain/pokemon.errors.js';
import { toDomainPokemon, toDomainSummary } from './pokeapi.mapper.js';
import type {
  PokeApiPage,
  PokeApiPokemon,
  PokeApiSpecies,
} from './pokeapi.types.js';

/**
 * Adaptador de salida: implementa el puerto PokemonRepository usando PokéAPI.
 *
 * Responsabilidades:
 *  - Petición HTTP con timeout.
 *  - Caché de respuestas exitosas (los datos casi no cambian).
 *  - Evitar peticiones duplicadas simultáneas al mismo recurso.
 *  - Traducir fallos técnicos a errores del dominio.
 */
@Injectable()
export class PokeApiPokemonRepository implements PokemonRepository {
  private readonly logger = new Logger(PokeApiPokemonRepository.name);
  private readonly inFlight = new Map<string, Promise<unknown>>();
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly cacheTtlMs: number;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    config: ConfigService<AppConfig, true>,
  ) {
    const { baseUrl, timeoutMs, cacheTtlMs } = config.get('pokeApi', {
      infer: true,
    });
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
    this.cacheTtlMs = cacheTtlMs;
  }

  // ─── Métodos del puerto ────────────────────────────────────────────

  async findAllSummaries(): Promise<PokemonSummary[]> {
    // ~1.300 elementos (~100 KB). Se pide una vez y queda en caché.
    const page = await this.get<PokeApiPage>('/pokemon?limit=100000&offset=0');
    if (!page) {
      // El listado siempre debería existir; si no, la fuente está fallando.
      throw new PokemonSourceUnavailableError('error');
    }
    return page.results.map(toDomainSummary);
  }

  async findByName(nameOrId: string): Promise<Pokemon | null> {
    const pokemon = await this.get<PokeApiPokemon>(
      `/pokemon/${encodeURIComponent(nameOrId)}`,
    );
    if (!pokemon) {
      return null; // No existe: el caso de uso decide qué hacer.
    }

    // La especie solo aporta descripción y categoría. Si falla,
    // devolvemos el Pokémon igual en vez de romper toda la respuesta.
    const species = await this.get<PokeApiSpecies>(
      `/pokemon-species/${encodeURIComponent(pokemon.species.name)}`,
    ).catch((error: unknown) => {
      this.logger.warn(
        `Sin datos de especie para ${pokemon.species.name}: ${String(error)}`,
      );
      return null;
    });

    return toDomainPokemon(pokemon, species);
  }

  // ─── Detalles técnicos (privados) ──────────────────────────────────

  /** Devuelve el recurso, `null` si no existe (404), o lanza si la fuente falla. */
  private async get<T>(path: string): Promise<T | null> {
    const cached = await this.cache.get<T>(path);
    if (cached !== undefined && cached !== null) {
      return cached;
    }

    // Si ya hay una petición en curso para el mismo recurso, la reutilizamos.
    const pending = this.inFlight.get(path) as Promise<T | null> | undefined;
    if (pending) {
      return pending;
    }

    const request = this.fetchJson<T>(path)
      .then(async (data) => {
        if (data !== null) {
          await this.cache.set(path, data, this.cacheTtlMs);
        }
        return data;
      })
      .finally(() => this.inFlight.delete(path));

    this.inFlight.set(path, request);
    return request;
  }

  private async fetchJson<T>(path: string): Promise<T | null> {
    const url = `${this.baseUrl}${path}`;
    let response: Response;

    try {
      response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        this.logger.warn(`Timeout (${this.timeoutMs} ms) consultando ${url}`);
        throw new PokemonSourceUnavailableError('timeout');
      }
      this.logger.error(
        `Error de red consultando ${url}`,
        error instanceof Error ? error.stack : error,
      );
      throw new PokemonSourceUnavailableError('error');
    }

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      this.logger.error(`PokéAPI respondió ${response.status} para ${url}`);
      throw new PokemonSourceUnavailableError('error');
    }

    try {
      return (await response.json()) as T;
    } catch {
      this.logger.error(`PokéAPI devolvió JSON inválido para ${url}`);
      throw new PokemonSourceUnavailableError('error');
    }
  }
}