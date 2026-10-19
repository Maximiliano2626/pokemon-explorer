/** No existe un Pokémon con ese nombre o número. */
export class PokemonNotFoundError extends Error {
  constructor(readonly pokemonName: string) {
    super(`No encontramos un Pokémon llamado "${pokemonName}"`);
    this.name = 'PokemonNotFoundError';
  }
}

/** La fuente de datos no respondió o respondió con un error. */
export class PokemonSourceUnavailableError extends Error {
  constructor(readonly reason: 'timeout' | 'error') {
    super(
      reason === 'timeout'
        ? 'La fuente de datos tardó demasiado en responder'
        : 'La fuente de datos no está disponible',
    );
    this.name = 'PokemonSourceUnavailableError';
  }
}