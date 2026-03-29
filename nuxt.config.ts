/// <reference types="node" />
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    tournamentUpstreamUrl: process.env.NUXT_TOURNAMENT_API_BASE_URL || 'http://localhost:3004/api',
    /** Server only; forwarded as `x-api-key` on upstream $fetch when set (env `NUXT_API_KEY`). */
    apiKey: process.env.NUXT_API_KEY || '',
    /** Server only; admin login voor POST /api/login (env `NUXT_ADMIN_USERNAME` / `NUXT_ADMIN_PASSWORD`). */
    adminUsername: process.env.NUXT_ADMIN_USERNAME || '',
    adminPassword: process.env.NUXT_ADMIN_PASSWORD || '',
    public: {
      /** Socket.IO server (zelfde host als upstream API, zonder `/api`-pad). */
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL || 'http://localhost:3004',
    },
  },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  modules: ['@pinia/nuxt'],
});
