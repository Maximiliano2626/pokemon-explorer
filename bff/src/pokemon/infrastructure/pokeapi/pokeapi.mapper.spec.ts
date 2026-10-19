import {
  pikachuFixture,
  pikachuSpeciesFixture,
} from '../../../../test/fixtures/pokeapi.fixtures.js';
import {
  artworkUrl,
  cleanText,
  extractIdFromUrl,
  toDomainPokemon,
  toDomainSummary,
} from './pokeapi.mapper.js';

describe('pokeapi.mapper', () => {
  it('extrae el id desde la URL de PokéAPI', () => {
    expect(extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
    expect(extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/10034')).toBe(10034);
    expect(() => extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/')).toThrow();
  });

  it('construye el resumen sin pedir el detalle (evita N+1)', () => {
    expect(
      toDomainSummary({ name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' }),
    ).toEqual({ id: 25, name: 'pikachu', imageUrl: artworkUrl(25) });
  });

  it('limpia caracteres de control del texto de la Pokédex', () => {
    expect(cleanText('Uno\fdos\ntres  \n cuatro')).toBe('Uno dos tres cuatro');
  });

  it('convierte unidades, ordena por slot y prefiere español', () => {
    const pokemon = toDomainPokemon(pikachuFixture, pikachuSpeciesFixture);

    expect(pokemon.heightM).toBe(0.4);
    expect(pokemon.weightKg).toBe(6);
    expect(pokemon.imageUrl).toBe('https://example.com/artwork/25.png');
    expect(pokemon.abilities).toEqual([
      { name: 'static', hidden: false },
      { name: 'lightning-rod', hidden: true },
    ]);
    expect(pokemon.genus).toBe('Pokémon Ratón');
    // Usa la entrada en español más reciente.
    expect(pokemon.description).toBe(
      'Cuanto más potente es la energía eléctrica que genera, más suaves y elásticas se vuelven sus mejillas.',
    );
  });

  it('cae a inglés si no hay español y tolera especie ausente', () => {
    const onlyEnglish = {
      ...pikachuSpeciesFixture,
      flavor_text_entries: pikachuSpeciesFixture.flavor_text_entries.filter(
        (e) => e.language.name === 'en',
      ),
    };
    expect(toDomainPokemon(pikachuFixture, onlyEnglish).description).toBe(
      'When several of these POKéMON gather...',
    );

    const withoutSpecies = toDomainPokemon(pikachuFixture, null);
    expect(withoutSpecies.description).toBeNull();
    expect(withoutSpecies.genus).toBeNull();
  });

  it('usa el sprite básico si no hay ilustración oficial', () => {
    const pokemon = toDomainPokemon(
      { ...pikachuFixture, sprites: { front_default: 'front.png' } },
      null,
    );
    expect(pokemon.imageUrl).toBe('front.png');
  });
});