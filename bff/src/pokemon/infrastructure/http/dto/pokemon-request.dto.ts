import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export const MAX_PAGE_SIZE = 60;

export class ListPokemonQueryDto {
  /** Texto a buscar en el nombre. Si es un número, también busca por número de Pokédex. */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  search?: string;

  /** Página (desde 1) */
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  /** Elementos por página (máximo 60) */
  @ApiPropertyOptional({ default: 24 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  pageSize: number = 24;
}

export class PokemonNameParamDto {
  /** Nombre (slug) o número del Pokémon, por ejemplo `pikachu` o `25` */
  @Matches(/^[a-z0-9-]{1,60}$/i, {
    message: 'El nombre solo puede contener letras, números y guiones',
  })
  name: string;
}