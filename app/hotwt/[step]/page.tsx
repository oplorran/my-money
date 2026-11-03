import { redirect } from "next/navigation";

export const instant = false;

type Params = { step: string };
type Search = {
  to?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  xcod?: string;
  sck?: string;
};

const PASSTHROUGH = [
  "sck",
  "xcod",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

/** Só redireciona para fora se o destino for https e de domínio conhecido. */
const ALLOWED_HOSTS = [
  "go.centerpag.com",
  "checkout.centerpag.com",
  "pay.hotmart.com",
  "riseaiclub.com",
  "growaiclub.com",
  "transitaclub.com",
];

function safeTarget(raw: string): string | null {
  try {
    const url = new URL(decodeURIComponent(raw));
    if (url.protocol !== "https:") return null;
    const host = url.hostname.replace(/^www\./, "");
    const ok = ALLOWED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
    return ok ? url.toString() : null;
  } catch {
    return null;
  }
}

export default async function Hotwt({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { step } = await params;
  const sp = await searchParams;

  if (sp.to) {
    const target = safeTarget(sp.to);
    if (target) {
      const url = new URL(target);
      for (const key of PASSTHROUGH) {
        const v = sp[key];
        if (v) url.searchParams.set(key, v);
      }
      redirect(url.toString());
    }
  }

  if (step === "up1") redirect("/pay/up1");
  if (step === "up2") redirect("/pay/up2");
  redirect("/");
}
