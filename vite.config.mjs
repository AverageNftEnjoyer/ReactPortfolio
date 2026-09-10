import { defineConfig } from "vite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

// Vite only bundles <script type="module">. These files are classic scripts
// and must be copied into dist as-is so production/Vercel can load them.
const classicScripts = ["arcade.js", "home.js", "cursor.js", "squircle.js"];

export default defineConfig({
  plugins: [
    {
      name: "copy-classic-scripts",
      closeBundle() {
        const outDir = path.resolve(root, "dist");
        for (const file of classicScripts) {
          fs.copyFileSync(path.resolve(root, file), path.join(outDir, file));
        }
      },
    },
  ],
});
