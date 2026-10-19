/**
 * Configuración tipada de la aplicación.
 * Todo lo que depende del entorno se lee aquí y en ningún otro lugar.
 */
export interface AppConfig {
  port: number;
  corsOrigins: string[];
  pokeApi: {
    baseUrl: string;
    timeoutMs: number;
    cacheTtlMs: number;
  };
}

const toPositiveNumber = (
  value: string | undefined,
  fallback: number,
): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export default (): AppConfig => ({
  port: toPositiveNumber(process.env.PORT, 3000),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:4200')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  pokeApi: {
    baseUrl: (
      process.env.POKEAPI_BASE_URL ?? 'https://pokeapi.co/api/v2'
    ).replace(/\/+$/, ''),
    timeoutMs: toPositiveNumber(process.env.POKEAPI_TIMEOUT_MS, 8_000),
    cacheTtlMs: toPositiveNumber(process.env.CACHE_TTL_MS, 60 * 60 * 1000),
  },
});