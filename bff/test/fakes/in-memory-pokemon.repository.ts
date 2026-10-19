import type { PokemonRepository } from '../../src/pokemon/application/ports/pokemon-repository.port.js';
import type { Pokemon, PokemonSummary } from '../../src/pokemon/domain/pokemon.js';

const summary = (id: number, name: string): PokemonSummary => ({
  id,
  name,
  imageUrl: `https://img.test/${id}.png`,
});

export const SUMMARIES: PokemonSummary[] = [
  summary(1, 'bulbasaur'),
  summary(4, 'charmander'),
  summary(5, 'charmeleon'),
  summary(6, 'charizard'),
  summary(25, 'pikachu'),
  summary(122, 'mr-mime'),
];

export const PIKACHU: Pokemon = {
  id: 25,
  name: 'pikachu',
  imageUrl: 'https://img.test/25.png',
  types: ['electric'],
  heightM: 0.4,
  weightKg: 6,
  baseExperience: 112,
  stats: [
    { key: 'hp', value: 35 },
    { key: 'speed', value: 90 },
  ],
  abilities: [
    { name: 'static', hidden: false },
    { name: 'lightning-rod', hidden: true },
  ],
  genus: 'Pokémon Ratón',
  description: 'Almacena electricidad en las mejillas.',
};

/**
 * Implementación del puerto en memoria, para tests.
 * Demuestra que la aplicación no depende de PokéAPI: cualquier
 * clase que cumpla el contrato sirve.
 */
export class InMemoryPokemonRepository implements PokemonRepository {
  /** Nombres que se pidieron a findByName, para verificar en los tests. */
  readonly requestedNames: string[] = [];
  /** Si se define, todos los métodos fallan con este error. */
  failWith: Error | null = null;

  constructor(
    private readonly summaries: PokemonSummary[] = SUMMARIES,
    private readonly details: Pokemon[] = [PIKACHU],
  ) {}

  async findAllSummaries(): Promise<PokemonSummary[]> {
    if (this.failWith) throw this.failWith;
    return this.summaries;
  }

  async findByName(nameOrId: string): Promise<Pokemon | null> {
    this.requestedNames.push(nameOrId);
    if (this.failWith) throw this.failWith;
    return (
      this.details.find((p) => p.name === nameOrId || String(p.id) === nameOrId) ??
      null
    );
  }
}