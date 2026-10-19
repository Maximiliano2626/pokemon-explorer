/**
 * Modelos del dominio. TypeScript puro: sin NestJS, sin PokéAPI, sin HTTP.
 */

export interface PokemonSummary {
  id: number;
  /** Nombre técnico (slug), por ejemplo `mr-mime` */
  name: string;
  imageUrl: string;
}

export interface PokemonStat {
  /** hp, attack, defense, special-attack, special-defense, speed */
  key: string;
  value: number;
}

export interface PokemonAbility {
  name: string;
  hidden: boolean;
}

export interface Pokemon {
  id: number;
  name: string;
  imageUrl: string | null;
  types: string[];
  heightM: number;
  weightKg: number;
  baseExperience: number | null;
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  /** Categoría, por ejemplo "Pokémon Ratón" */
  genus: string | null;
  /** Descripción de la Pokédex */
  description: string | null;
}