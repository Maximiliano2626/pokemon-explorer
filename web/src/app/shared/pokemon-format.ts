import { Pipe, PipeTransform } from '@angular/core';

/** "mr-mime" -> "Mr Mime" */
export function formatPokemonName(name: string): string {
  return name
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** 25 -> "#025" (los ids de formas alternativas, como 10034, se muestran tal cual) */
export function formatDexNumber(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

const decimalFormat = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 });

/** 6.9 -> "6,9" (formato decimal en español) */
export function formatDecimal(value: number): string {
  return decimalFormat.format(value);
}

export const TYPE_LABELS: Record<string, string> = {
  normal: 'Normal',
  fire: 'Fuego',
  water: 'Agua',
  grass: 'Planta',
  electric: 'Eléctrico',
  ice: 'Hielo',
  fighting: 'Lucha',
  poison: 'Veneno',
  ground: 'Tierra',
  flying: 'Volador',
  psychic: 'Psíquico',
  bug: 'Bicho',
  rock: 'Roca',
  ghost: 'Fantasma',
  dragon: 'Dragón',
  dark: 'Siniestro',
  steel: 'Acero',
  fairy: 'Hada',
};

export const STAT_LABELS: Record<string, string> = {
  hp: 'PS',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'Ataque esp.',
  'special-defense': 'Defensa esp.',
  speed: 'Velocidad',
};

@Pipe({ name: 'pokemonName' })
export class PokemonNamePipe implements PipeTransform {
  transform(name: string): string {
    return formatPokemonName(name);
  }
}

@Pipe({ name: 'dexNumber' })
export class DexNumberPipe implements PipeTransform {
  transform(id: number): string {
    return formatDexNumber(id);
  }
}

@Pipe({ name: 'decimal' })
export class DecimalEsPipe implements PipeTransform {
  transform(value: number): string {
    return formatDecimal(value);
  }
}

@Pipe({ name: 'typeLabel' })
export class TypeLabelPipe implements PipeTransform {
  transform(type: string): string {
    return TYPE_LABELS[type] ?? formatPokemonName(type);
  }
}

@Pipe({ name: 'statLabel' })
export class StatLabelPipe implements PipeTransform {
  transform(key: string): string {
    return STAT_LABELS[key] ?? formatPokemonName(key);
  }
}