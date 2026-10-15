// Renderiza a cena 3D isolada em alguns pontos do trajeto (teste visual).
const puppeteer = require("C:/Users/Douglas/Desktop/CLAUDE/majex-produtos/node_modules/puppeteer-core");
const path = require("path");
const url = f => "file:///" + path.resolve(f).split(path.sep).join("/");
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--no-sandbox", "--allow-file-access-from-files", "--ignore-gpu-blocklist", "--enable-gpu", "--use-angle=d3d11"] });
  const p = await b.newPage(); const erros = [];
  p.on("console", m => { if (m.type() === "error") erros.push(m.text()); }); p.on("pageerror", e => erros.push(e.message));
  await p.setViewport({ width: 1440, height: 810 });
  const pontos = (process.argv[2] || "0,0.3,0.55,0.85").split(",").map(Number);
  for (const t of pontos) {
    const t0 = Date.now();
    await p.goto(url("pesquisa/ver/cena.html") + "?t=" + t + "&f=" + (process.argv[3] || 0), { waitUntil: "networkidle0", timeout: 90000 });
    await p.waitForFunction("window.pronto === true", { timeout: 90000 });
    await new Promise(r => setTimeout(r, 800));
    await p.screenshot({ path: `pesquisa/ver/cena-${t}-f${process.argv[3] || 0}.png` });
    console.log("t", t, "ms", Date.now() - t0);
  }
  console.log("erros", erros);
  await b.close();
})();
