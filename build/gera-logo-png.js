// Gera assets/logo-grupo-larssen.png (600×600, fundo branco) a partir do SVG do grupo, para os dados estruturados (Google).
// Uso: node build/gera-logo-png.js
const puppeteer = require("C:/Users/Douglas/Desktop/CLAUDE/majex-produtos/node_modules/puppeteer-core");
const fs = require("fs"), path = require("path");
(async () => {
  const svg = fs.readFileSync(path.join(__dirname, "../assets/logos/grupo.svg"), "utf8");
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const p = await b.newPage();
  await p.setViewport({ width: 600, height: 600 });
  await p.setContent(`<html><body style="margin:0;width:600px;height:600px;display:grid;place-items:center;background:#fff">
  <div style="width:480px;color:#54763A">${svg.replace("<svg", '<svg style="width:100%;height:auto;display:block"')}</div></body></html>`);
  await p.screenshot({ path: path.join(__dirname, "../assets/logo-grupo-larssen.png") });
  await b.close();
  console.log("assets/logo-grupo-larssen.png");
})();
