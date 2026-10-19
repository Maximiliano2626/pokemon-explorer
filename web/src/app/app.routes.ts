import { Routes } from '@angular/router';

/** Las páginas se cargan bajo demanda (lazy loading). */
export const routes: Routes = [
  {
    path: '',
    title: 'Explorador Pokémon',
    loadComponent: () => import('./features/catalog/catalog.page').then((m) => m.CatalogPage),
  },
  {
    path: 'pokemon/:name',
    loadComponent: () =>
      import('./features/detail/pokemon-detail.page').then((m) => m.PokemonDetailPage),
  },
  { path: '**', redirectTo: '' },
];