// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://primerapausa.com.ar',
  adapter: vercel(),
  vite: { plugins: [tailwindcss()] },
});
