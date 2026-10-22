// Testes automáticos do site do Grupo Larssen (servidor em :4040). Uso: node build/testa.js
const puppeteer = require("C:/Users/Douglas/Desktop/CLAUDE/majex-produtos/node_modules/puppeteer-core");
const fs = require("fs"), path = require("path");
const BASE = "http://localhost:4040/";
const RAIZ = path.join(__dirname, "..");
const PAINEL = JSON.parse(fs.readFileSync(path.join(RAIZ, "painel", "catalogo.json"), "utf8"));
const espera = ms => new Promise(r => setTimeout(r, ms));
const clicar = async (p, sel) => { await p.evaluate(sel => { const e = document.querySelector(sel); const y = e.getBoundingClientRect().top + scrollY - innerHeight / 2; if (window.LarssenLenis) window.LarssenLenis.scrollTo(y, { immediate: true }); else scrollTo(0, y); }, sel); await espera(500); await p.click(sel); };
let ok = 0, falhas = [];
const checa = (cond, nome) => { if (cond) { ok++; console.log("  ok   " + nome); } else { falhas.push(nome); console.log("  FALHA " + nome); } };

(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--no-sandbox", "--ignore-gpu-blocklist", "--enable-gpu", "--use-angle=d3d11"] });
  const erros = [];
  const nova = async (w = 1440, h = 900, movel = false) => {
    const p = await b.newPage();
    p.on("pageerror", e => erros.push(e.message));
    p.on("console", m => { if (m.type() === "error") erros.push(m.text()); });
    p.on("response", r => { if (r.status() >= 400 && r.url().startsWith(BASE)) erros.push(r.status() + " " + r.url()); });
    await p.setViewport({ width: w, height: h, isMobile: movel, hasTouch: movel });
    await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
    // painel (Supabase) simulado: devolve os produtos atuais, como se a equipe não tivesse mudado nada
    await p.setRequestInterception(true);
    p.on("request", r => { const u = r.url(); if (r.method() !== "OPTIONS" && u.includes("supabase.co/rest/v1/larssen_produtos")) return r.respond({ status: 200, contentType: "application/json", headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(PAINEL.produtos) }); if (r.method() === "OPTIONS" && u.includes("supabase.co")) return r.respond({ status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "apikey, accept, content-type", "Access-Control-Allow-Methods": "GET, OPTIONS" } }); r.continue(); });
    // abre links de WhatsApp sem sair: captura window.open
    await p.evaluateOnNewDocument(() => { window.__abertos = []; window.open = (u) => { window.__abertos.push(u); return null; }; });
    return p;
  };

  // 1. todas as páginas: carregam, título, h1 único, imagens existem, links internos válidos
  console.log("Páginas e links");
  const htmls = fs.readdirSync(RAIZ).filter(f => f.endsWith(".html"));
  checa(htmls.length >= 50, `${htmls.length} páginas geradas`);
  const arquivos = new Set(htmls);
  let linksRuins = [], imgsRuins = [], semH1 = [], semDesc = [];
  for (const f of htmls) {
    const t = fs.readFileSync(path.join(RAIZ, f), "utf8");
    const h1 = (t.match(/<h1[\s>]/g) || []).length; if (h1 !== 1) semH1.push(f + ":" + h1);
    if (!/<meta name="description" content="[^"]{30,}/.test(t)) semDesc.push(f);
    for (const m of t.matchAll(/href="([^"#:?]+\.html)(#[^"]*)?"/g)) if (!arquivos.has(m[1])) linksRuins.push(f + " -> " + m[1]);
    for (const m of t.matchAll(/(?:src|href)="((?:img|assets|fontes)\/[^"?]+)"/g)) if (!fs.existsSync(path.join(RAIZ, m[1]))) imgsRuins.push(f + " -> " + m[1]);
    for (const m of t.matchAll(/srcset="([^"]+)"/g)) for (const s of m[1].split(",")) { const u = s.trim().split(" ")[0]; if (!fs.existsSync(path.join(RAIZ, u))) imgsRuins.push(f + " -> " + u); }
  }
  checa(!linksRuins.length, "links internos apontam para páginas existentes" + (linksRuins.length ? ": " + linksRuins.slice(0, 5).join(", ") : ""));
  checa(!imgsRuins.length, "todas as imagens, CSS, JS e fontes existem" + (imgsRuins.length ? ": " + [...new Set(imgsRuins)].slice(0, 5).join(", ") : ""));
  checa(!semH1.length, "cada página tem exatamente um h1" + (semH1.length ? ": " + semH1.join(", ") : ""));
  checa(!semDesc.length, "cada página tem descrição para o Google" + (semDesc.length ? ": " + semDesc.join(", ") : ""));

  // 2. home: abertura sem 3D, frase, números, trilho
  console.log("Home");
  let p = await nova();
  await p.goto(BASE, { waitUntil: "networkidle2" }); await espera(1500);
  checa(await p.evaluate(() => !document.querySelector("canvas, .hero3d, .carregador")), "abertura sem cena 3D nem carregador");
  checa(await p.evaluate(() => { const h = document.querySelector("h1"); const r = h.getBoundingClientRect(); return h.textContent.includes("Da floresta") && r.top > 60 && r.bottom < innerHeight; }), "título visível na primeira tela");
  checa(await p.evaluate(() => [...document.querySelectorAll(".acoes-abertura a")].length === 2), "botões de orçamento e WhatsApp na abertura");
  checa(await p.evaluate(() => { const i = document.querySelector(".abertura .frase-foto img"); return i.complete && i.naturalWidth > 0; }), "foto aérea da abertura carregou");
  await espera(2200);
  checa(await p.evaluate(() => document.querySelector("[data-conta='47000']").textContent.includes("47.000")), "contador chega a 47.000 m²");
  await p.evaluate(() => { window.LarssenLenis ? window.LarssenLenis.scrollTo(2500, { immediate: true }) : scrollTo(0, 2500); }); await espera(1200);
  const km = await p.evaluate(() => document.querySelector(".trilho .km b").textContent);
  checa(km !== "0,0", "trilho lateral avança o km (" + km + ")");
  // mapa
  await p.evaluate(() => { const e = document.querySelector("[data-mapa]"); window.LarssenLenis.scrollTo(e.getBoundingClientRect().top + scrollY - 200, { immediate: true }); }); await espera(2600);
  checa(await p.evaluate(() => document.querySelectorAll(".uf.atende.on").length === 8), "mapa acende os 8 estados");
  // fotos das empresas carregam
  for (const id of ["florestal", "madeireira", "tratadas", "transportes", "escavacoes"]) {
    await p.evaluate(id => { const e = document.getElementById(id); window.LarssenLenis.scrollTo(e.getBoundingClientRect().top + scrollY - 100, { immediate: true }); }, id); await espera(1400);
    checa(await p.evaluate(id => [...document.querySelectorAll("#" + id + " .colagem img")].every(i => i.complete && i.naturalWidth > 0), id), `fotos da saída ${id} carregaram`);
  }
  await p.close();

  // 3. romaneio: adicionar, quantidade, remover, mensagem de WhatsApp
  console.log("Romaneio");
  p = await nova();
  await p.goto(BASE + "produtos.html", { waitUntil: "networkidle2" }); await espera(1200);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await p.reload({ waitUntil: "networkidle2" }); await espera(1000);
  await clicar(p, '[data-add="dormentes-tratados"]'); await espera(300);
  await clicar(p, '[data-add="pergolados"]'); await espera(300);
  checa(await p.evaluate(() => document.querySelector(".bt-romaneio .conta").textContent === "2"), "contador do romaneio mostra 2");
  checa(await p.evaluate(() => document.querySelector('[data-add="pergolados"]').classList.contains("no")), "botão vira 'No romaneio'");
  await p.evaluate(() => { if (window.LarssenLenis) window.LarssenLenis.scrollTo(0, { immediate: true }); else scrollTo(0, 0); }); await espera(700);
  await p.click(".bt-romaneio"); await espera(700);
  checa(await p.evaluate(() => document.querySelector(".gaveta").classList.contains("aberta")), "gaveta do romaneio abre");
  await p.click('.gaveta .item-r[data-id="dormentes-tratados"] [data-q="1"]'); await espera(200);
  await p.click('.gaveta .item-r[data-id="dormentes-tratados"] [data-q="1"]'); await espera(200);
  checa(await p.evaluate(() => document.querySelector('.gaveta .item-r[data-id="dormentes-tratados"] input').value === "3"), "quantidade sobe para 3");
  // enviar sem nome mostra erro
  await p.click(".gaveta [data-enviar-romaneio]"); await espera(300);
  checa(await p.evaluate(() => document.querySelector(".gaveta .erro").textContent.length > 10 && !window.__abertos.length), "enviar sem nome pede os dados");
  await p.type("#g-nome", "Teste da Silva"); await p.type("#g-cidade", "Ijuí/RS"); await p.type("#g-obs", "Entrega em novembro");
  await p.click(".gaveta [data-enviar-romaneio]"); await espera(400);
  const link = await p.evaluate(() => window.__abertos[0] || "");
  const msg = decodeURIComponent((link.split("text=")[1] || ""));
  checa(link.startsWith("https://wa.me/5555936197019"), "abre WhatsApp de vendas (55 93619-7019)");
  checa(msg.includes("Dormentes ferroviários tratados") && msg.includes("3 unidades") && msg.includes("Pergolados") && msg.includes("Ijuí/RS") && msg.includes("Teste da Silva"), "mensagem traz itens, quantidades, nome e cidade");
  await p.click('.gaveta .item-r[data-id="pergolados"] .remover'); await espera(300);
  checa(await p.evaluate(() => document.querySelector(".bt-romaneio .conta").textContent === "1"), "remover item atualiza o contador");
  await p.keyboard.press("Escape"); await espera(600);
  checa(await p.evaluate(() => !document.querySelector(".gaveta").classList.contains("aberta")), "Esc fecha a gaveta");
  // persiste entre páginas
  await p.goto(BASE + "orcamento.html", { waitUntil: "networkidle2" }); await espera(800);
  checa(await p.evaluate(() => document.querySelectorAll("main [data-itens-romaneio] .item-r").length === 1), "romaneio continua na página de orçamento");

  // 4. catálogo: filtros e busca
  console.log("Catálogo");
  await p.goto(BASE + "produtos.html", { waitUntil: "networkidle2" }); await espera(800);
  const total = await p.evaluate(() => document.querySelectorAll("[data-catalogo] .ticket:not([hidden])").length);
  await clicar(p, '[data-filtro="agro"]'); await espera(300);
  const agro = await p.evaluate(() => document.querySelectorAll("[data-catalogo] .ticket:not([hidden])").length);
  checa(total >= 36 && agro === 4, `filtro Agronegócio mostra 4 de ${total}`);
  checa(await p.evaluate(() => [...document.querySelectorAll(".grupo-cat")].filter(g => !g.hidden).length === 1), "filtro esconde as linhas sem produto");
  checa(await p.evaluate(() => document.querySelector("[data-vistas]").classList.contains("vista-lista")), "catálogo abre como romaneio (lista)");
  await p.evaluate(() => { if (window.LarssenLenis) window.LarssenLenis.scrollTo(0, { immediate: true }); }); await espera(500);
  await clicar(p, '[data-vista="grade"]'); await espera(300);
  checa(await p.evaluate(() => document.querySelector("[data-vistas]").classList.contains("vista-grade")), "botão Fotos troca para grade");
  await clicar(p, '[data-vista="lista"]'); await espera(300);
  await clicar(p, '[data-filtro="todos"]'); await espera(300);
  await p.click('[data-filtro="todos"]'); await p.type("[data-busca]", "eucalipto"); await espera(300);
  const euc = await p.evaluate(() => document.querySelectorAll("[data-catalogo] .ticket:not([hidden])").length);
  checa(euc > 5 && euc < total, `busca 'eucalipto' filtra (${euc})`);
  await p.evaluate(() => { const i = document.querySelector("[data-busca]"); i.value = "xyzabc"; i.dispatchEvent(new Event("input")); }); await espera(300);
  checa(await p.evaluate(() => !document.querySelector("[data-vazio]").hidden), "busca sem resultado mostra aviso com WhatsApp");
  await p.goto(BASE + "produtos.html#tratadas", { waitUntil: "networkidle2" }); await espera(800);
  checa(await p.evaluate(() => document.querySelector('[data-filtro="tratadas"]').getAttribute("aria-pressed") === "true"), "link com #tratadas já abre filtrado");

  // 5. contato
  console.log("Contato");
  await p.goto(BASE + "contato.html", { waitUntil: "networkidle2" }); await espera(800);
  await p.evaluate(() => { window.__abertos = []; });
  await p.click("[data-form-contato] button[type=submit]"); await espera(200);
  checa(await p.evaluate(() => document.querySelector("[data-form-contato] .erro").textContent.length > 5 && !window.__abertos.length), "formulário vazio mostra erro");
  await p.type("#c-nome", "Maria"); await p.type("#c-tel", "55 99999-0000"); await p.select("#c-emp", "Larssen Escavações"); await p.type("#c-msg", "Preciso romper uma laje.");
  await p.click("[data-form-contato] button[type=submit]"); await espera(300);
  const lc = decodeURIComponent((await p.evaluate(() => window.__abertos[0] || "")).split("text=")[1] || "");
  checa(lc.includes("Larssen Escavações") && lc.includes("romper uma laje") && lc.includes("Maria"), "contato vira mensagem de WhatsApp com assunto");
  checa(await p.evaluate(() => !!document.querySelector(".mapa-emb iframe[src*='maps.google']")), "mapa do endereço presente");
  await p.close();

  // 6. celular: menu, sem rolagem lateral em todas as páginas principais
  console.log("Celular");
  p = await nova(390, 844, true);
  for (const f of ["index.html", "florestal.html", "madeireira.html", "madeiras-tratadas.html", "transportes.html", "escavacoes.html", "produtos.html", "produto-tesouras.html", "processo.html", "sustentabilidade.html", "sobre.html", "contato.html", "orcamento.html"]) {
    await p.goto(BASE + f, { waitUntil: "networkidle2" }); await espera(f === "index.html" ? 4000 : 700);
    const larg = await p.evaluate(() => document.documentElement.scrollWidth);
    checa(larg <= 391, `${f} sem rolagem lateral no celular (${larg}px)`);
  }
  await p.goto(BASE + "sobre.html", { waitUntil: "networkidle2" }); await espera(700);
  await p.click(".bt-menu"); await espera(800);
  checa(await p.evaluate(() => document.querySelector(".menu-movel").classList.contains("aberto")), "menu do celular abre");
  await p.click(".menu-movel .fechar"); await espera(700);
  checa(await p.evaluate(() => !document.querySelector(".menu-movel").classList.contains("aberto")), "menu do celular fecha");
  await p.close();

  // 7. navegação com cortina leva à página certa
  console.log("Navegação");
  p = await nova();
  await p.goto(BASE + "sobre.html", { waitUntil: "networkidle2" }); await espera(600);
  await Promise.all([p.waitForNavigation({ waitUntil: "networkidle2" }), p.click('.rodape a[href="madeiras-tratadas.html"]')]);
  checa(p.url().endsWith("madeiras-tratadas.html"), "link do rodapé leva à Tratadas (com cortina)");
  await espera(1200);
  checa(await p.evaluate(() => !document.querySelector(".cortina").classList.contains("entra")), "cortina sai depois de carregar");
  checa(await p.evaluate(() => document.querySelectorAll("[data-autoclave] .estacao").length === 6), "página da Tratadas tem as 6 estações da autoclave");
  await p.close();

  checa(!erros.length, "nenhum erro de JavaScript ou arquivo faltando" + (erros.length ? ": " + [...new Set(erros)].slice(0, 6).join(" | ") : ""));
  await b.close();
  console.log(`\n${ok} ok, ${falhas.length} falha(s)` + (falhas.length ? ":\n- " + falhas.join("\n- ") : ""));
  process.exit(falhas.length ? 1 : 0);
})();
