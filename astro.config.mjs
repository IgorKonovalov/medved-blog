import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://bmw-electric-spb.ru',
  trailingSlash: 'always',
  integrations: [sitemap()],
  vite: {
    plugins: [
      {
        name: 'tina-admin-spa',
        configureServer(server) {
          // Serve public/admin/index.html for /admin/ in dev mode.
          // Astro's routing middleware intercepts /admin/ before Vite can serve
          // the static file — this rewrite runs before Astro's middleware.
          server.middlewares.use((req, _res, next) => {
            if (req.url === '/admin/' || req.url === '/admin') {
              req.url = '/admin/index.html';
            }
            next();
          });
        },
      },
    ],
  },
});
