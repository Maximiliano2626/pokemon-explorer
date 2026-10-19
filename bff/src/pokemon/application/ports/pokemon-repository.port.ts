import type { Pokemon, PokemonSummary } from '../../domain/pokemon.js';

/**
 * Puerto de salida: lo que la aplicación necesita de una fuente de Pokémon.
 * Hoy lo implementa PokéAPI; mañana podría ser una base de datos propia.
 */
export interface PokemonRepository {
  /** Todos los Pokémon disponibles, en orden de Pokédex. */
  findAllSummaries(): Promise<PokemonSummary[]>;

  /** Un Pokémon por nombre o número, o `null` si no existe. */
  findByName(nameOrId: string): Promise<Pokemon | null>;
}

/**
 * Las interfaces de TypeScript no existen en tiempo de ejecución,
 * así que Nest necesita este token para saber qué inyectar.
 */
export const POKEMON_REPOSITORY = Symbol('POKEMON_REPOSITORY');