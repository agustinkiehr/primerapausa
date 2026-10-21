import type { APIRoute } from 'astro';
import { modalidades, profesionales } from '../../data/site';
import { validar, esSpam, enviarMail } from '../../lib/solicitud';
import { sigueLibre } from '../../lib/agenda';
import { crearTurno, crearPago, mpConfigured, googleConfigured } from '../../lib/turnos';

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  let d: any;
  try { d = await request.json(); } catch { return new Response('Bad request', { status: 400 }); }
  if (esSpam(d)) return Response.json({ ok: true });
  const err = validar(d);
  if (err) return new Response(err, { status: 422 });

  if (d.tipo === 'prioritaria') d.modalidad = 'prioritaria';
  const mod = modalidades.find((m) => m.id === d.modalidad);
  if (!mod) return new Response('Elegí una modalidad', { status: 422 });
  if (!profesionales.some((p) => p.id === d.profesionalId) || !d.inicio) return new Response('Elegí un horario', { status: 422 });

  if (!googleConfigured()) {
    return new Response('La agenda todavía no está conectada', { status: 503 });
  }
  if (!(await sigueLibre(d.profesionalId, d.inicio, mod.minutos))) {
    return new Response('Ese horario se acaba de ocupar. Elegí otro.', { status: 409 });
  }

  try {
    const turno = await crearTurno(d, d.profesionalId, d.inicio);
    await enviarMail(d, { inicio: d.inicio, profesionalId: d.profesionalId, estado: turno.estado === 'confirmado' ? 'Confirmado' : 'Pago pendiente', meet: (turno as any).meet }).catch(() => null);
    if (mpConfigured()) {
      const pago = await crearPago(url.origin, d, turno);
      return Response.json({ ok: true, pago });
    }
    return Response.json({ ok: true, estado: turno.estado, inicio: d.inicio });
  } catch (e) {
    console.error(e);
    return new Response('No pudimos reservar el turno', { status: 502 });
  }
};
