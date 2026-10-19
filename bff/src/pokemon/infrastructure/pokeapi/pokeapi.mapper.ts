import type {
  Pokemon,
  PokemonSummary,
} from '../../domain/pokemon.js';
import type {
  NamedApiResource,
  PokeApiPokemon,
  PokeApiSpecies,
} from './pokeapi.types.js';

const ARTWORK_BASE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

const PREFERRED_LANGUAGES = ['es', 'en'];

/** "https://pokeapi.co/api/v2/pokemon/25/" -> 25 */
export function extractIdFromUrl(url: string): number {
  const match = /\/(\d+)\/?$/.exec(url);
  if (!match) {
    throw new Error(`No se pudo obtener el id desde la URL: ${url}`);
  }
  return Number(match[1]);
}

export function artworkUrl(id: number): string {
  return `${ARTWORK_BASE_URL}/${id}.png`;
}

/**
 * La lista de PokéAPI solo trae nombre y URL. En vez de pedir el detalle de
 * cada Pokémon (N+1 peticiones), derivamos el id y la imagen desde la URL.
 */
export function toDomainSummary(resource: NamedApiResource): PokemonSummary {
  const id = extractIdFromUrl(resource.url);
  return { id, name: resource.name, imageUrl: artworkUrl(id) };
}

/** PokéAPI trae saltos de línea y caracteres de control heredados de los juegos. */
export function cleanText(text: string): string {
  return text
    .replace(/[\f\n\r\u00ad]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Elige el texto en el primer idioma preferido disponible (la entrada más reciente). */
function pickByLanguage<T extends { language: NamedApiResource }>(
  entries: T[],
): T | undefined {
  for (const language of PREFERRED_LANGUAGES) {
    const matches = entries.filter((entry) => entry.language.name === language);
    if (matches.length > 0) {
      return matches[matches.length - 1];
    }
  }
  return undefined;
}

export function toDomainPokemon(
  pokemon: PokeApiPokemon,
  species: PokeApiSpecies | null,
): Pokemon {
  const description = species
    ? pickByLanguage(species.flavor_text_entries)
    : undefined;
  const genus = species ? pickByLanguage(species.genera) : undefined;

  return {
    id: pokemon.id,
    name: pokemon.name,
    imageUrl:
      pokemon.sprites.other?.['official-artwork']?.front_default ??
      pokemon.sprites.front_default ??
      null,
    types: [...pokemon.types]
      .sort((a, b) => a.slot - b.slot)
      .map((t) => t.type.name),
    heightM: pokemon.height / 10, // decímetros -> metros
    weightKg: pokemon.weight / 10, // hectogramos -> kilos
    baseExperience: pokemon.base_experience,
    stats: pokemon.stats.map((s) => ({ key: s.stat.name, value: s.base_stat })),
    abilities: [...pokemon.abilities]
      .sort((a, b) => a.slot - b.slot)
      .map((a) => ({ name: a.ability.name, hidden: a.is_hidden })),
    genus: genus?.genus ?? null,
    description: description ? cleanText(description.flavor_text) : null,
  };
}