// Valida o sheet de instruções no Opera: clica no botão e captura a UI.
const PORT = Number(process.argv[2] ?? 9222);
const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const page = list.find((t) => t.type === "page" && t.url.includes("localhost:3000"));
if (!page) { console.log("NO_PAGE"); process.exit(1); }

const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
const send = (method, params = {}) =>
  new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

await new Promise((r) => (ws.onopen = r));
await send("Page.enable");
await send("Runtime.enable");
await send("Page.navigate", { url: "http://localhost:3000/app/inicio" });
await new Promise((r) => setTimeout(r, 7000));

const info = await send("Runtime.evaluate", {
  expression: `JSON.stringify({
    opera: !!window.__ccInstall?.opera,
    canInstall: !!window.__ccInstall?.canInstall,
    hasBtn: !!document.querySelector('button[aria-label*="Install"]')
  })`,
  returnByValue: true,
});
console.log("BEFORE:", info.result?.result?.value);

const click = await send("Runtime.evaluate", {
  expression: `(() => {
    const b = document.querySelector('button[aria-label*="Install"]');
    if (!b) return 'NO_BUTTON';
    b.click(); return 'CLICKED';
  })()`,
  returnByValue: true,
});
console.log("CLICK:", click.result?.result?.value);
await new Promise((r) => setTimeout(r, 1500));

const sheet = await send("Runtime.evaluate", {
  expression: `(() => {
    const d = document.querySelector('[role="dialog"]');
    return JSON.stringify({
      open: !!d,
      inBody: d ? d.parentElement === document.body : false,
      text: d ? d.innerText.replace(/\\n+/g, ' | ') : null,
      clipped: d ? d.getBoundingClientRect().bottom > innerHeight + 2 : null
    });
  })()`,
  returnByValue: true,
});
console.log("SHEET:", sheet.result?.result?.value);

const shot = await send("Page.captureScreenshot", { format: "png" });
if (shot.result?.data) {
  const fs = await import("node:fs");
  fs.writeFileSync("docs/opera-sheet.png", Buffer.from(shot.result.data, "base64"));
  console.log("SHOT: docs/opera-sheet.png");
}
ws.close();
