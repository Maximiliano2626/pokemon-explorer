import { ChangeDetectionStrategy, Component, input, linkedSignal } from '@angular/core';

/**
 * Imagen con carga diferida y un reemplazo si la ilustración no existe
 * (algunas formas alternativas no tienen artwork oficial).
 */
@Component({
  selector: 'app-pokemon-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (src() && !failed()) {
      <img
        [src]="src()"
        [alt]="alt()"
        [width]="size()"
        [height]="size()"
        [attr.loading]="eager() ? 'eager' : 'lazy'"
        decoding="async"
        (error)="failed.set(true)"
      />
    } @else {
      <svg
        class="placeholder"
        viewBox="0 0 100 100"
        role="img"
        [attr.aria-label]="alt() + ' (sin imagen)'"
      >
        <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="6" />
        <path d="M12 50h76" stroke="currentColor" stroke-width="6" />
        <circle cx="50" cy="50" r="11" fill="var(--paper)" stroke="currentColor" stroke-width="6" />
      </svg>
    }
  `,
  styles: `
    :host {
      display: grid;
      place-items: center;
      aspect-ratio: 1;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .placeholder {
      width: 55%;
      color: var(--line-strong);
    }
  `,
})
export class PokemonImage {
  readonly src = input<string | null>(null);
  readonly alt = input.required<string>();
  readonly size = input(240);
  readonly eager = input(false);

  /** Se reinicia automáticamente cuando cambia la URL. */
  protected readonly failed = linkedSignal({ source: this.src, computation: () => false });
}