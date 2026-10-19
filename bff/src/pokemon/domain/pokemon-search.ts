import type { PokemonSummary } from './pokemon.js';

/**
 * Normaliza lo que escribe la persona al formato de nombres técnico:
 *   "  Mr. Mime " -> "mr-mime"
 *   "Farfetch'd"  -> "farfetchd"
 *   "Flabébé"     -> "flabebe"
 */
export function normalizeSearchTerm(raw: string | undefined): string {
  if (!raw) return '';
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
    .toLowerCase()
    .replace(/[.'’]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-');
}

/**
 * Los que empiezan con el término van primero; luego los que lo contienen.
 * Si el término es numérico, también coincide por número de Pokédex.
 */
export function searchPokemon(
  index: PokemonSummary[],
  rawTerm: string | undefined,
): PokemonSummary[] {
  const term = normalizeSearchTerm(rawTerm);
  if (!term) return index;

  const numericId = /^\d+$/.test(term) ? Number(term) : null;
  const startsWith: PokemonSummary[] = [];
  const contains: PokemonSummary[] = [];

  for (const pokemon of index) {
    if (pokemon.id === numericId || pokemon.name.startsWith(term)) {
      startsWith.push(pokemon);
    } else if (pokemon.name.includes(term)) {
      contains.push(pokemon);
    }
  }

  return [...startsWith, ...contains];
}