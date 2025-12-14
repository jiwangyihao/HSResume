import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  app: {
    head: {
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    },
  },

  components: [
    {
      // Use component file name as the global component name (no folder prefix).
      // This keeps templates readable when relying on Nuxt auto-import.
      path: "~/components",
      pathPrefix: false,
    },
  ],

  runtimeConfig: {
    // Private runtime config (server-only). Populate via env (recommended in CI):
    // - NUXT_GITHUB_TOKEN (GitHub Actions can set this from `${{ github.token }}`)
    githubToken: "",
    public: {
      // Provided by CI (GitHub Pages workflow) via NUXT_PUBLIC_*.
      // We keep placeholders here so `useRuntimeConfig().public` always has these keys.
      buildTime: "",
      gitSha: "",
      strictGithubStats: "",
    },
  },

  nitro: {
    prerender: {
      // If any prerendered route throws (e.g. strict GitHub stats fetch), fail the build.
      // This ensures GitHub Actions will be marked as failed instead of silently publishing.
      failOnError: true,
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
