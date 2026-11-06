"use client";

/**
 * Overlay curto do clique em START NOW: no original é só "Activating your session".
 * Aqui ele entrega a sessão à /pv13/trading após o mesmo compasso.
 */
export function ActivateOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0c]/95 backdrop-blur-sm mc-fade">
      <div className="mx-4 w-full max-w-[280px] rounded-3xl border border-zinc-600/25 bg-zinc-500/[.07] p-7 text-center backdrop-blur-md">
        <div className="mx-auto mb-5 h-11 w-11 animate-spin rounded-full border-4 border-red-900/40 border-t-red-500" />
        <p className="mb-1 text-lg font-bold text-white">Activating your session</p>
        <p className="text-sm text-zinc-400">Connecting to the AI…</p>
      </div>
    </div>
  );
}
