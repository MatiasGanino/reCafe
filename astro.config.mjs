// @ts-check
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";

// Modo server: /panel necesita recibir POST del formulario.
// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel(),
});
