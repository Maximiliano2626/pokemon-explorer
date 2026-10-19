/**
 * Subconjunto de los tipos de PokéAPI que usa este adaptador.
 * Estos tipos NUNCA salen de infrastructure/: el resto de la app
 * solo conoce los modelos del dominio.
 * Referencia: https://pokeapi.co/docs/v2
 */
export interface NamedApiResource {
  name: string;
  url: string;
}

export interface PokeApiPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedApiResource[];
}

export interface PokeApiPokemon {
  id: number;
  name: string;
  height: number; // decímetros
  weight: number; // hectogramos
  base_experience: number | null;
  types: { slot: number; type: NamedApiResource }[];
  stats: { base_stat: number; stat: NamedApiResource }[];
  abilities: { is_hidden: boolean; slot: number; ability: NamedApiResource }[];
  sprites: {
    front_default: string | null;
    other?: {
      'official-artwork'?: { front_default: string | null };
    };
  };
  species: NamedApiResource;
}

export interface PokeApiSpecies {
  flavor_text_entries: {
    flavor_text: string;
    language: NamedApiResource;
    version: NamedApiResource;
  }[];
  genera: { genus: string; language: NamedApiResource }[];
}