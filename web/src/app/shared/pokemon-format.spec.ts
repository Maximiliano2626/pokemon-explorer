import {
  formatDecimal,
  formatDexNumber,
  formatPokemonName,
  StatLabelPipe,
  TypeLabelPipe,
} from './pokemon-format';

describe('pokemon-format', () => {
  it('formatea nombres técnicos para mostrarlos', () => {
    expect(formatPokemonName('pikachu')).toBe('Pikachu');
    expect(formatPokemonName('mr-mime')).toBe('Mr Mime');
  });

  it('formatea el número de Pokédex con al menos 3 dígitos', () => {
    expect(formatDexNumber(1)).toBe('#001');
    expect(formatDexNumber(1025)).toBe('#1025');
  });

  it('usa coma decimal', () => {
    expect(formatDecimal(6.9)).toBe('6,9');
    expect(formatDecimal(60)).toBe('60');
  });

  it('traduce tipos y estadísticas, con respaldo para claves desconocidas', () => {
    expect(new TypeLabelPipe().transform('fire')).toBe('Fuego');
    expect(new TypeLabelPipe().transform('stellar')).toBe('Stellar');
    expect(new StatLabelPipe().transform('special-attack')).toBe('Ataque esp.');
  });
});