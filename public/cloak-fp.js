/**
 * Cloak fingerprint — anti-headless no cliente.
 * Roda na página do funil. Detecta automação/headless que passou pelos filtros
 * de header do middleware (UA de iPhone falso, etc.) e marca o cookie cloak_fp=1.
 * Na próxima navegação o middleware manda pra white. Também reporta pro backend.
 *
 * Risco zero pra comprador real: só marca quando há sinais FORTES de automação.
 */
(function () {
  "use strict";
  try {
    if (navigator.__cloakFp) return;
    navigator.__cloakFp = 1;

    var tells = [];

    // 1) webdriver flag (Selenium/Puppeteer/Playwright setam)
    try { if (navigator.webdriver === true) tells.push("webdriver"); } catch (e) {}

    // 2) Headless Chrome deixa pistas no UA / chrome object
    try {
      var ua = navigator.userAgent || "";
      if (/HeadlessChrome/i.test(ua)) tells.push("headless_ua");
      // Chrome real tem window.chrome; headless às vezes não
      if (/Chrome/.test(ua) && !/Edg|OPR/.test(ua) && typeof window.chrome === "undefined") tells.push("no_chrome_obj");
    } catch (e) {}

    // 3) Mobile UA mas SEM touch (iPhone/Android de verdade têm touch)
    try {
      var ua2 = navigator.userAgent || "";
      var claimsMobile = /iPhone|iPad|Android|Mobile/i.test(ua2);
      var hasTouch = ("ontouchstart" in window) || navigator.maxTouchPoints > 0;
      if (claimsMobile && !hasTouch) tells.push("mobile_no_touch");
    } catch (e) {}

    // 4) WebGL vendor "SwiftShader"/"llvmpipe" = renderização por software (headless).
    //    Só conta como tell se o renderer EXISTE e é software — ausência de WebGL
    //    NÃO conta (muitos navegadores mobile/privacidade bloqueiam WebGL).
    try {
      var canvas = document.createElement("canvas");
      var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (gl) {
        var dbg = gl.getExtension("WEBGL_debug_renderer_info");
        if (dbg) {
          var renderer = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "");
          if (/SwiftShader|llvmpipe|Mesa OffScreen/i.test(renderer)) tells.push("swiftshader");
        }
      }
    } catch (e) {}

    // 5) Tela 0x0 (headless sem display) — sinal forte e sem falso-positivo.
    try {
      if (screen.width === 0 || screen.height === 0) tells.push("zero_screen");
    } catch (e) {}

    // Decisão CONSERVADORA: só marca com sinal DEFINITIVO de automação.
    // Nada de combinar sinais fracos (no_webgl/no_languages) — WebView do
    // Instagram/Facebook e navegadores de privacidade dão falso-positivo.
    var flagged = tells.some(function (t) {
      return ["webdriver", "headless_ua", "swiftshader", "zero_screen", "mobile_no_touch"].indexOf(t) !== -1;
    });

    if (flagged) {
      // Marca o cookie (middleware lê na próxima request)
      try { document.cookie = "cloak_fp=1; max-age=2592000; path=/; samesite=lax"; } catch (e) {}
    }

    // Reporta sempre (headless OU limpo) pro backend medir
    report(tells, flagged);

    function report(t, isFlagged) {
      try {
        var payload = JSON.stringify({
          flagged: !!isFlagged,
          tells: (t || []).slice(0, 10),
          ua: (navigator.userAgent || "").slice(0, 200),
          path: location.pathname,
          ref: document.referrer.slice(0, 120),
          ts: Date.now()
        });
        if (navigator.sendBeacon) navigator.sendBeacon("/api/cloak/fp", new Blob([payload], { type: "application/json" }));
      } catch (e) {}
    }
  } catch (e) {}
})();
