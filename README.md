# Explorador de Pokémon

Aplicación web para explorar el catálogo de Pokémon, buscarlos por nombre y consultar su información.

- **Frontend:** Angular 21 (`web/`)
- **Backend for Frontend:** NestJS 12 (`bff/`), intermediario entre la aplicación y [PokéAPI](https://pokeapi.co)

```
Navegador ──► Angular (4200) ──/api──► BFF NestJS (3000) ──► PokéAPI
                      proxy de desarrollo       caché en memoria
```

## Requisitos

- Node.js 22 o superior (hay un `.nvmrc`)
- npm 10 o superior
- Conexión a internet (el BFF consulta PokéAPI y las imágenes se cargan desde GitHub)

## Cómo ejecutarlo

```bash
# 1. Instalar dependencias (raíz, bff y web)
npm run install:all

# 2. Levantar el BFF y el frontend a la vez
npm run dev
```

- Aplicación: http://localhost:4200
- API del BFF: http://localhost:3000/api/pokemon
- Documentación Swagger: http://localhost:3000/api/docs

También se pueden levantar por separado: `npm run start:dev` dentro de `bff/` y `npm start` dentro de `web/`.

| Comando (desde la raíz) | Qué hace                                           |
| ----------------------- | -------------------------------------------------- |
| `npm test`              | Tests unitarios y e2e del BFF y tests del frontend |
| `npm run build`         | Compila el BFF y el frontend                       |

## Configuración

No hace falta configurar nada para ejecutarlo. El BFF acepta estas variables de entorno opcionales (ver `bff/.env.example`):

| Variable             | Por defecto                 | Uso                                        |
| -------------------- | --------------------------- | ------------------------------------------ |
| `PORT`               | `3000`                      | Puerto del BFF                             |
| `CORS_ORIGINS`       | `http://localhost:4200`     | Orígenes permitidos, separados por coma    |
| `POKEAPI_BASE_URL`   | `https://pokeapi.co/api/v2` | Permite apuntar a un mock u otra instancia |
| `POKEAPI_TIMEOUT_MS` | `8000`                      | Timeout por petición a PokéAPI             |
| `CACHE_TTL_MS`       | `3600000` (1 hora)          | Vida de la caché en memoria                |

En desarrollo, el frontend llama a `/api` y el proxy de Angular (`web/proxy.conf.json`) lo redirige al BFF.

## API del BFF

| Método | Ruta                                          | Descripción                                                       |
| ------ | --------------------------------------------- | ----------------------------------------------------------------- |
| GET    | `/api/pokemon?page=1&pageSize=24&search=pika` | Catálogo paginado. `search` es opcional (nombre parcial o número) |
| GET    | `/api/pokemon/:name`                          | Detalle por nombre o número (`pikachu`, `25`)                     |

Errores: `400` si los parámetros no son válidos, `404` si el Pokémon no existe, `502` o `504` si PokéAPI falla o no responde.

## Decisiones principales

### BFF: arquitectura hexagonal liviana

```
bff/src/pokemon/
├── domain/            Modelos, reglas de búsqueda y errores. Sin NestJS ni PokéAPI.
├── application/
│   ├── ports/         Interfaz PokemonRepository: lo que el negocio necesita.
│   └── use-cases/     Listar el catálogo y ver el detalle.
└── infrastructure/
    ├── pokeapi/       Adaptador de salida: implementa el puerto con PokéAPI.
    └── http/          Adaptador de entrada: controller, DTOs y traducción de errores.
```

- **PokéAPI queda aislada detrás de un puerto.** Los casos de uso dependen de una interfaz, no de PokéAPI. La conexión entre ambos está en una sola línea de `pokemon.module.ts`. Gracias a eso, el test e2e prueba la API completa reemplazando PokéAPI por un repositorio en memoria.
- **Errores del dominio, traducidos en el borde.** El dominio lanza `PokemonNotFoundError` o `PokemonSourceUnavailableError`, y el adaptador HTTP los convierte en 404, 502 o 504.
- **Es una versión liviana a propósito:** un solo puerto y dos casos de uso, porque el alcance es pequeño.

### BFF: el contrato se adapta a la pantalla

- **El frontend no conoce PokéAPI.** Recibe datos listos para mostrar: unidades convertidas (metros y kilos), descripción en español y textos limpios.
- **Búsqueda parcial sobre un índice en caché.** PokéAPI solo busca por nombre exacto. El BFF descarga una vez la lista completa (unos 1.300 nombres), la cachea y filtra en memoria. Primero muestra los que empiezan con el texto y luego los que lo contienen. Además, normaliza lo que se escribe (`Mr. Mime` → `mr-mime`, `Flabébé` → `flabebe`), y un número busca por número de Pokédex.
- **Sin N+1 en el listado.** La lista de PokéAPI solo trae nombre y URL. En vez de pedir el detalle de cada Pokémon para mostrar su imagen, el id se extrae de la URL y se arma la URL de la ilustración.
- **Caché, deduplicación y timeout.**
  - Las respuestas exitosas se guardan en memoria.
  - Si llegan dos peticiones iguales a la vez, se hace una sola llamada.
  - Cada petición tiene un tiempo máximo de espera.
  - Si falla la especie (que solo aporta la descripción), el detalle se muestra igual, sin descripción.

### Frontend

- **La URL es la fuente de verdad.** La búsqueda y la página viven en los query params (`/?q=char&page=2`). Llegan al componente como inputs (`withComponentInputBinding`) y `rxResource` vuelve a pedir los datos solo cuando cambian. Así se puede compartir, recargar y usar el botón atrás. Al volver desde un detalle se recupera la misma búsqueda y página.
- **Angular moderno sin librerías extra.** Componentes standalone, signals, detección de cambios zoneless, `rxResource` y rutas con carga diferida. RxJS solo para el debounce del buscador.
- **Estructura por funcionalidades:** `core/` (servicio y modelos), `features/` (catálogo y detalle) y `shared/` (piezas reutilizables).
- **Estados de la interfaz:**
  - Carga con esqueletos.
  - Sin resultados, con sugerencia.
  - Pokémon inexistente, con opción de buscarlo.
  - Error del servidor, con botón para reintentar.
  - Mientras carga otra página, la anterior se ve atenuada en vez de desaparecer.
- **Accesibilidad básica.**
  - HTML semántico: enlaces reales para la paginación y una tabla para las estadísticas.
  - Foco visible y enlace para saltar al contenido.
  - Conteo de resultados anunciado a lectores de pantalla.
  - Contraste suficiente en las etiquetas de tipo.
  - Respeta el modo oscuro y la preferencia de movimiento reducido.

## Tests

Todos se ejecutan con Vitest y ninguno depende de internet:

- **BFF, unitarios:** dominio, mapper, repositorio (caché, deduplicación, 404, 5xx y timeout) y casos de uso con un repositorio en memoria.
- **BFF, e2e:** la API completa con supertest, reemplazando solo el adaptador de PokéAPI.
- **Frontend:** servicio HTTP, formato, y las páginas de catálogo y detalle (render, lectura de la URL, debounce del buscador y estados de error).

## Fuera de alcance

Para mantener una solución pequeña dentro de las 8 horas estimadas, dejé fuera:

- **Filtros por tipo, generación u orden.** La búsqueda por nombre cubre el objetivo pedido.
- **Cadena evolutiva, movimientos y formas alternativas en el detalle.** Requieren varias llamadas extra por Pokémon.
- **Nombres de habilidades en español.** Necesitarían una petición por habilidad; se muestran en inglés.
- **Favoritos o historial.** Requieren persistencia.
- **Caché distribuida (Redis), rate limiting y despliegue.** La caché vive en el proceso del BFF y se pierde al reiniciarlo. Con varias instancias habría que usar Redis.
- **Renderizado en servidor (SSR) y tests e2e en navegador** (Playwright o Cypress).

## Limitaciones conocidas

- La primera petición al catálogo tarda un poco más, porque descarga el índice completo. Las siguientes salen de la caché.
- El índice de PokéAPI incluye formas alternativas (ids sobre 10.000). Algunas no tienen ilustración oficial; en ese caso se muestra una imagen de respaldo.
- El build de producción del frontend asume que el BFF se sirve en el mismo dominio bajo `/api`. Para usar otro dominio, se configura el token `API_BASE_URL` en `web/src/app/core/pokemon-api.service.ts`.

## Librerías y herramientas

- **BFF:**
  - NestJS 12, `@nestjs/config`, `@nestjs/cache-manager` y `@nestjs/swagger`.
  - `class-validator` y `class-transformer` para validar parámetros.
  - Vitest y supertest para los tests.
  - Las llamadas a PokéAPI usan el `fetch` nativo de Node.
- **Frontend:** Angular 21, RxJS y Vitest. Tipografías Bricolage Grotesque y Atkinson Hyperlegible Next, de Google Fonts.
- **Raíz:** `concurrently`, para levantar ambos proyectos con un solo comando.
- **Herramientas de apoyo:** Visual Studio Code y Git.