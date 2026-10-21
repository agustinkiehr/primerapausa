import { env } from './env';

// Google Calendar vía OAuth (una cuenta conectada con un refresh token).
// Variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN

const API = 'https://www.googleapis.com/calendar/v3';
let cached: { token: string; exp: number } | null = null;

export const googleConfigured = () =>
  Boolean(env('GOOGLE_CLIENT_ID') && env('GOOGLE_CLIENT_SECRET') && env('GOOGLE_REFRESH_TOKEN'));

async function accessToken() {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env('GOOGLE_CLIENT_ID')!,
      client_secret: env('GOOGLE_CLIENT_SECRET')!,
      refresh_token: env('GOOGLE_REFRESH_TOKEN')!,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) throw new Error(`Google token ${res.status}: ${await res.text()}`);
  const j = await res.json();
  cached = { token: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return cached.token;
}

export async function gcal(path: string, init: RequestInit = {}) {
  const res = await fetch(API + path, {
    ...init,
    headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  if (!res.ok) throw new Error(`Google Calendar ${res.status}: ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

export type Busy = { start: number; end: number };

export async function freeBusy(calendarIds: string[], timeMin: Date, timeMax: Date) {
  const j = await gcal('/freeBusy', {
    method: 'POST',
    body: JSON.stringify({ timeMin: timeMin.toISOString(), timeMax: timeMax.toISOString(), items: calendarIds.map((id) => ({ id })) }),
  });
  const out: Record<string, Busy[]> = {};
  for (const id of calendarIds) {
    out[id] = (j.calendars?.[id]?.busy ?? []).map((b: any) => ({ start: Date.parse(b.start), end: Date.parse(b.end) }));
  }
  return out;
}

/** Borra los turnos guardados para pago cuyo tiempo venció. */
export async function releaseExpiredHolds(calendarId: string) {
  const q = new URLSearchParams({ privateExtendedProperty: 'pp_estado=reservado', singleEvents: 'true', maxResults: '50' });
  const j = await gcal(`/calendars/${encodeURIComponent(calendarId)}/events?${q}`);
  const now = Date.now();
  await Promise.all(
    (j.items ?? [])
      .filter((e: any) => Number(e.extendedProperties?.private?.pp_vence ?? 0) < now)
      .map((e: any) => gcal(`/calendars/${encodeURIComponent(calendarId)}/events/${e.id}`, { method: 'DELETE' }).catch(() => null)),
  );
}
