import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" href="#main">Saltar al contenido</a>

    <header class="topbar">
      <a routerLink="/" class="brand">
        <svg aria-hidden="true" viewBox="0 0 100 100" width="28" height="28">
          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="10" />
          <path d="M8 50h84" stroke="currentColor" stroke-width="10" />
          <circle cx="50" cy="50" r="13" fill="var(--paper)" stroke="currentColor" stroke-width="10" />
        </svg>
        Explorador Pokémon
      </a>
    </header>

    <main id="main" class="page">
      <router-outlet />
    </main>

    <footer class="footer">
      Datos de <a href="https://pokeapi.co" target="_blank" rel="noopener">PokéAPI</a>.
      Pokémon y sus nombres son marcas de Nintendo, Game Freak y The Pokémon Company.
    </footer>
  `,
})
export class App {}