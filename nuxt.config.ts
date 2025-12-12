import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      // Provided by CI (GitHub Pages workflow) via NUXT_PUBLIC_*.
      // We keep placeholders here so `useRuntimeConfig().public` always has these keys.
      buildTime: "",
      gitSha: "",
      strictGithubStats: "",
    },
  },

  modules: [
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/ui",
    "@nuxtjs/mdc",
  ],

  icon: {
    customCollections: [
      {
        prefix: "custom",
        dir: "./assets/icons",
      },
    ],
  },

  css: ["~/assets/css/main.css"],

  routeRules: {
    "/": { prerender: true },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
// Trigger restart
