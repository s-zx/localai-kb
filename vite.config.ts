import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { Plugin } from 'vite';

function crossOriginIsolationPlugin(): Plugin {
  return {
    name: 'cross-origin-isolation',
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((_req, res, next) => {
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        next();
      });
    },
  };
}

/**
 * Serve ort worker .mjs files from public/ort/ as plain JavaScript responses.
 *
 * Vite 5+ blocks ES module imports from /public (throws 500 "file is in
 * /public and cannot be imported from source code"). onnxruntime-web
 * dynamically imports its WASM worker script at runtime via import(), which
 * Vite intercepts and rejects. This plugin runs BEFORE Vite's restriction
 * middleware and returns the file contents directly, so the browser gets a
 * valid module response instead of a 500.
 */
function ortWorkerPlugin(): Plugin {
  return {
    name: 'ort-worker-serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? '';
        // Match /ort/*.mjs (with or without ?import or other Vite suffixes)
        if (/^\/ort\/ort-wasm[^?]*\.mjs(\?.*)?$/.test(url)) {
          const filePath = join(process.cwd(), 'public', url.split('?')[0]);
          if (existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
            res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
            res.end(readFileSync(filePath));
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), crossOriginIsolationPlugin(), ortWorkerPlugin()],
  optimizeDeps: {
    // Both excluded so esbuild doesn't try to pre-bundle them:
    // - edgeflowjs: local symlink whose dynamic import of onnxruntime-web
    //               esbuild can't follow
    // - onnxruntime-web: ships pre-built WASM bundles that must be served
    //                    as static files, not inlined by esbuild
    exclude: ['edgeflowjs', 'onnxruntime-web'],
  },
});
