/**
 * Contratos que expone el BFF (ver bff/.../http/dto/pokemon-response.dto.ts).
 * El frontend nunca conoce la forma de las respuestas de PokéAPI.
 */

export interface PokemonSummary {
  id: number;
  name: string;
  imageUrl: string;
}

export interface PokemonPage {
  items: PokemonSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PokemonStat {
  key: string;
  value: number;
}

export interface PokemonAbility {
  name: string;
  hidden: boolean;
}

export interface PokemonDetail {
  id: number;
  name: string;
  imageUrl: string | null;
  types: string[];
  heightM: number;
  weightKg: number;
  baseExperience: number | null;
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  genus: string | null;
  description: string | null;
}

/** Parámetros para pedir una página del catálogo. */
export interface CatalogQuery {
  search: string;
  page: number;
  pageSize: number;
}