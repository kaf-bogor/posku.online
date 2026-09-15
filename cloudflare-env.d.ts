// Tipe binding Cloudflare untuk app Worker (dipakai via `cloudflare:workers`).
// Diletakkan di root agar tidak ikut di-lint (eslint hanya memindai `src`).

interface D1Result<T> {
  results: T[];
  success: boolean;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<unknown>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface AiBinding {
  run(model: string, input: Record<string, unknown>): Promise<unknown>;
}

declare module 'cloudflare:workers' {
  export const env: {
    DB: D1Database;
    AI: AiBinding;
    TURNSTILE_SECRET?: string;
    TURNSTILE_COOKIE_SECRET?: string;
    TURNSTILE_HOSTNAMES?: string;
    TURNSTILE_ACTION?: string;
  };
}
