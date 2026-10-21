import type { APIRoute } from 'astro';
import { validar, esSpam, enviarMail, mailConfigured } from '../../lib/solicitud';

export const prerender = false;

// Solicitud sin turno ("prefiero que me contacten").
export const POST: APIRoute = async ({ request }) => {
  let d: any;
  try { d = await request.json(); } catch { return new Response('Bad request', { status: 400 }); }
  if (esSpam(d)) return Response.json({ ok: true });
  const err = validar(d);
  if (err) return new Response(err, { status: 422 });
  if (!mailConfigured()) return new Response('Email no configurado', { status: 503 });
  const ok = await enviarMail(d);
  return ok ? Response.json({ ok: true }) : new Response('Error enviando', { status: 502 });
};
