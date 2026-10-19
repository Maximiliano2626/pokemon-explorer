import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PokemonApiService } from './pokemon-api.service';

describe('PokemonApiService', () => {
  let service: PokemonApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PokemonApiService);
    http = TestBed.inject(HttpTestingController);
  });

  // Verifica que no quedaron peticiones sin revisar.
  afterEach(() => http.verify());

  it('pide el catálogo paginado sin búsqueda', () => {
    service.list({ search: '', page: 2, pageSize: 24 }).subscribe();

    const req = http.expectOne((r) => r.url === '/api/pokemon');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('pageSize')).toBe('24');
    expect(req.request.params.has('search')).toBe(false);
    req.flush({ items: [], total: 0, page: 2, pageSize: 24, totalPages: 1 });
  });

  it('envía la búsqueda sin espacios sobrantes', () => {
    service.list({ search: '  char ', page: 1, pageSize: 24 }).subscribe();

    const req = http.expectOne((r) => r.url === '/api/pokemon');
    expect(req.request.params.get('search')).toBe('char');
    req.flush({ items: [], total: 0, page: 1, pageSize: 24, totalPages: 1 });
  });

  it('pide el detalle por nombre', () => {
    service.detail('mr-mime').subscribe();

    http.expectOne('/api/pokemon/mr-mime').flush({});
  });
});