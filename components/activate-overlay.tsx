"use client";

/**
 * Overlay curto do clique em START NOW: no original é só "Activating your session".
 * Aqui ele entrega a sessão à /pv13/trading após o mesmo compasso.
 */
export function ActivateOverlay() {
  return (
    <div className="mc-fade fixed inset-0 z-[9999] flex items-center justify-center bg-[#090909]/95 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-[280px] rounded-[28px] border border-[#303030] bg-[#111111] p-7 text-center">
        <div className="mx-auto mb-5 h-11 w-11 animate-spin rounded-full border-4 border-[#1b1b1d] border-t-[#a8ff16]" />
        <p className="mb-1 text-lg font-bold text-white">Activating your session</p>
        <p className="text-sm text-[#888888]">Connecting to the AI…</p>
      </div>
    </div>
  );
}
