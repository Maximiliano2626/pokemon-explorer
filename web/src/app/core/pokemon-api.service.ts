import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogQuery, PokemonDetail, PokemonPage } from './pokemon.models';

/**
 * URL base del BFF. Por defecto es relativa (`/api`): en desarrollo,
 * el proxy de Angular (proxy.conf.json) la redirige a http://localhost:3000.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api',
});

/** Único punto de acceso del frontend al BFF. */
@Injectable({ providedIn: 'root' })
export class PokemonApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list({ search, page, pageSize }: CatalogQuery): Observable<PokemonPage> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<PokemonPage>(`${this.baseUrl}/pokemon`, { params });
  }

  detail(name: string): Observable<PokemonDetail> {
    return this.http.get<PokemonDetail>(
      `${this.baseUrl}/pokemon/${encodeURIComponent(name)}`,
    );
  }
}