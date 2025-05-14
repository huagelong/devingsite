// https://nuxt.com/docs/api/configuration/nuxt-config
console.log('process.argv: ', process.argv)
console.log('process.env: ', process.env)
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      baseURL: process.env.NUXT_PUBLIC_BASE_URL,
      appId: process.env.NUXT_CUSTOM_APP_ID,
      appSecret: process.env.NUXT_CUSTOM_APP_SECRET,
    },
  },
  ssr: true,
  devtools: { enabled: true },
  experimental: {
    payloadExtraction: true,
  },

  modules: [
    '@nuxtjs/eslint-module',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    'arco-design-nuxt-module',
    ['nuxt-lazy-load', {
      images: true,
      videos: true,
      audios: true,
      iframes: true,
      native: true,
      directiveOnly: false,
      // Default image must be in the public folder
      // defaultImage: '/images/default-image.jpg',
      // To remove class set value to false
      loadingClass: 'isLoading',
      loadedClass: 'isLoaded',
      appendClass: 'lazyLoad',

      observerConfig: {
        // See IntersectionObserver documentation
      },
    }],
  ],

  colorMode: {
    classSuffix: '',
  },

  arco: {
    importPrefix: 'A',
    hookPrefix: 'Arco',
    locales: ['getLocale'],
    localePrefix: 'Arco',
    theme: '@arco-themes/vue-digitforce',
  },

  css: [
    '~/assets/css/index.scss',
  ],

  pinia: {
    storesDirs: ['./stores/**'],
  },

  imports: {
    autoImport: true,
    dirs: [
      'stores/**',
      'composables/**',
    ],
  },

  nitro: {
    devProxy: {
      '/api': {
        target: process.env.NUXT_PUBLIC_BASE_URL,
        changeOrigin: true,
        prependPath: true,
      },
    },
  },

  compatibilityDate: '2025-04-22',
})
