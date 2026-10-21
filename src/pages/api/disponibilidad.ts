import type { APIRoute } from 'astro';
import { disponibilidad } from '../../lib/agenda';
import { googleConfigured } from '../../lib/google';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const modalidad = url.searchParams.get('modalidad') || 'estandar';
  const tipo = url.searchParams.get('tipo') === 'prioritaria' || modalidad === 'prioritaria' ? 'prioritaria' : 'programada';
  try {
    const { slots } = await disponibilidad(modalidad, tipo);
    return Response.json({ slots, tipo, demo: !googleConfigured() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error(e);
    return new Response('No pudimos leer la agenda', { status: 502 });
  }
};
