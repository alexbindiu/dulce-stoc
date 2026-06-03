// Central backend endpoint config.
// Override at build time with VITE_API_URL (e.g. http://localhost:8080 for local dev).
export const API_ORIGIN: string =
  import.meta.env.VITE_API_URL ?? 'https://dulcestocapi-production.up.railway.app';

export const WS_ORIGIN: string = API_ORIGIN.replace(/^http/, 'ws');

export const REST_BASE = `${API_ORIGIN}/api`;
export const GRAPHQL_HTTP = `${API_ORIGIN}/graphql`;
export const GRAPHQL_WS = `${WS_ORIGIN}/graphql`;
