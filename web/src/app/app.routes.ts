import { Routes } from '@angular/router';

/** Las páginas se cargan bajo demanda (lazy loading). */
export const routes: Routes = [
  {
    path: '',
    title: 'Explorador Pokémon',
    loadComponent: () => import('./features/catalog/catalog.page').then((m) => m.CatalogPage),
  },
  // La ruta del detalle (/pokemon/:name) la agregamos en el paso 10.
  { path: '**', redirectTo: '' },
];