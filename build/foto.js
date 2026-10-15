// Captura de tela de um arquivo/URL local com o Chrome headless.
// Uso: node foto.js <arquivo.html|url> <saida.png> [largura] [altura] [full]
const puppeteer = require("C:/Users/Douglas/Desktop/CLAUDE/majex-produtos/node_modules/puppeteer-core");
const path = require("path");
(async () => {
  const [, , alvo, saida, w = "1200", h = "800", full] = process.argv;
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--no-sandbox", "--allow-file-access-from-files", "--enable-webgl", "--ignore-gpu-blocklist", "--use-angle=swiftshader"] });
  const p = await b.newPage();
  await p.setViewport({ width: +w, height: +h, deviceScaleFactor: 1 });
  await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
  const url = /^https?:/.test(alvo) ? alvo : "file:///" + path.resolve(alvo).replace(/\\/g, "/");
  await p.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise(r => setTimeout(r, 1500));
  await p.screenshot({ path: saida, fullPage: full === "full" });
  await b.close();
})();
