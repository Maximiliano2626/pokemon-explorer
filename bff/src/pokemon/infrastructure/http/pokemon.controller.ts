import { Controller, Get, Header, Param, Query, UseFilters } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetPokemonDetailUseCase } from '../../application/use-cases/get-pokemon-detail.use-case.js';
import { ListPokemonUseCase } from '../../application/use-cases/list-pokemon.use-case.js';
import {
  ListPokemonQueryDto,
  PokemonNameParamDto,
} from './dto/pokemon-request.dto.js';
import {
  PokemonDetailResponse,
  PokemonPageResponse,
} from './dto/pokemon-response.dto.js';
import { PokemonExceptionFilter } from './pokemon-exception.filter.js';

// Los datos casi no cambian: el navegador puede reutilizar las respuestas 5 minutos.
const BROWSER_CACHE = 'public, max-age=300';

@ApiTags('pokemon')
@Controller('pokemon')
@UseFilters(PokemonExceptionFilter)
export class PokemonController {
  constructor(
    private readonly listPokemon: ListPokemonUseCase,
    private readonly getPokemonDetail: GetPokemonDetailUseCase,
  ) {}

  /** Catálogo paginado. Acepta `search` para filtrar por nombre o número. */
  @Get()
  @Header('Cache-Control', BROWSER_CACHE)
  list(@Query() query: ListPokemonQueryDto): Promise<PokemonPageResponse> {
    return this.listPokemon.execute(query);
  }

  /** Detalle de un Pokémon por nombre o número. */
  @Get(':name')
  @Header('Cache-Control', BROWSER_CACHE)
  findOne(@Param() { name }: PokemonNameParamDto): Promise<PokemonDetailResponse> {
    return this.getPokemonDetail.execute(name);
  }
}