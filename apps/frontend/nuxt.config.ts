// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-01-01',
    devtools: { enabled: true },

    modules: ['@pinia/nuxt'],

    app: {
        head: {
            title: 'CARMS - Corporate Asset & Resource Management System',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'description', content: 'ระบบบริหารจัดการทรัพยากรภายในองค์กรแบบครบวงจร' }
            ],
            link: [
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
                { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap' }
            ]
        }
    },

    css: ['~/assets/css/main.css'],

    runtimeConfig: {
        public: {
            // Uses NUXT_PUBLIC_API_BASE env var, defaults to relative path for ngrok compatibility
            apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api'
        }
    },

    routeRules: {
        // Proxy API calls to backend (works with Docker and ngrok)
        '/api/**': { proxy: process.env.NUXT_API_PROXY_TARGET || 'http://localhost:3001/api/**' }
    }
})
