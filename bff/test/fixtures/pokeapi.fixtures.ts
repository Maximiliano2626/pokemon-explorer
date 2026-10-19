import type {
  PokeApiPage,
  PokeApiPokemon,
  PokeApiSpecies,
} from '../../src/pokemon/infrastructure/pokeapi/pokeapi.types.js';

const resource = (name: string, id: number, kind = 'pokemon') => ({
  name,
  url: `https://pokeapi.co/api/v2/${kind}/${id}/`,
});

export const pokemonIndexFixture: PokeApiPage = {
  count: 6,
  next: null,
  previous: null,
  results: [
    resource('bulbasaur', 1),
    resource('charmander', 4),
    resource('charmeleon', 5),
    resource('charizard', 6),
    resource('pikachu', 25),
    resource('mr-mime', 122),
  ],
};

export const pikachuFixture: PokeApiPokemon = {
  id: 25,
  name: 'pikachu',
  height: 4,
  weight: 60,
  base_experience: 112,
  types: [{ slot: 1, type: resource('electric', 13, 'type') }],
  stats: [
    { base_stat: 35, stat: resource('hp', 1, 'stat') },
    { base_stat: 55, stat: resource('attack', 2, 'stat') },
    { base_stat: 90, stat: resource('speed', 6, 'stat') },
  ],
  abilities: [
    { is_hidden: true, slot: 3, ability: resource('lightning-rod', 31, 'ability') },
    { is_hidden: false, slot: 1, ability: resource('static', 9, 'ability') },
  ],
  sprites: {
    front_default: 'https://example.com/front/25.png',
    other: {
      'official-artwork': { front_default: 'https://example.com/artwork/25.png' },
    },
  },
  species: resource('pikachu', 25, 'pokemon-species'),
};

export const pikachuSpeciesFixture: PokeApiSpecies = {
  flavor_text_entries: [
    {
      flavor_text: 'When several of\fthese POKéMON gather...',
      language: resource('en', 9, 'language'),
      version: resource('red', 1, 'version'),
    },
    {
      flavor_text: 'Texto antiguo.',
      language: resource('es', 7, 'language'),
      version: resource('x', 23, 'version'),
    },
    {
      flavor_text:
        'Cuanto más potente es la energía\neléctrica que genera,\nmás suaves y elásticas se vuelven\nsus mejillas.',
      language: resource('es', 7, 'language'),
      version: resource('sword', 33, 'version'),
    },
  ],
  genera: [
    { genus: 'Mouse Pokémon', language: resource('en', 9, 'language') },
    { genus: 'Pokémon Ratón', language: resource('es', 7, 'language') },
  ],
};