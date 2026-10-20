# Primera Pausa — sitio web

Landing de orientación psicológica puntual. Astro + Tailwind, desplegado en Vercel.

## Editar contenido
Todo el contenido (textos, precios, modalidades, profesionales, FAQ, preguntas de seguridad y líneas de ayuda) está en **`src/data/site.ts`**. Se edita desde GitHub (ícono del lápiz), se hace commit y Vercel publica solo en ~1 minuto.

- Fotos de las profesionales: subirlas a `public/equipo/` y poner la ruta en `foto` (ej. `/equipo/nombre.jpg`).
- Documentos legales: `src/pages/condiciones-del-servicio.md` y `src/pages/politica-de-privacidad.md`. Si cambian, subir la versión en `legalVersions` (queda registrada en cada solicitud).

## Páginas
`/` landing · `/solicitar` formulario (seguridad → datos) · `/gracias` · `/lineas-de-ayuda` · `/condiciones-del-servicio` · `/politica-de-privacidad`

## Variables de entorno (Vercel → Settings → Environment Variables)
| Variable | Para qué |
|---|---|
| `RESEND_API_KEY` | Envío de solicitudes por email (resend.com) |
| `SOLICITUDES_TO` | Email(s) que reciben las solicitudes, separados por coma |
| `SOLICITUDES_FROM` | Remitente verificado, ej. `Primera Pausa <solicitudes@primerapausa.com.ar>` (opcional en pruebas) |
| `PUBLIC_GA_ID` | Google Analytics 4 (opcional) |
| `PUBLIC_META_PIXEL_ID` | Meta Pixel (opcional) |

GA y Pixel se cargan **solo en la home y en /gracias**, nunca en el formulario (datos de salud).

## Desarrollo
```
npm install
npm run dev
```
