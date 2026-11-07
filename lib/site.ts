/**
 * Domínio público do funil. Usado como `metadataBase` e para montar links
 * absolutos (compartilhamento, anúncio, e-mail).
 *
 * Sobrescreva com `NEXT_PUBLIC_SITE_URL` em preview ou domínio próprio; o
 * fallback é o deploy de produção no Render.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://my-money-rz30.onrender.com").replace(/\/+$/, "");

/** Monta uma URL absoluta a partir de um caminho interno. */
export function abs(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
