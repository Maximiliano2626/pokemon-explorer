import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PokemonApiService } from '../../core/pokemon-api.service';
import { PokemonDetail } from '../../core/pokemon.models';
import { PokemonDetailPage } from './pokemon-detail.page';

const pikachu: PokemonDetail = {
  id: 25,
  name: 'pikachu',
  imageUrl: 'https://img/25.png',
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

describe('PokemonDetailPage', () => {
  // Servicio falso: cada test decide qué responde.
  const api = { list: vi.fn(), detail: vi.fn() };

  /** Crea el componente simulando el parámetro de ruta `:name`. */
  async function render(name: string) {
    TestBed.configureTestingModule({
      imports: [PokemonDetailPage],
      providers: [provideRouter([]), { provide: PokemonApiService, useValue: api }],
    });
    const fixture = TestBed.createComponent(PokemonDetailPage);
    fixture.componentRef.setInput('name', name);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(() => api.detail.mockReset());

  it('muestra la información principal', async () => {
    api.detail.mockReturnValue(of(pikachu));

    const el = await render('pikachu');

    expect(api.detail).toHaveBeenCalledWith('pikachu');
    expect(el.querySelector('h1')?.textContent).toContain('Pikachu');
    expect(el.textContent).toContain('Pokémon Ratón');
    expect(el.textContent).toContain('Eléctrico');
    expect(el.textContent).toContain('0,4 m');
    // 35 + 90 = 125
    expect(el.querySelector('tfoot')?.textContent).toContain('125');
    expect(el.querySelector('.abilities')?.textContent).toContain('Lightning Rod');
    expect(el.querySelector('.abilities')?.textContent).toContain('oculta');
  });

  it('actualiza el título de la pestaña con el nombre', async () => {
    api.detail.mockReturnValue(of(pikachu));

    await render('mr-mime');

    expect(TestBed.inject(Title).getTitle()).toBe('Mr Mime · Explorador Pokémon');
  });

  it('distingue un Pokémon inexistente y ofrece buscarlo', async () => {
    api.detail.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));

    const el = await render('missingno');

    expect(el.querySelector('[role="alert"]')?.textContent).toContain(
      'No encontramos a «missingno»',
    );
    expect(el.querySelector('a.button')?.textContent).toContain('Buscar «missingno»');
  });

  it('ante un error del servidor ofrece reintentar', async () => {
    api.detail.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 502 })));

    const el = await render('pikachu');

    expect(el.querySelector('[role="alert"]')?.textContent).toContain(
      'No pudimos cargar este Pokémon',
    );
    expect(el.querySelector('button')?.textContent).toContain('Reintentar');
  });
});