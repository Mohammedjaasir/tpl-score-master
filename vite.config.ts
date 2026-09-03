import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

const nitroPreset =
  process.env["NITRO_PRESET"] ||
  (process.env["VERCEL"] ? "vercel" : undefined);

export default defineConfig({
  server: {
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    tanstackStart({
      server: { entry: "server" },
    }),
    viteReact(),
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    ...(nitroPreset
      ? [nitro({ preset: nitroPreset })]
      : [nitro()]),
  ],
});
