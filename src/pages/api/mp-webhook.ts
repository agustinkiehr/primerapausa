import type { APIRoute } from 'astro';
import { confirmarTurno } from '../../lib/turnos';
import { env } from '../../lib/env';

export const prerender = false;

// Mercado Pago avisa cada pago. Consultamos el pago con nuestra credencial
// (así no dependemos de lo que diga el aviso) y, si está aprobado, confirmamos el turno.
export const POST: APIRoute = async ({ request, url }) => {
  let body: any = {};
  try { body = await request.json(); } catch {}
  const type = body.type ?? url.searchParams.get('type') ?? url.searchParams.get('topic');
  const id = body.data?.id ?? url.searchParams.get('data.id') ?? url.searchParams.get('id');
  if (type !== 'payment' || !id) return new Response('ignored', { status: 200 });

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${env('MP_ACCESS_TOKEN')}` },
  });
  if (!res.ok) return new Response('payment lookup failed', { status: 500 });
  const pago = await res.json();
  if (pago.status !== 'approved' || !pago.external_reference) return new Response('ok', { status: 200 });

  const [calendarId, eventId] = String(pago.external_reference).split('::');
  try {
    await confirmarTurno(calendarId, eventId);
  } catch (e) {
    console.error('No se pudo confirmar el turno pagado', pago.id, e);
    return new Response('error', { status: 500 }); // Mercado Pago reintenta
  }
  return new Response('ok', { status: 200 });
};
