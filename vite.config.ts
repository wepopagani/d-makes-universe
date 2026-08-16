import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";

/** In dev, serve public/b2b/index.html at /b2b (Vite does not auto-resolve index.html for subpaths). */
function b2bStaticRoute(): Plugin {
  return {
    name: "b2b-static-route",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const raw = req.url;
        if (!raw) return next();
        const pathOnly = raw.split("?")[0] ?? "";
        if (pathOnly === "/b2b" || pathOnly === "/b2b/") {
          const qs = raw.includes("?") ? raw.slice(raw.indexOf("?")) : "";
          req.url = "/b2b/index.html" + qs;
        }
        next();
      });
    },
  };
}
import path from "path";
import { componentTagger } from "lovable-tagger";
import { createRequire } from "module";

// In questo progetto `package.json` ha `type: module`, quindi un `import` standard
// caricherebbe la build ESM del plugin che internamente usa `require` e va in errore.
// Forziamo invece il caricamento della variante CommonJS.
const require = createRequire(import.meta.url);
const vitePrerender = require("vite-plugin-prerender");

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [
    b2bStaticRoute(),
    react(),
    mode === "production" &&
      vitePrerender({
        staticDir: path.join(__dirname, "dist"),
        indexPath: path.join(__dirname, "dist", "index.html"),
        routes:
          process.env.PRERENDER_ROUTES
            ? process.env.PRERENDER_ROUTES.split(",").map((s) => s.trim()).filter(Boolean)
            : [
                "/",
                "/about",
                "/mission",
                "/services",
                "/faq",
                "/calculator",
                "/blog",
                "/contact-success",
                "/iscrizione-corsi",
                "/login",
                "/register",
                "/forgot-password",
                "/pets",
                "/services/fdm",
                "/services/cff",
                "/services/sla",
                "/services/slm",
                "/services/sls",
                "/services/mjf",
                "/services/polyjet",
                "/services/laser",
                "/services/riparazione-stampanti",
                "/services/scansione",
                "/services/prototipazione",
                "/services/lsam",
                "/droni",
                "/blog/fdm-vs-sla-confronto",
                "/blog/scansione-3d-reverse-engineering",
                "/blog/taglio-incisione-laser-metallo",
                "/blog/stampa-3d-metallo-slm",
                "/blog/preparare-file-stl-step-checklist",
                "/blog/piccole-serie-sls-mjf",
                "/blog/drone-fpv-aether4-stampa-3d",
                "/blog/riciclaggio-filamento-fdm",
                "/blog/stampa-3d-odontotecnica",
                "/blog/ciotole-personalizzabili",
                "/blog/cuscinetti-tpu-ferrature-equine",
                "/blog/gadget-aziendali-nfc",
                "/blog/accessori-ristorativi",
                "/blog/componenti-meccanici",
                "/blog/protesi-mediche",
                "/blog/come-funziona-stampa-3d",
                "/blog/materiali-stampa-3d",
                "/blog/prototipazione-rapida",
                "/blog/applicazioni-creative-stampa-3d",
                "/blog/stampanti-3d-confronto",
              ],
        renderer: new (vitePrerender as any).PuppeteerRenderer({
          headless: true,
          // Non blocchiamo terze parti: durante il prerender vogliamo massima probabilità
          // che l'app completi il mount e popoli il contenuto.
          skipThirdPartyRequests: false,
          // Dopo il fix target es2019 il bundle gira subito; un breve delay copre async (i18n, auth).
          renderAfterTime: 5000,
        }),
        // Assicuriamoci che l'output rimanga sotto dist/.
        outputDir: path.join(__dirname, "dist"),
      }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  build: {
    // Evita modulepreload aggressivo di tutti i chunk (three, pdf, …) sulla prima richiesta.
    modulePreload: false,
    // Prerender (@prerenderer/renderer-puppeteer → puppeteer 1.x → Chromium ~78) non supporta
    // sintassi ES2020+ (es. optional chaining) nel bundle. Allineiamo l'output a ES2019.
    target: "es2019",
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("firebase")) return "firebase";
          // NON separare three / @react-three: in un chunk dedicato React risulta undefined (useLayoutEffect crash → schermo bianco).
          if (id.includes("recharts")) return "recharts";
          if (id.includes("@radix-ui")) return "radix-ui";
          if (id.includes("framer-motion")) return "framer-motion";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("html2canvas") || id.includes("jspdf") || id.includes("purify")) return "pdf-export";
          if (id.includes("i18next") || id.includes("react-i18next")) return "i18n";
          return "vendor";
        },
      },
    },
  }
}));
