import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Paginación con enlaces reales (no botones): cada página tiene su URL,
 * se puede abrir en otra pestaña y el botón "atrás" del navegador funciona.
 */
@Component({
  selector: 'app-pagination',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Paginación del catálogo">
      @if (page() > 1) {
        <a
          class="step"
          routerLink="."
          [queryParams]="{ page: page() - 1 }"
          queryParamsHandling="merge"
          rel="prev"
        >
          Anterior
        </a>
      } @else {
        <span class="step" aria-disabled="true">Anterior</span>
      }

      <span class="position">Página {{ page() }} de {{ totalPages() }}</span>

      @if (page() < totalPages()) {
        <a
          class="step"
          routerLink="."
          [queryParams]="{ page: page() + 1 }"
          queryParamsHandling="merge"
          rel="next"
        >
          Siguiente
        </a>
      } @else {
        <span class="step" aria-disabled="true">Siguiente</span>
      }
    </nav>
  `,
  styles: `
    nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .step {
      padding: 0.6rem 1.1rem;
      border: 1px solid var(--ink);
      border-radius: 999px;
      color: var(--ink);
      font-weight: 700;
      text-decoration: none;
    }
    a.step:hover {
      background: var(--ink);
      color: var(--paper);
    }
    span.step {
      border-color: var(--line);
      color: var(--muted);
    }
    .position {
      color: var(--muted);
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class Pagination {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
}