import type { APIRoute } from 'astro';
import { triage, modalidades } from '../../data/site';

export const prerender = false;

// Variables de entorno (Vercel → Settings → Environment Variables):
//   RESEND_API_KEY      clave de https://resend.com
//   SOLICITUDES_TO      email(s) que reciben las solicitudes, separados por coma
//   SOLICITUDES_FROM    remitente verificado en Resend, ej. "Primera Pausa <solicitudes@primerapausa.com.ar>"

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const ans = { si: 'Sí', no: 'No', nose: 'No estoy seguro/a' } as Record<string, string>;

export const POST: APIRoute = async ({ request }) => {
  let d: any;
  try { d = await request.json(); } catch { return new Response('Bad request', { status: 400 }); }

  // Antispam: honeypot + tiempo mínimo
  if (d.empresa || (typeof d.elapsed_ms === 'number' && d.elapsed_ms < 4000)) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  const required = ['nombre', 'email', 'telefono', 'motivo', 'mayor18', 'acepta_condiciones', 'acepta_privacidad'];
  if (required.some((k) => !d[k])) return new Response('Faltan campos', { status: 422 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return new Response('Email inválido', { status: 422 });

  // Revalidar el triage del lado del servidor
  const t = d.triage || {};
  const blocked = triage.some((q, i) => q.block && t[`t${i}`] !== 'no');
  if (blocked) return new Response('Triage no habilitado', { status: 422 });

  const { RESEND_API_KEY, SOLICITUDES_TO, SOLICITUDES_FROM } = import.meta.env;
  if (!RESEND_API_KEY || !SOLICITUDES_TO) {
    console.error('Solicitud recibida pero el envío de email no está configurado.');
    return new Response('Email no configurado', { status: 503 });
  }

  const fecha = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
  const mod = modalidades.find((m) => m.id === d.modalidad)?.name ?? 'A definir';
  const prioritaria = d.tipo === 'prioritaria';
  const row = (k: string, v: unknown) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#7e544d;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:6px 0">${esc(v)}</td></tr>`;

  const html = `
  <div style="font-family:Arial,sans-serif;color:#1c1c18;max-width:640px">
    <h2 style="color:#6b0003;margin:0 0 4px">${prioritaria ? '⚡ PRIORITARIA · ' : ''}Nueva solicitud</h2>
    <p style="margin:0 0 16px;color:#58413e">${esc(fecha)}</p>
    <table style="border-collapse:collapse;font-size:14px">
      ${row('Nombre', d.nombre)}
      ${row('Email', d.email)}
      ${row('Teléfono', d.telefono)}
      ${row('Tipo', prioritaria ? 'Prioritaria (hablar hoy)' : 'Programada')}
      ${row('Modalidad', mod)}
      ${row('+18', 'Confirmado')}
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
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: SOLICITUDES_FROM || 'Primera Pausa <onboarding@resend.dev>',
      to: SOLICITUDES_TO.split(',').map((s: string) => s.trim()),
      reply_to: d.email,
      subject: `${prioritaria ? '⚡ PRIORITARIA – ' : ''}Solicitud de ${String(d.nombre).slice(0, 60)} (${mod})`,
      html,
    }),
  });

  if (!res.ok) {
    console.error('Resend error', res.status, await res.text());
    return new Response('Error enviando', { status: 502 });
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
