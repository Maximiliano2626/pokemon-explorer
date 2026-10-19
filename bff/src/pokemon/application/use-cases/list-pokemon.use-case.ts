import { Inject, Injectable } from '@nestjs/common';
import type { PokemonSummary } from '../../domain/pokemon.js';
import { searchPokemon } from '../../domain/pokemon-search.js';
import {
  POKEMON_REPOSITORY,
  type PokemonRepository,
} from '../ports/pokemon-repository.port.js';

export interface ListPokemonQuery {
  search?: string;
  /** Página, desde 1 */
  page: number;
  pageSize: number;
}

export interface PokemonPage {
  items: PokemonSummary[];
  /** Total de resultados después de aplicar la búsqueda */
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Catálogo paginado con búsqueda opcional.
 * Listado y búsqueda usan la misma fuente (el índice completo),
 * así el total y la paginación siempre son consistentes.
 */
@Injectable()
export class ListPokemonUseCase {
  constructor(
    @Inject(POKEMON_REPOSITORY) private readonly repository: PokemonRepository,
  ) {}

  async execute({ search, page, pageSize }: ListPokemonQuery): Promise<PokemonPage> {
    const all = await this.repository.findAllSummaries();
    const results = searchPokemon(all, search);
    const start = (page - 1) * pageSize;

    return {
      items: results.slice(start, start + pageSize),
      total: results.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(results.length / pageSize)),
    };
  }
}