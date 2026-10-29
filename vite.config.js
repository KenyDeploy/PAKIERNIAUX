import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
function offlineShell() {
  return {
    name: "pakiernia-offline-shell",
    apply: "build",
    generateBundle(_, bundle) {
      const assets = Object.keys(bundle).filter(name => /\.(js|css)$/.test(name)).map(name => "/" + name);
      const photos = ["/exercise-photos-v1.webp", ...Array.from({length:11}, (_,i) => `/exercise-photos-v1-${i+2}.webp`)];
      const version = "v2|" + assets.join("|");
      this.emitFile({ type: "asset", fileName: "sw.js", source: `
const CACHE = "pakiernia-shell-" + ${JSON.stringify(version)};
const ASSETS = ${JSON.stringify(["/", "/index.html", "/icon.svg", "/manifest.webmanifest", ...photos, ...assets])};
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("pakiernia-shell-") && key !== CACHE).map(key => caches.delete(key))))));
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("/index.html", { ignoreVary: true })));
  } else if (ASSETS.includes(url.pathname)) {
    // These are allowlisted public shell assets only. Servers may add Vary: Origin,
    // while precache fetches and module requests send different Origin headers.
    event.respondWith(caches.match(event.request, { ignoreVary: true }).then(cached => cached || fetch(event.request)));
  }
});
` });
    },
  };
}
export default defineConfig({ plugins:[react(), offlineShell()] });

