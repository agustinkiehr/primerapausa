import type { APIRoute } from 'astro';
import { env } from '../../../lib/env';
import { gcal, googleConfigured } from '../../../lib/google';

export const prerender = false;

// Rutas de administración para conectar Google Calendar.
//   /api/google/conectar?clave=ADMIN_KEY   → pantalla de permiso de Google
//   /api/google/callback                   → muestra el refresh token para cargarlo en Vercel
//   /api/google/calendarios?clave=ADMIN_KEY → lista los calendarios (para copiar los IDs)
//   /api/google/crear-calendario?clave=ADMIN_KEY&nombre=… → crea un calendario de prueba

const SCOPE = 'https://www.googleapis.com/auth/calendar';
const page = (title: string, body: string) =>
  new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title><body style="font-family:system-ui;max-width:640px;margin:40px auto;padding:0 16px;line-height:1.5;color:#1c1c18;background:#fcf9f3"><h1 style="color:#6b0003">${title}</h1>${body}</body>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
  );

export const GET: APIRoute = async ({ params, url }) => {
  const adminKey = env('ADMIN_KEY');
  const redirect = `${url.origin}/api/google/callback`;
  const autorizado = adminKey && url.searchParams.get('clave') === adminKey;

  if (params.accion === 'conectar') {
    if (!autorizado) return new Response('No autorizado', { status: 401 });
    const q = new URLSearchParams({
      client_id: env('GOOGLE_CLIENT_ID') ?? '',
      redirect_uri: redirect,
      response_type: 'code',
      scope: SCOPE,
      access_type: 'offline',
      prompt: 'consent',
      state: adminKey!,
    });
    return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${q}`, 302);
  }

  if (params.accion === 'callback') {
    if (!adminKey || url.searchParams.get('state') !== adminKey) return new Response('No autorizado', { status: 401 });
    const code = url.searchParams.get('code');
    if (!code) return page('Conexión cancelada', '<p>No se recibió autorización de Google.</p>');
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: env('GOOGLE_CLIENT_ID')!, client_secret: env('GOOGLE_CLIENT_SECRET')!, redirect_uri: redirect, grant_type: 'authorization_code' }),
    });
    const j = await res.json();
    if (!j.refresh_token) return page('No se pudo conectar', `<p>Google no devolvió el token. Detalle: ${String(j.error_description ?? j.error ?? 'desconocido')}</p>`);
    return page(
      'Google Calendar conectado',
      `<p>Copiá este valor y cargalo en Vercel como variable <strong>GOOGLE_REFRESH_TOKEN</strong>. Después hacé un redeploy.</p>
       <textarea readonly style="width:100%;height:110px;font-family:monospace;padding:8px" onclick="this.select()">${j.refresh_token}</textarea>
       <p style="color:#7e544d">No compartas este valor: da acceso a la agenda conectada.</p>`,
    );
  }

  if (!autorizado) return new Response('No autorizado', { status: 401 });
  if (!googleConfigured()) return page('Falta conectar Google', '<p>Cargá GOOGLE_REFRESH_TOKEN en Vercel y volvé a desplegar.</p>');

  if (params.accion === 'calendarios') {
    const j = await gcal('/users/me/calendarList');
    const rows = (j.items ?? []).map((c: any) => `<tr><td style="padding:6px 12px 6px 0">${c.summary}</td><td style="font-family:monospace;font-size:12px">${c.primary ? 'primary' : c.id}</td></tr>`).join('');
    return page('Calendarios', `<p>Usá el ID en GCAL_ID_1 / GCAL_ID_2.</p><table>${rows}</table>`);
  }

  if (params.accion === 'crear-calendario') {
    const nombre = url.searchParams.get('nombre') || 'Primera Pausa · Psicóloga 2 (prueba)';
    const c = await gcal('/calendars', { method: 'POST', body: JSON.stringify({ summary: nombre, timeZone: 'America/Argentina/Buenos_Aires' }) });
    return page('Calendario creado', `<p>${c.summary}</p><p>ID: <code>${c.id}</code></p>`);
  }

  return new Response('Not found', { status: 404 });
};
