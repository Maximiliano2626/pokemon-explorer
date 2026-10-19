import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PokemonApiService } from '../../core/pokemon-api.service';
import { PokemonPage } from '../../core/pokemon.models';
import { CatalogPage, PAGE_SIZE } from './catalog.page';

/** Arma una página de resultados a partir de una lista de nombres. */
const page = (names: string[], extra: Partial<PokemonPage> = {}): PokemonPage => ({
  items: names.map((name, i) => ({ id: i + 1, name, imageUrl: `https://img/${i + 1}.png` })),
  total: names.length,
  page: 1,
  pageSize: PAGE_SIZE,
  totalPages: 1,
  ...extra,
});

describe('CatalogPage', () => {
  // Servicio falso: cada test decide qué responde.
  const api = { list: vi.fn(), detail: vi.fn() };

  /** Crea el componente simulando los query params de la URL. */
  async function render(inputs: { q?: string; page?: string } = {}) {
    TestBed.configureTestingModule({
      imports: [CatalogPage],
      providers: [provideRouter([]), { provide: PokemonApiService, useValue: api }],
    });
    const fixture = TestBed.createComponent(CatalogPage);
    fixture.componentRef.setInput('q', inputs.q);
    fixture.componentRef.setInput('page', inputs.page);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  beforeEach(() => api.list.mockReset());

  it('muestra las tarjetas y el total', async () => {
    api.list.mockReturnValue(of(page(['bulbasaur', 'mr-mime'])));

    const { el } = await render();

    const names = [...el.querySelectorAll('.name')].map((n) => n.textContent?.trim());
    expect(names).toEqual(['Bulbasaur', 'Mr Mime']);
    expect(el.querySelector('.summary')?.textContent).toContain('2 Pokémon en el catálogo');
  });

  it('lee la búsqueda y la página desde la URL', async () => {
    api.list.mockReturnValue(of(page(['charmander'])));

    await render({ q: 'char', page: '3' });

    expect(api.list).toHaveBeenCalledWith({ search: 'char', page: 3, pageSize: PAGE_SIZE });
  });

  it('ignora páginas inválidas y usa la primera', async () => {
    api.list.mockReturnValue(of(page([])));

    await render({ page: 'abc' });

    expect(api.list).toHaveBeenCalledWith({ search: '', page: 1, pageSize: PAGE_SIZE });
  });

  it('explica cuando la búsqueda no tiene resultados', async () => {
    api.list.mockReturnValue(of(page([])));

    const { el } = await render({ q: 'zzz' });

    expect(el.textContent).toContain('Ningún Pokémon coincide con «zzz»');
    expect(el.querySelector('button')?.textContent).toContain('Limpiar búsqueda');
  });

  it('muestra un error con opción de reintentar', async () => {
    api.list.mockReturnValue(throwError(() => new Error('offline')));

    const { el } = await render();

    expect(el.querySelector('[role="alert"]')?.textContent).toContain(
      'No pudimos cargar el catálogo',
    );
    expect(el.querySelector('button')?.textContent).toContain('Reintentar');
  });

  it('actualiza la URL cuando la persona deja de escribir', async () => {
    api.list.mockReturnValue(of(page(['pikachu'])));
    const { fixture, el } = await render();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    // Simulamos que la persona escribe en el buscador.
    const input = el.querySelector<HTMLInputElement>('#search')!;
    input.value = 'pika';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    // Esperamos a que termine el debounce (300 ms).
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate.mock.calls[0][1]).toMatchObject({
      queryParams: { q: 'pika', page: null },
    });
  });
});