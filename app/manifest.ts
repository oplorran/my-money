import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cash Club",
    short_name: "Cash Club",
    description: "Your AI trading app: lessons, accelerator and signals.",
    id: "/app/inicio",
    start_url: "/app/inicio",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#090909",
    theme_color: "#090909",
    lang: "en",
    dir: "ltr",
    categories: ["finance", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Home", url: "/app/inicio", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Trade", url: "/app/trade", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
