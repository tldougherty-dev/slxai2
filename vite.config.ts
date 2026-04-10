import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import type { Connect } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite dev/preview do not always map `/contacts/{slug}/` to `contacts/{slug}/index.html`
 * in `public/` / `dist/`, so the SPA catches the route. Serve the static file explicitly.
 */
function serveBadgeContactPages() {
  const publicDir = path.join(__dirname, "public");
  const distDir = path.join(__dirname, "dist");

  function trySend(
    req: Connect.IncomingMessage,
    res: { setHeader: (n: string, v: string) => void; end: (b: string | Buffer) => void },
    next: Connect.NextFunction,
    baseDir: string,
  ) {
    const raw = req.url?.split("?")[0] ?? "";
    const m = raw.match(/^\/contacts\/([^/]+)\/?$/);
    if (!m) return next();
    const fp = path.join(baseDir, "contacts", m[1], "index.html");
    if (!fs.existsSync(fp)) return next();
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(fs.readFileSync(fp));
  }

  return {
    name: "serve-badge-contact-pages",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        trySend(req, res, next, publicDir);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        trySend(req, res, next, distDir);
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "localhost",
      port: 8080,
      headers: {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.microlink.io https://translation.googleapis.com; frame-src 'self' https://*.supabase.co https://www.youtube.com https://player.vimeo.com https://www.google.com https://maps.google.com https://view.officeapps.live.com https://docs.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;",
      },
    },
    plugins: [react(), serveBadgeContactPages()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // Lower peak memory on CI (e.g. Vercel) for a large single chunk
      rollupOptions: {
        maxParallelFileOps: 4,
      },
    },
    // Load environment variables - Vite automatically loads .env files
    // The loadEnv above ensures they're available
  };
});
