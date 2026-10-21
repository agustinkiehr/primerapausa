import { agenda, profesionales, modalidades } from '../data/site';
import { env } from './env';
import { freeBusy, releaseExpiredHolds, googleConfigured, type Busy } from './google';

// Argentina no tiene horario de verano: UTC-3 fijo.
const OFFSET = '-03:00';
const AR_MS = -3 * 3600_000;
const H = 3600_000;
const M = 60_000;

export const calendarIdOf = (p: (typeof profesionales)[number]) => env(p.calendarEnv) || 'primary';

const pad = (n: number) => String(n).padStart(2, '0');
/** Fecha local de Argentina (YYYY-MM-DD) y día de semana de un instante. */
const arDate = (t: number) => {
  const d = new Date(t + AR_MS);
  return { iso: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`, dow: d.getUTCDay() };
};

export type Slot = { start: string; profesionalId: string };

export function ventana(tipo: string) {
  const now = Date.now();
  if (tipo === 'prioritaria') return { from: now + agenda.prioritaria.desdeHoras * H, to: now + agenda.prioritaria.hastaHoras * H };
  return { from: now + agenda.programada.desdeHoras * H, to: now + agenda.programada.hastaDias * 24 * H };
}

const overlaps = (s: number, e: number, busy: Busy[]) =>
  busy.some((b) => s < b.end + agenda.margenMin * M && e + agenda.margenMin * M > b.start);

/** Turnos libres por profesional para una modalidad y tipo de consulta. */
export async function disponibilidad(modalidadId: string, tipo: string, soloProfesional?: string) {
  const mod = modalidades.find((m) => m.id === modalidadId) ?? modalidades[1];
  const dur = mod.minutos * M;
  const { from, to } = ventana(tipo);
  const pros = profesionales.filter((p) => !soloProfesional || p.id === soloProfesional);
  const ids = [...new Set(pros.map(calendarIdOf))];
  let busy: Record<string, Busy[]> = {};
  if (googleConfigured()) {
    await Promise.all(ids.map((id) => releaseExpiredHolds(id).catch(() => null)));
    busy = await freeBusy(ids, new Date(from - H), new Date(to + 2 * H));
  }

  const slots: Slot[] = [];
  for (const p of pros) {
    const b = busy[calendarIdOf(p)] ?? [];
    for (let t = from - 24 * H; t <= to; t += 24 * H) {
      const { iso, dow } = arDate(t);
      for (const [ini, fin] of p.horarios[dow] ?? []) {
        const blockEnd = Date.parse(`${iso}T${fin}:00${OFFSET}`);
        for (let s = Date.parse(`${iso}T${ini}:00${OFFSET}`); s + dur <= blockEnd; s += agenda.pasoMin * M) {
          if (s < from || s > to) continue;
          if (overlaps(s, s + dur, b)) continue;
          slots.push({ start: new Date(s).toISOString(), profesionalId: p.id });
        }
      }
    }
  }
  slots.sort((a, b) => a.start.localeCompare(b.start));
  return { modalidad: mod, slots };
}

/** Verifica que un turno puntual siga libre justo antes de reservarlo. */
export async function sigueLibre(profesionalId: string, startIso: string, minutos: number) {
  const p = profesionales.find((x) => x.id === profesionalId);
  if (!p) return false;
  const s = Date.parse(startIso);
  const e = s + minutos * M;
  const { iso, dow } = arDate(s);
  const enHorario = (p.horarios[dow] ?? []).some(
    ([ini, fin]) => s >= Date.parse(`${iso}T${ini}:00${OFFSET}`) && e <= Date.parse(`${iso}T${fin}:00${OFFSET}`),
  );
  if (!enHorario) return false;
  if (!googleConfigured()) return true;
  const id = calendarIdOf(p);
  await releaseExpiredHolds(id).catch(() => null);
  const busy = await freeBusy([id], new Date(s - H), new Date(e + H));
  return !overlaps(s, e, busy[id] ?? []);
}
