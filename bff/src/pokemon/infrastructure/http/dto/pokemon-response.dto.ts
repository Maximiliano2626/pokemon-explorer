import type {
  Pokemon,
  PokemonAbility,
  PokemonStat,
  PokemonSummary,
} from '../../../domain/pokemon.js';
import type { PokemonPage } from '../../../application/use-cases/list-pokemon.use-case.js';

/*
 * Contratos de respuesta HTTP, documentados en Swagger.
 * Usan `implements` para que TypeScript avise si se desalinean del dominio.
 */

export class PokemonSummaryResponse implements PokemonSummary {
  /** Número en la Pokédex nacional */
  id: number;
  /** Nombre técnico (slug), por ejemplo `mr-mime` */
  name: string;
  /** URL de la ilustración oficial */
  imageUrl: string;
}

export class PokemonPageResponse implements PokemonPage {
  items: PokemonSummaryResponse[];
  /** Total de resultados después de aplicar la búsqueda */
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class PokemonStatResponse implements PokemonStat {
  /** hp, attack, defense, special-attack, special-defense, speed */
  key: string;
  value: number;
}

export class PokemonAbilityResponse implements PokemonAbility {
  name: string;
  /** Habilidad oculta */
  hidden: boolean;
}

export class PokemonDetailResponse implements Pokemon {
  id: number;
  name: string;
  imageUrl: string | null;
  /** Tipos ordenados, por ejemplo ["grass", "poison"] */
  types: string[];
  /** Altura en metros */
  heightM: number;
  /** Peso en kilogramos */
  weightKg: number;
  baseExperience: number | null;
  stats: PokemonStatResponse[];
  abilities: PokemonAbilityResponse[];
  /** Categoría, por ejemplo "Pokémon Ratón" */
  genus: string | null;
  /** Descripción de la Pokédex en español (o inglés si no hay) */
  description: string | null;
}