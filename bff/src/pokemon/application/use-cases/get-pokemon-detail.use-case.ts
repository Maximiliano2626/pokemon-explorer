import { Inject, Injectable } from '@nestjs/common';
import type { Pokemon } from '../../domain/pokemon.js';
import { PokemonNotFoundError } from '../../domain/pokemon.errors.js';
import {
  POKEMON_REPOSITORY,
  type PokemonRepository,
} from '../ports/pokemon-repository.port.js';

@Injectable()
export class GetPokemonDetailUseCase {
  constructor(
    @Inject(POKEMON_REPOSITORY) private readonly repository: PokemonRepository,
  ) {}

  async execute(nameOrId: string): Promise<Pokemon> {
    const pokemon = await this.repository.findByName(nameOrId.trim().toLowerCase());
    if (!pokemon) {
      throw new PokemonNotFoundError(nameOrId);
    }
    return pokemon;
  }
}