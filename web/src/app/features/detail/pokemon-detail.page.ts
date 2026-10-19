import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Params, Router, RouterLink } from '@angular/router';
import { PokemonApiService } from '../../core/pokemon-api.service';
import {
  DecimalEsPipe,
  DexNumberPipe,
  formatPokemonName,
  PokemonNamePipe,
  StatLabelPipe,
} from '../../shared/pokemon-format';
import { PokemonImage } from '../../shared/pokemon-image';
import { TypeBadge } from '../../shared/type-badge';

/** Valor base más alto posible en los juegos; sirve de escala para las barras. */
const MAX_BASE_STAT = 255;

@Component({
  selector: 'app-pokemon-detail-page',
  imports: [
    RouterLink,
    PokemonImage,
    TypeBadge,
    PokemonNamePipe,
    DexNumberPipe,
    StatLabelPipe,
    DecimalEsPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pokemon-detail.page.html',
  styleUrl: './pokemon-detail.page.scss',
})
export class PokemonDetailPage {
  /** Parámetro de ruta `:name` (llega como input gracias a withComponentInputBinding). */
  readonly name = input.required<string>();

  private readonly api = inject(PokemonApiService);
  private readonly title = inject(Title);

  /**
   * Query params del catálogo desde el que se llegó (búsqueda y página),
   * para que "Volver al catálogo" no pierda el contexto. Si se entra por URL
   * directa, no hay estado y se vuelve al inicio del catálogo.
   */
  protected readonly returnTo: Params =
    inject(Router).currentNavigation()?.extras.state?.['returnTo'] ?? {};

  protected readonly pokemon = rxResource({
    params: () => this.name(),
    stream: ({ params }) => this.api.detail(params),
  });

  /** 404 → "no existe"; cualquier otro error → "reintentar"; null → sin error. */
  protected readonly errorStatus = computed(() => {
    const error = this.pokemon.error();
    return error instanceof HttpErrorResponse ? error.status : error ? -1 : null;
  });

  protected readonly totalStats = computed(() =>
    this.pokemon.hasValue()
      ? this.pokemon.value().stats.reduce((sum, s) => sum + s.value, 0)
      : 0,
  );

  constructor() {
    // Actualiza el título de la pestaña del navegador.
    effect(() => {
      this.title.setTitle(`${formatPokemonName(this.name())} · Explorador Pokémon`);
    });
  }

  protected statPercent(value: number): number {
    return Math.min(100, Math.round((value / MAX_BASE_STAT) * 100));
  }
}