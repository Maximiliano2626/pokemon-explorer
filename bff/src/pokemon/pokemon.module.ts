import { Module } from '@nestjs/common';
import { POKEMON_REPOSITORY } from './application/ports/pokemon-repository.port.js';
import { GetPokemonDetailUseCase } from './application/use-cases/get-pokemon-detail.use-case.js';
import { ListPokemonUseCase } from './application/use-cases/list-pokemon.use-case.js';
import { PokemonController } from './infrastructure/http/pokemon.controller.js';
import { PokeApiPokemonRepository } from './infrastructure/pokeapi/pokeapi-pokemon.repository.js';

@Module({
  controllers: [PokemonController],
  providers: [
    ListPokemonUseCase,
    GetPokemonDetailUseCase,
    // Conecta el puerto con su adaptador: "cuando alguien pida
    // POKEMON_REPOSITORY, entrega la implementación de PokéAPI".
    { provide: POKEMON_REPOSITORY, useClass: PokeApiPokemonRepository },
  ],
})
export class PokemonModule {}