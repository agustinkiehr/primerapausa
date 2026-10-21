// Variables de entorno del servidor, leídas en tiempo de ejecución (Vercel).
export const env = (name: string): string | undefined =>
  (typeof process !== 'undefined' ? process.env[name] : undefined) ?? (import.meta.env as any)[name];
