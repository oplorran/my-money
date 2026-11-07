const PORT = 9333;
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

const inst = await send("Page.getInstallabilityErrors");
console.log("INSTALLABILITY:", JSON.stringify(inst.result ?? inst.error));

for (let i = 0; i < 3; i++) {
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: 300, y: 450, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: 300, y: 450, button: "left", clickCount: 1 });
  await new Promise((r) => setTimeout(r, 1000));
}
console.log("waiting for beforeinstallprompt…");
await new Promise((r) => setTimeout(r, 12000));

const st = await send("Runtime.evaluate", {
  expression: `JSON.stringify({ canInstall: !!window.__ccInstall?.canInstall, hasEvent: !!window.__ccInstall?.event })`,
  returnByValue: true,
});
console.log("STATE:", st.result?.result?.value);

// dispara o prompt nativo pelo proprio botao
const click = await send("Runtime.evaluate", {
  expression: `(() => {
    const b = [...document.querySelectorAll('button')].find(x => (x.getAttribute('aria-label')||'').includes('Install'));
    if (!b) return 'NO_BUTTON';
    b.click();
    return 'CLICKED';
  })()`,
  returnByValue: true,
});
console.log("BUTTON:", click.result?.result?.value);
ws.close();
