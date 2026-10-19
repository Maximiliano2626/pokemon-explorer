import type { PokemonSummary } from './pokemon.js';
import { normalizeSearchTerm, searchPokemon } from './pokemon-search.js';

const index: PokemonSummary[] = [
  { id: 4, name: 'charmander', imageUrl: '' },
  { id: 6, name: 'charizard', imageUrl: '' },
  { id: 25, name: 'pikachu', imageUrl: '' },
  { id: 122, name: 'mr-mime', imageUrl: '' },
  { id: 233, name: 'porygon2', imageUrl: '' },
  { id: 701, name: 'hawlucha', imageUrl: '' },
];

const names = (list: PokemonSummary[]) => list.map((p) => p.name);

describe('normalizeSearchTerm', () => {
  it.each([
    ['  Pikachu ', 'pikachu'],
    ['Mr. Mime', 'mr-mime'],
    ["Farfetch'd", 'farfetchd'],
    ['Flabébé', 'flabebe'],
    [undefined, ''],
  ])('%s -> %s', (input, expected) => {
    expect(normalizeSearchTerm(input)).toBe(expected);
  });
});

describe('searchPokemon', () => {
  it('sin término devuelve todo', () => {
    expect(searchPokemon(index, '')).toHaveLength(index.length);
  });

  it('busca coincidencias parciales, primero las que empiezan con el término', () => {
    expect(names(searchPokemon(index, 'cha'))).toEqual([
      'charmander',
      'charizard',
      'hawlucha',
    ]);
  });

  it('acepta el nombre como lo escribiría una persona', () => {
    expect(names(searchPokemon(index, 'mr mime'))).toEqual(['mr-mime']);
  });

  it('un número busca por id exacto y también dentro de nombres', () => {
    expect(names(searchPokemon(index, '25'))).toEqual(['pikachu']);
    expect(names(searchPokemon(index, '2'))).toEqual(['porygon2']);
  });
});