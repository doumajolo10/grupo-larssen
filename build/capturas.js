// Capturas do site (tela a tela, como um visitante rolando). Requer o servidor em :4040.
// Uso: node build/capturas.js home | paginas [lista,separada,por,vírgula]
const puppeteer = require("C:/Users/Douglas/Desktop/CLAUDE/majex-produtos/node_modules/puppeteer-core");
const fs = require("fs"), path = require("path");
const BASE = "http://localhost:4040/";
const SAIDA = path.join(__dirname, "../pesquisa/shots");
fs.mkdirSync(SAIDA, { recursive: true });
const espera = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const modo = process.argv[2] || "home";
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--no-sandbox", "--ignore-gpu-blocklist", "--enable-gpu", "--use-angle=d3d11"] });
  const erros = [];
  const nova = async (w, h, movel) => {
    const p = await b.newPage();
    p.on("console", m => { if (m.type() === "error" || m.type() === "warning") erros.push(`[${w}] ${m.text()}`); });
    p.on("pageerror", e => erros.push(`[${w}] ERRO ${e.message}`));
    p.on("requestfailed", r => erros.push(`[${w}] falhou ${r.url()}`));
    await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: !!movel, hasTouch: !!movel });
    await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
    return p;
  };
  const rolar = async (p, y) => { await p.evaluate(y => { const L = window.LarssenLenis; if (L) L.scrollTo(y, { immediate: true }); else window.scrollTo(0, y); }, y); await espera(1300); };
  const telas = [[1440, 900, "d", false], [390, 844, "m", true]];
  if (modo === "home") {
    for (const [w, h, nome, movel] of telas) {
      const p = await nova(w, h, movel);
      await p.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 }); await espera(4600);
      await p.screenshot({ path: `${SAIDA}/${nome}-00-topo.png` });
      const heroH = await p.evaluate(() => (document.querySelector(".hero3d")||{offsetHeight:0}).offsetHeight);
      for (const k of [0.3, 0.6, 0.95]) { await rolar(p, (heroH - h) * k); await p.screenshot({ path: `${SAIDA}/${nome}-01-hero-${k}.png` }); }
      const H = await p.evaluate(() => document.documentElement.scrollHeight);
      let i = 2;
      for (let y = heroH; y < H; y += h) { await rolar(p, y); await p.screenshot({ path: `${SAIDA}/${nome}-${String(i++).padStart(2, "0")}.png` }); }
      await p.close();
    }
  } else {
    const pags = (process.argv[3] || "madeireira.html,madeiras-tratadas.html,florestal.html,transportes.html,escavacoes.html,produtos.html,produto-dormentes-tratados.html,processo.html,sustentabilidade.html,sobre.html,contato.html,orcamento.html").split(",");
    for (const [w, h, nome, movel] of telas) {
      const p = await nova(w, h, movel);
      for (const pg of pags) {
        await p.goto(BASE + pg, { waitUntil: "networkidle2", timeout: 60000 }); await espera(1500);
        const H = await p.evaluate(() => document.documentElement.scrollHeight);
        const passos = Math.min(10, Math.ceil(H / h));
        for (let k = 0; k < passos; k++) {
          await rolar(p, k * h);
          await p.screenshot({ path: `${SAIDA}/${nome}-p-${pg.replace(".html", "")}-${k}.png` });
        }
      }
      await p.close();
    }
  }
  console.log("erros/avisos:", erros.length ? "\n" + [...new Set(erros)].join("\n") : "nenhum");
  await b.close();
})();
