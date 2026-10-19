import {
  InMemoryPokemonRepository,
  PIKACHU,
} from '../../../../test/fakes/in-memory-pokemon.repository.js';
import {
  PokemonNotFoundError,
  PokemonSourceUnavailableError,
} from '../../domain/pokemon.errors.js';
import { GetPokemonDetailUseCase } from './get-pokemon-detail.use-case.js';
import { ListPokemonUseCase } from './list-pokemon.use-case.js';

describe('ListPokemonUseCase', () => {
  let repository: InMemoryPokemonRepository;
  let listPokemon: ListPokemonUseCase;

  beforeEach(() => {
    repository = new InMemoryPokemonRepository();
    listPokemon = new ListPokemonUseCase(repository);
  });

  it('pagina el catálogo completo', async () => {
    const page = await listPokemon.execute({ page: 2, pageSize: 4 });

    expect(page.items.map((p) => p.name)).toEqual(['pikachu', 'mr-mime']);
    expect(page).toMatchObject({ total: 6, page: 2, pageSize: 4, totalPages: 2 });
  });

  it('filtra por nombre y pagina sobre los resultados', async () => {
    const page = await listPokemon.execute({ search: 'char', page: 1, pageSize: 2 });

    expect(page.items.map((p) => p.name)).toEqual(['charmander', 'charmeleon']);
    expect(page).toMatchObject({ total: 3, totalPages: 2 });
  });

  it('sin resultados devuelve una página vacía válida', async () => {
    const page = await listPokemon.execute({ search: 'zzz', page: 1, pageSize: 24 });

    expect(page).toMatchObject({ items: [], total: 0, totalPages: 1 });
  });

  it('una página fuera de rango devuelve items vacíos pero el total correcto', async () => {
    const page = await listPokemon.execute({ page: 99, pageSize: 4 });

    expect(page).toMatchObject({ items: [], total: 6, totalPages: 2 });
  });

  it('propaga el error si la fuente no está disponible', async () => {
    repository.failWith = new PokemonSourceUnavailableError('timeout');

    await expect(listPokemon.execute({ page: 1, pageSize: 24 })).rejects.toBeInstanceOf(
      PokemonSourceUnavailableError,
    );
  });
});

describe('GetPokemonDetailUseCase', () => {
  let repository: InMemoryPokemonRepository;
  let getPokemonDetail: GetPokemonDetailUseCase;

  beforeEach(() => {
    repository = new InMemoryPokemonRepository();
    getPokemonDetail = new GetPokemonDetailUseCase(repository);
  });

  it('devuelve el Pokémon pedido', async () => {
    expect(await getPokemonDetail.execute('pikachu')).toEqual(PIKACHU);
  });

  it('normaliza el nombre antes de consultar el repositorio', async () => {
    await getPokemonDetail.execute('  Pikachu ');

    expect(repository.requestedNames).toEqual(['pikachu']);
  });

  it('lanza PokemonNotFoundError con el nombre tal como se escribió', async () => {
    const error = await getPokemonDetail.execute('MissingNo').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(PokemonNotFoundError);
    expect((error as PokemonNotFoundError).pokemonName).toBe('MissingNo');
  });
});