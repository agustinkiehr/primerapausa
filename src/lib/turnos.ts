import { agenda, modalidades, profesionales } from '../data/site';
import { gcal, googleConfigured } from './google';
import { calendarIdOf } from './agenda';
import { env } from './env';

const enc = encodeURIComponent;
export const mpConfigured = () => Boolean(env('MP_ACCESS_TOKEN'));

type Datos = { nombre: string; email: string; telefono: string; modalidad: string; tipo: string };

function eventoBase(d: Datos, inicio: string) {
  const mod = modalidades.find((m) => m.id === d.modalidad)!;
  const start = new Date(inicio);
  const end = new Date(start.getTime() + mod.minutos * 60_000);
  return {
    start: { dateTime: start.toISOString(), timeZone: 'America/Argentina/Buenos_Aires' },
    end: { dateTime: end.toISOString(), timeZone: 'America/Argentina/Buenos_Aires' },
    // Sin motivo de consulta: el calendario no guarda datos de salud.
    description: `${mod.name} (${mod.minutos} min)\nTipo: ${d.tipo === 'prioritaria' ? 'prioritaria' : 'programada'}\nTeléfono: ${d.telefono}\nReserva hecha desde primerapausa`,
  };
}

/** Crea el turno: confirmado (sin cobro) o reservado por unos minutos mientras se paga. */
export async function crearTurno(d: Datos, profesionalId: string, inicio: string) {
  const p = profesionales.find((x) => x.id === profesionalId)!;
  const cal = calendarIdOf(p);
  const vence = Date.now() + agenda.reservaMin * 60_000;
  const pendiente = mpConfigured();
  const ev = await gcal(`/calendars/${enc(cal)}/events`, {
    method: 'POST',
    body: JSON.stringify({
      ...eventoBase(d, inicio),
      summary: pendiente ? `Primera Pausa · Reservado (pago pendiente)` : `Primera Pausa · Consulta · ${d.nombre}`,
      colorId: pendiente ? '8' : '11',
      extendedProperties: {
        private: { pp_estado: pendiente ? 'reservado' : 'confirmado', pp_vence: String(vence), pp_email: d.email, pp_nombre: d.nombre.slice(0, 80), pp_modalidad: d.modalidad, pp_tipo: d.tipo, pp_tel: d.telefono.slice(0, 40) },
      },
    }),
  });
  if (!pendiente) return { calendarId: cal, eventId: ev.id as string, ...(await confirmarTurno(cal, ev.id)) };
  return { calendarId: cal, eventId: ev.id as string, estado: 'reservado' as const };
}

/** Pasa el turno a confirmado: agrega Meet e invita a la persona. */
export async function confirmarTurno(calendarId: string, eventId: string) {
  const ev = await gcal(`/calendars/${enc(calendarId)}/events/${enc(eventId)}`);
  const priv = ev.extendedProperties?.private ?? {};
  if (priv.pp_estado === 'confirmado' && ev.hangoutLink) return { estado: 'confirmado' as const, meet: ev.hangoutLink as string };
  const upd = await gcal(`/calendars/${enc(calendarId)}/events/${enc(eventId)}?conferenceDataVersion=1&sendUpdates=all`, {
    method: 'PATCH',
    body: JSON.stringify({
      summary: `Primera Pausa · Consulta · ${priv.pp_nombre ?? ''}`.trim(),
      colorId: '11',
      attendees: priv.pp_email ? [{ email: priv.pp_email, displayName: priv.pp_nombre }] : [],
      conferenceData: { createRequest: { requestId: `pp-${eventId}`, conferenceSolutionKey: { type: 'hangoutsMeet' } } },
      extendedProperties: { private: { ...priv, pp_estado: 'confirmado', pp_vence: '' } },
    }),
  });
  return { estado: 'confirmado' as const, meet: (upd.hangoutLink as string) || undefined };
}

/** Preferencia de Checkout Pro de Mercado Pago para un turno reservado. */
export async function crearPago(origin: string, d: Datos, turno: { calendarId: string; eventId: string }) {
  const mod = modalidades.find((m) => m.id === d.modalidad)!;
  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env('MP_ACCESS_TOKEN')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ id: mod.id, title: `Primera Pausa · ${mod.name} (${mod.minutos} min)`, quantity: 1, unit_price: mod.price, currency_id: 'ARS' }],
      payer: { email: d.email, name: d.nombre },
      external_reference: `${turno.calendarId}::${turno.eventId}`,
      notification_url: `${origin}/api/mp-webhook`,
      back_urls: { success: `${origin}/gracias?reserva=ok`, pending: `${origin}/gracias?reserva=pendiente`, failure: `${origin}/solicitar?pago=error` },
      auto_return: 'approved',
      expires: true,
      expiration_date_to: new Date(Date.now() + agenda.reservaMin * 60_000).toISOString(),
      statement_descriptor: 'PRIMERA PAUSA',
    }),
  });
  if (!res.ok) throw new Error(`Mercado Pago ${res.status}: ${await res.text()}`);
  const j = await res.json();
  return j.init_point as string;
}

export { googleConfigured };
