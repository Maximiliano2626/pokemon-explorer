import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { routes } from './app.routes';

// Angular 21 es zoneless por defecto: la detección de cambios la guían los signals.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    provideRouter(
      routes,
      // Los parámetros de ruta y los query params llegan como inputs del componente.
      withComponentInputBinding(),
      // Al volver atrás, se restaura la posición del scroll.
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
    ),
  ],
};