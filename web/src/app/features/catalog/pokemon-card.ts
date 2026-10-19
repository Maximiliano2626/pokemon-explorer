import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Params, RouterLink } from '@angular/router';
import { PokemonSummary } from '../../core/pokemon.models';
import { DexNumberPipe, PokemonNamePipe } from '../../shared/pokemon-format';
import { PokemonImage } from '../../shared/pokemon-image';

@Component({
  selector: 'app-pokemon-card',
  imports: [RouterLink, PokemonImage, PokemonNamePipe, DexNumberPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="card" [routerLink]="['/pokemon', pokemon().name]" [state]="{ returnTo: returnTo() }">
      <app-pokemon-image
        class="art"
        [src]="pokemon().imageUrl"
        [alt]="pokemon().name | pokemonName"
        [size]="180"
        [eager]="eager()"
      />
      <span class="dex">{{ pokemon().id | dexNumber }}</span>
      <span class="name">{{ pokemon().name | pokemonName }}</span>
    </a>
  `,
  styleUrl: './pokemon-card.scss',
})
export class PokemonCard {
  readonly pokemon = input.required<PokemonSummary>();
  /** Query params del catálogo, para que "Volver" regrese a la misma búsqueda y página. */
  readonly returnTo = input<Params>({});
  /** Las primeras tarjetas se cargan de inmediato porque se ven sin hacer scroll. */
  readonly eager = input(false);
}