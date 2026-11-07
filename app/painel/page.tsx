"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FUNIS, RABICHO, TIPO_LABEL } from "./roteiros";
import type { Etapa, Funil } from "./roteiros";

const TOTAL_ETAPAS = FUNIS.reduce((s, f) => s + f.etapas.length, 0) + RABICHO.length;

const TIPO_TONE: Record<string, string> = {  audio: "border-[#a8ff16]/30 bg-[#a8ff16]/10 text-[#a8ff16]",
  gesto: "border-[#303030] bg-[#1b1b1d] text-[#cccccc]",
  tela: "border-[#303030] bg-[#111111] text-[#888888]",
  checkout: "border-[#a8ff16]/40 bg-[#151b0d] text-[#a8ff16]",
  redirect: "border-[#303030] bg-[#111111] text-[#666666]",
  upsell: "border-[#303030] bg-[#1b1b1d] text-[#cccccc]",
};

function etapaTexto(e: Etapa, mostrarOriginal: boolean) {
  const linhas = [`${e.n} · ${e.rota}`, e.titulo];
  if (e.ato) linhas.push(`[${e.ato}]`);
  if (mostrarOriginal && e.en) linhas.push(`EN: ${e.en}`);
  linhas.push(`PT: ${e.pt}`);
  if (e.obs?.length) linhas.push(...e.obs.map((o) => `· ${o}`));
  return linhas.join("\n");
}

function funilTexto(f: Funil, mostrarOriginal: boolean) {
  const cabecalho = [
    `${f.nome}`,
    f.resumo,
    `Público: ${f.publico}`,
    `Saldo inicial: ${f.saldo}`,
    `Operações: ${f.operacoes}`,
    `Oferta: ${f.oferta}`,
    `Saída: ${f.destino}`,
    `Áudio: ${f.voz}`,
    "",
  ];
  const corpo = f.etapas.map((e) => etapaTexto(e, mostrarOriginal));
  const rabicho = ["", "— CADEIA COMPARTILHADA —", ...RABICHO.map((e) => etapaTexto(e, mostrarOriginal))];
  return [...cabecalho, ...corpo, ...rabicho].join("\n\n");
}

export default function Painel() {
  const [ativo, setAtivo] = useState(FUNIS[0].id);
  const [mostrarOriginal, setMostrarOriginal] = useState(true);
  const [copiado, setCopiado] = useState(false);

  const funil = useMemo(() => FUNIS.find((f) => f.id === ativo) ?? FUNIS[0], [ativo]);

  const copiar = () => {
    const texto = funilTexto(funil, mostrarOriginal);

    // `navigator.clipboard` exige foco e contexto seguro; o textarea cobre o resto.
    const legado = () => {
      const ta = document.createElement("textarea");
      ta.value = texto;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {}
      document.body.removeChild(ta);
    };

    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 1800);

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(texto).catch(legado);
      return;
    }
    legado();
  };

  const totalEtapas = funil.etapas.length;

  return (
    <main className="mc-shell relative min-h-[100svh] pb-24">
      <div className="mc-glow" />

      <header className="sticky top-0 z-30 border-b border-[#303030] bg-[#090909]/95 backdrop-blur-md">
        <div className="mx-auto w-full max-w-[760px] px-4 pb-3 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#666666]">Cash Club</p>
              <h1 className="mt-1 text-[19px] font-black leading-tight tracking-tight text-white">
                Painel de roteiros
              </h1>
              <p className="mt-1 text-[11.5px] leading-snug text-[#888888]">
                4 funis catalogados · {TOTAL_ETAPAS} etapas · original em inglês + tradução
              </p>
            </div>
            <Link
              href="/"
              className="shrink-0 rounded-full border border-[#303030] bg-[#111111] px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-[#888888] transition-colors hover:border-[#a8ff16]/40 hover:text-[#a8ff16]"
            >
              Início
            </Link>
          </div>

          <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto">
            {FUNIS.map((f) => {
              const on = f.id === ativo;
              return (
                <button
                  key={f.id}
                  onClick={() => setAtivo(f.id)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    on
                      ? "border-[#a8ff16] bg-[#a8ff16] text-[#090909]"
                      : "border-[#303030] bg-[#111111] text-[#888888] hover:text-white"
                  }`}
                >
                  {f.id.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-[760px] px-4 pt-4">
        {/* ficha do funil */}
        <section className="rounded-[24px] border border-[#303030] bg-[#111111] p-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-[16px] font-black leading-tight text-white">{funil.nome}</h2>
            <span className="tabular shrink-0 rounded-full border border-[#303030] bg-[#1b1b1d] px-2.5 py-1 text-[10px] font-bold text-[#888888]">
              {totalEtapas} etapas
            </span>
          </div>
          <p className="mt-2 text-[12.5px] leading-relaxed text-[#cccccc]">{funil.resumo}</p>

          <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-[#292929] pt-3">
            {[
              ["Público", funil.publico],
              ["Saldo inicial", funil.saldo],
              ["Operações", funil.operacoes],
              ["Oferta", funil.oferta],
              ["Saída", funil.destino],
              ["Áudio", funil.voz],
            ].map(([k, v]) => (
              <div key={k} className="min-w-0">
                <dt className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#666666]">{k}</dt>
                <dd className="mt-0.5 text-[11.5px] leading-snug text-[#cccccc]">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-3 flex flex-wrap gap-2 border-t border-[#292929] pt-3">
            <Link
              href={`/${funil.id}`}
              className="rounded-full border border-[#a8ff16]/40 bg-[#151b0d] px-3 py-1.5 text-[11px] font-bold text-[#a8ff16]"
            >
              Abrir funil
            </Link>
            <button
              onClick={copiar}
              className="rounded-full border border-[#303030] bg-[#1b1b1d] px-3 py-1.5 text-[11px] font-bold text-[#cccccc] transition-colors hover:border-[#a8ff16]/40 hover:text-white"
            >
              {copiado ? "Roteiro copiado" : "Copiar roteiro"}
            </button>
          </div>
        </section>

        {/* controle de idioma */}
        <div className="mt-4 flex items-center justify-between rounded-[18px] border border-[#303030] bg-[#111111] px-3.5 py-2.5">
          <div>
            <p className="text-[12px] font-semibold text-white">Exibir original em inglês</p>
            <p className="text-[10.5px] text-[#666666]">Desligue para ler só a tradução</p>
          </div>
          <button
            onClick={() => setMostrarOriginal((v) => !v)}
            role="switch"
            aria-checked={mostrarOriginal}
            aria-label="Exibir original em inglês"
            className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
              mostrarOriginal ? "border-[#a8ff16] bg-[#a8ff16]" : "border-[#303030] bg-[#1b1b1d]"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${
                mostrarOriginal ? "left-[22px] bg-[#090909]" : "left-0.5 bg-[#888888]"
              }`}
            />
          </button>
        </div>

        {/* etapas */}
        <ol className="mt-4 space-y-2.5">
          {funil.etapas.map((e) => (
            <li key={e.n}>
              <article className="overflow-hidden rounded-[20px] border border-[#303030] bg-[#111111]">
                <div className="flex items-start gap-2.5 border-b border-[#292929] px-3.5 py-2.5">
                  <span className="tabular mt-0.5 shrink-0 rounded-md bg-[#1b1b1d] px-1.5 py-0.5 text-[10px] font-bold text-[#888888]">
                    {e.n}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold leading-tight text-white">{e.titulo}</p>
                    <p className="mt-0.5 break-all font-mono text-[10px] leading-snug text-[#666666]">{e.rota}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      TIPO_TONE[e.tipo]
                    }`}
                  >
                    {TIPO_LABEL[e.tipo]}
                  </span>
                </div>

                <div className="space-y-2 px-3.5 py-3">
                  {e.ato && (
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a8ff16]/80">{e.ato}</p>
                  )}

                  {mostrarOriginal && e.en && (
                    <div className="rounded-[14px] border border-[#292929] bg-[#0d0d0d] p-2.5">
                      <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#666666]">Original</p>
                      <p className="text-[12px] leading-relaxed text-[#888888]">{e.en}</p>
                    </div>
                  )}

                  <div className="rounded-[14px] border border-[#a8ff16]/20 bg-[#151b0d] p-2.5">
                    <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#a8ff16]/80">Tradução</p>
                    <p className="text-[12.5px] leading-relaxed text-[#cccccc]">{e.pt}</p>
                  </div>

                  {e.obs?.length ? (
                    <ul className="space-y-1 pt-0.5">
                      {e.obs.map((o) => (
                        <li key={o} className="flex gap-1.5 text-[11px] leading-snug text-[#888888]">
                          <span className="mt-[1px] shrink-0 text-[#666666]">·</span>
                          <span>{o}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            </li>
          ))}
        </ol>

        {/* cadeia compartilhada */}
        <section className="mt-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-px flex-1 bg-[#292929]" />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#666666]">
              Cadeia compartilhada · todos os funis
            </p>
            <span className="h-px flex-1 bg-[#292929]" />
          </div>

          <ol className="space-y-2.5">
            {RABICHO.map((e) => (
              <li key={e.n}>
                <article className="overflow-hidden rounded-[20px] border border-[#303030] bg-[#111111]">
                  <div className="flex items-start gap-2.5 border-b border-[#292929] px-3.5 py-2.5">
                    <span className="tabular mt-0.5 shrink-0 rounded-md bg-[#1b1b1d] px-1.5 py-0.5 text-[10px] font-bold text-[#888888]">
                      {e.n}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold leading-tight text-white">{e.titulo}</p>
                      <p className="mt-0.5 break-all font-mono text-[10px] leading-snug text-[#666666]">{e.rota}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        TIPO_TONE[e.tipo]
                      }`}
                    >
                      {TIPO_LABEL[e.tipo]}
                    </span>
                  </div>

                  <div className="space-y-2 px-3.5 py-3">
                    {mostrarOriginal && e.en && (
                      <div className="rounded-[14px] border border-[#292929] bg-[#0d0d0d] p-2.5">
                        <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#666666]">Original</p>
                        <p className="text-[12px] leading-relaxed text-[#888888]">{e.en}</p>
                      </div>
                    )}
                    <div className="rounded-[14px] border border-[#a8ff16]/20 bg-[#151b0d] p-2.5">
                      <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#a8ff16]/80">Tradução</p>
                      <p className="text-[12.5px] leading-relaxed text-[#cccccc]">{e.pt}</p>
                    </div>
                    {e.obs?.length ? (
                      <ul className="space-y-1 pt-0.5">
                        {e.obs.map((o) => (
                          <li key={o} className="flex gap-1.5 text-[11px] leading-snug text-[#888888]">
                            <span className="mt-[1px] shrink-0 text-[#666666]">·</span>
                            <span>{o}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </section>

        <p className="mt-6 rounded-[18px] border border-[#303030] bg-[#0d0d0d] p-3.5 text-[11px] leading-relaxed text-[#666666]">
          Tradução de referência para produção de roteiro. Os valores em dólar, prazos e contadores seguem o que está
          implementado nas rotas. A cópia final deve manter o inglês como texto de tela.
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#303030] bg-[#090909]/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[760px] items-center gap-2 px-4 py-3">
          <button
            onClick={copiar}
            className="mc-cta flex-1 rounded-[16px] py-3 text-[13px] font-bold"
          >
            {copiado ? "Roteiro copiado" : `Copiar ${funil.id.toUpperCase()}`}
          </button>
          <Link
            href={`/${funil.id}`}
            className="shrink-0 rounded-[16px] border border-[#303030] bg-[#111111] px-4 py-3 text-[13px] font-bold text-white"
          >
            Abrir
          </Link>
        </div>
      </div>
    </main>
  );
}
