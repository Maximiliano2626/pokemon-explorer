import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { rxResource, takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs';
import { PokemonApiService } from '../../core/pokemon-api.service';
import { CatalogQuery, PokemonPage } from '../../core/pokemon.models';
import { Pagination } from './pagination';
import { PokemonCard } from './pokemon-card';

export const PAGE_SIZE = 24;
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Catálogo con búsqueda.
 *
 * La URL es la fuente de verdad (`?q=char&page=2`): se puede compartir,
 * recargar y navegar con atrás/adelante sin perder el estado. Los query
 * params llegan como inputs gracias a `withComponentInputBinding()`.
 */
@Component({
  selector: 'app-catalog-page',
  imports: [PokemonCard, Pagination],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalog.page.html',
  styleUrl: './catalog.page.scss',
})
export class CatalogPage {
  // ─── 1. Entradas: llegan desde la URL ──────────────────────────────

  /** Query param `q` */
  readonly q = input<string | undefined>();
  /** Query param `page` */
  readonly page = input<string | undefined>();

  private readonly api = inject(PokemonApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // ─── 2. Valores derivados de la URL ────────────────────────────────

  protected readonly search = computed(() => (this.q() ?? '').trim());

  /** Si la URL trae una página inválida (?page=abc o ?page=-3), usamos la 1. */
  protected readonly currentPage = computed(() => {
    const page = Number(this.page());
    return Number.isInteger(page) && page > 0 ? page : 1;
  });

  /** Lo que hay escrito en el buscador. Se sincroniza con la URL (por ejemplo, al ir atrás). */
  protected readonly searchText = linkedSignal(() => this.q() ?? '');

  // ─── 3. Carga de datos: se repite sola cuando cambian los parámetros ─

  protected readonly catalog = rxResource({
    params: (): CatalogQuery => ({
      search: this.search(),
      page: this.currentPage(),
      pageSize: PAGE_SIZE,
    }),
    stream: ({ params }) => this.api.list(params),
  });

  /**
   * Última página recibida. Mientras llega la siguiente, seguimos mostrando
   * la anterior (atenuada) en vez de vaciar la grilla.
   */
  protected readonly results = linkedSignal<PokemonPage | undefined, PokemonPage | undefined>({
    source: () => (this.catalog.hasValue() ? this.catalog.value() : undefined),
    computation: (current, previous) => current ?? previous?.value,
  });

  /** Se pasa a cada tarjeta para que "Volver" recuerde la búsqueda y la página. */
  protected readonly returnTo = computed(() => ({
    q: this.search() || undefined,
    page: this.currentPage() > 1 ? this.currentPage() : undefined,
  }));

  protected readonly skeletons = Array.from({ length: 12 }, (_, i) => i);

  // ─── 4. Del buscador a la URL ──────────────────────────────────────

  constructor() {
    // Esperamos a que la persona deje de teclear y recién ahí actualizamos
    // la URL (volviendo a la página 1). La URL dispara la nueva consulta.
    toObservable(this.searchText)
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        map((text) => text.trim()),
        distinctUntilChanged(),
        filter((text) => text !== this.search()),
        takeUntilDestroyed(),
      )
      .subscribe((text) => this.updateUrl({ q: text || null, page: null }));
  }

  // ─── 5. Acciones del template ──────────────────────────────────────

  protected onSearchInput(event: Event): void {
    this.searchText.set((event.target as HTMLInputElement).value);
  }

  protected clearSearch(): void {
    this.searchText.set('');
    this.updateUrl({ q: null, page: null });
  }

  protected goToFirstPage(): void {
    this.updateUrl({ page: null });
  }

  private updateUrl(queryParams: Record<string, string | null>): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}