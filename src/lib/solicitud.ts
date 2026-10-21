import { triage, modalidades, profesionales } from '../data/site';
import { env } from './env';

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const ans: Record<string, string> = { si: 'Sí', no: 'No', nose: 'No estoy seguro/a' };

export const fechaAR = (d: Date | number = new Date()) =>
  new Date(d).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', dateStyle: 'full', timeStyle: 'short' });

/** Devuelve un mensaje de error o null si la solicitud es válida. */
export function validar(d: any): string | null {
  const required = ['nombre', 'email', 'telefono', 'motivo', 'mayor18', 'acepta_condiciones', 'acepta_privacidad'];
  if (required.some((k) => !d?.[k])) return 'Faltan campos';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return 'Email inválido';
  const t = d.triage || {};
  if (triage.some((q, i) => q.block && t[`t${i}`] !== 'no')) return 'Triage no habilitado';
  return null;
}

export const esSpam = (d: any) => Boolean(d?.empresa) || (typeof d?.elapsed_ms === 'number' && d.elapsed_ms < 4000);

export const mailConfigured = () => Boolean(env('RESEND_API_KEY') && env('SOLICITUDES_TO'));

export async function enviarMail(d: any, turno?: { inicio: string; profesionalId: string; estado: string; meet?: string }) {
  if (!mailConfigured()) return false;
  const t = d.triage || {};
  const prioritaria = d.tipo === 'prioritaria';
  const mod = modalidades.find((m) => m.id === d.modalidad)?.name ?? 'A definir';
  const pro = turno ? profesionales.find((p) => p.id === turno.profesionalId)?.nombre : null;
  const row = (k: string, v: unknown) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#7e544d;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:6px 0">${esc(v)}</td></tr>`;
  const fecha = fechaAR();
  const html = `
  <div style="font-family:Arial,sans-serif;color:#1c1c18;max-width:640px">
    <h2 style="color:#6b0003;margin:0 0 4px">${prioritaria ? '⚡ PRIORITARIA · ' : ''}${turno ? 'Nueva reserva' : 'Nueva solicitud'}</h2>
    <p style="margin:0 0 16px;color:#58413e">${esc(fecha)}</p>
    <table style="border-collapse:collapse;font-size:14px">
      ${turno ? row('Turno', fechaAR(turno.inicio)) + row('Profesional', pro) + row('Estado', turno.estado) + (turno.meet ? row('Meet', turno.meet) : '') : ''}
      ${row('Nombre', d.nombre)}${row('Email', d.email)}${row('Teléfono', d.telefono)}
      ${row('Tipo', prioritaria ? 'Prioritaria (hablar hoy)' : 'Programada')}${row('Modalidad', mod)}${row('+18', 'Confirmado')}
    </table>
    <h3 style="color:#6b0003;margin:20px 0 6px">Motivo de consulta</h3>
    <p style="white-space:pre-wrap;background:#f6f3ed;padding:12px;border-radius:8px;margin:0">${esc(d.motivo)}</p>
    <h3 style="color:#6b0003;margin:20px 0 6px">Preguntas de seguridad</h3>
    <ol style="font-size:13px;padding-left:18px;margin:0">
      ${triage.map((q, i) => `<li style="margin-bottom:4px">${esc(q.q)} <strong>${esc(ans[t[`t${i}`]] ?? '—')}</strong></li>`).join('')}
    </ol>
    <h3 style="color:#6b0003;margin:20px 0 6px">Consentimientos</h3>
    <table style="border-collapse:collapse;font-size:13px">
      ${row('Condiciones del Servicio', `Aceptadas – versión ${d.condiciones_version}`)}
      ${row('Política de Privacidad', `Aceptada – versión ${d.privacidad_version}`)}
      ${row('Fecha y hora', fecha)}
    </table>
    ${d.utm && Object.keys(d.utm).length ? `<p style="font-size:12px;color:#8c716d;margin-top:16px">Origen: ${esc(Object.entries(d.utm).map(([k, v]) => `${k}=${v}`).join(' · '))}</p>` : ''}
  </div>`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env('SOLICITUDES_FROM') || 'Primera Pausa <onboarding@resend.dev>',
      to: env('SOLICITUDES_TO')!.split(',').map((s) => s.trim()),
      reply_to: d.email,
      subject: `${prioritaria ? '⚡ PRIORITARIA – ' : ''}${turno ? 'Reserva' : 'Solicitud'} de ${String(d.nombre).slice(0, 60)} (${mod})`,
      html,
    }),
  });
  if (!res.ok) console.error('Resend error', res.status, await res.text());
  return res.ok;
}
