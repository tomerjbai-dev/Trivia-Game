import type { MetadataRoute } from "next";

// Web App Manifest (ARCHITECTURE 2.7). Installable from the browser menu only;
// there is no service worker, so nothing is cached for offline play.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "חכמולוגים",
    short_name: "חכמולוגים",
    description: "שאלות מעניינות על כל מה שמסקרן אתכם",
    lang: "he",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F8F8F8",
    theme_color: "#F8F8F8",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
