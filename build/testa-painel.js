// Painel de produtos do Grupo Larssen + site lendo o painel, com Supabase de mentira. Uso: node build/testa-painel.js [url]
const puppeteer = require("C:/Users/Douglas/Desktop/CLAUDE/majex-produtos/node_modules/puppeteer-core");
const path = require("path");
const falso = require("./supabase-falso.js");
const CAT = require("../painel/catalogo.json");
const B = process.argv[2] || "http://localhost:4040";
const EQ = "equipe@larssen.test", SENHA = "senha-teste-1", FORA = "visitante@larssen.test";
let falhas = 0; const ok = (c, m) => { if (c) console.log("  ok  " + m); else { falhas++; console.log("  FALHA " + m); } };
const espera = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--no-sandbox"] });
  const erros = [];
  const F = falso({ produtos: CAT.produtos, equipe: [EQ], usuarios: { [EQ]: SENHA, [FORA]: SENHA } });
  async function pagina(vp) {
    const ctx = await b.createBrowserContext(); const p = await ctx.newPage(); await p.setViewport(vp || { width: 1366, height: 860 });
    await p.setRequestInterception(true); p.on("request", async r => { if (await F.trata(r)) return; r.continue(); });
    await p.evaluateOnNewDocument(() => { window.LARSSEN_FORCA_VIVO = true; }); // simula o banco do painel já criado
    p.on("pageerror", e => erros.push(e.message)); p.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) erros.push(m.text()); });
    p.on("dialog", d => { erros.push("diálogo nativo: " + d.message()); d.dismiss(); });
    return p;
  }
  const clica = (p, s) => p.$eval(s, e => e.click());
  const entra = async (p, email) => { await p.goto(B + "/painel", { waitUntil: "networkidle2" }); await p.type("#e-email", email); await p.type("#e-senha", SENHA); await clica(p, "#b-entrar"); };

  console.log("== painel: acesso");
  const x = await pagina(); await entra(x, FORA); await x.waitForSelector("#b-sair", { timeout: 8000 }).catch(() => { });
  ok(/Acesso ainda não liberado/.test(await x.evaluate(() => document.body.innerText)), "e-mail fora da equipe vê 'Acesso ainda não liberado'");
  await x.goto(B + "/painel", { waitUntil: "networkidle2" }); await x.evaluate(() => localStorage.clear());
  await x.goto(B + "/painel", { waitUntil: "networkidle2" }); await x.type("#e-email", EQ); await x.type("#e-senha", "errada-123"); await clica(x, "#b-entrar"); await espera(600);
  ok(/incorretos/.test(await x.$eval("#f-entrar .msg", e => e.textContent).catch(() => "")), "senha errada mostra 'E-mail ou senha incorretos'");
  await x.close();

  console.log("== painel: entrar e listar");
  const p = await pagina(); await entra(p, EQ);
  await p.waitForSelector(".cartao", { timeout: 10000 });
  ok((await p.$$eval(".cartao", l => l.length)) === CAT.produtos.length, `lista os ${CAT.produtos.length} produtos`);
  await p.type("#l-busca", "eucalipto"); await espera(150);
  const nB = await p.$$eval(".cartao", l => l.length); ok(nB > 0 && nB < CAT.produtos.length, "busca por 'eucalipto' filtra (" + nB + ")");
  await p.$eval("#l-busca", e => { e.value = ""; e.dispatchEvent(new Event("input", { bubbles: true })); });
  await p.select("#l-linha", "tratadas"); await espera(150);
  ok((await p.$$eval(".cartao", l => l.length)) === CAT.produtos.filter(x => x.linha === "tratadas").length, "filtro por linha (tratadas)");
  await p.select("#l-linha", "");

  console.log("== painel: editar produto");
  await p.goto(B + "/painel#editar/mouroes", { waitUntil: "networkidle2" }); await p.waitForSelector("#f-ed");
  await p.$eval("#c-nome", e => { e.value = "Mourões de eucalipto"; e.dispatchEvent(new Event("input", { bubbles: true })); });
  await clica(p, "#b-bitola"); await p.keyboard.type("0,14 a 0,16 × 2,50 m");
  await clica(p, '#etapas [data-etapa="autoclave"]');
  await p.$eval("#c-desc", e => { e.value = "Peças selecionadas, retas e sem rachaduras."; e.dispatchEvent(new Event("input", { bubbles: true })); });
  ok(/Mourões de eucalipto/.test(await p.$eval("#previa", e => e.textContent)), "prévia mostra o nome novo");
  await clica(p, "#b-salvar"); await p.waitForSelector(".cartao", { timeout: 8000 }); await espera(300);
  const m = F.db.produtos.find(x => x.id === "mouroes");
  ok(m.nome === "Mourões de eucalipto", "nome gravado");
  ok(m.bitolas.includes("0,14 a 0,16 × 2,50 m"), "bitola nova gravada");
  ok(m.carimbos.includes("autoclave"), "etapa marcada gravada");
  ok(F.db.log.some(l => l.metodo === "PATCH" && /id=eq.mouroes/.test(l.q) && l.quem === EQ), "PATCH feito pelo usuário da equipe");

  console.log("== painel: produto novo com foto");
  await p.goto(B + "/painel#novo", { waitUntil: "networkidle2" }); await p.waitForSelector("#c-nome");
  await p.type("#c-nome", "Palanques teste");
  ok((await p.$eval("#c-id", e => e.value)) === "palanques-teste", "código montado pelo nome");
  await p.select("#c-linha", "tratadas");
  await p.type("#c-uso", "Cercas de divisa"); await p.type("#c-madeira", "Eucalipto tratado");
  await p.$eval("#bitolas [data-bit]", e => { e.value = "0,12 × 2,20 m"; e.dispatchEvent(new Event("input", { bubbles: true })); });
  await clica(p, '#etapas [data-etapa="floresta"]');
  const arq = await p.$("#arq"); await arq.uploadFile(path.join(__dirname, "..", "img", "p", "madeireiralarssen_2019_08_dormentes.webp"));
  await p.waitForFunction(() => !document.querySelector("#foto-prev .progresso"), { timeout: 15000 });
  await clica(p, "#b-salvar"); await p.waitForSelector(".cartao", { timeout: 8000 }); await espera(300);
  const nv = F.db.produtos.find(x => x.id === "palanques-teste");
  ok(!!nv && /\/larssen-fotos\/palanques-teste\/.+-g\.webp$/.test(nv.foto || ""), "produto novo criado com a foto enviada");
  ok(Object.keys(F.db.arquivos).filter(k => k.startsWith("palanques-teste/")).length === 2, "foto em 2 tamanhos no armazenamento");

  console.log("== painel: ocultar e destacar");
  await p.$eval('.cartao[data-id="cavaco"] [data-vis-toggle]', e => e.click()); await espera(500);
  ok(F.db.produtos.find(x => x.id === "cavaco").ativo === false, "ocultar grava ativo=false");
  await p.$eval('.barra .seg button[data-vis="todos"]', e => e.click()); await espera(200);
  const antesDest = F.db.produtos.filter(x => x.destaque > 0).length;
  await p.$eval('.cartao[data-id="decks"] [data-dest-toggle]', e => e.click()); await espera(500);
  ok(F.db.produtos.find(x => x.id === "decks").destaque === 0 && F.db.produtos.filter(x => x.destaque > 0).length === antesDest - 1, "tirar dos destaques grava destaque=0");
  await p.$eval('.cartao[data-id="palanques-teste"] [data-dest-toggle]', e => e.click()); await espera(500);
  ok(F.db.produtos.find(x => x.id === "palanques-teste").destaque > 0, "colocar em destaque grava a posição");

  console.log("== site: lê o painel");
  const s = await pagina();
  await s.goto(B + "/produtos.html?fresco=1", { waitUntil: "networkidle2" }); await espera(1500);
  ok((await s.evaluate(() => document.documentElement.dataset.catalogoVivo)) === "ok", "catálogo carregou os dados do painel");
  ok(!(await s.$('[data-vivo=catalogo] .ticket[data-id="cavaco"]')), "produto oculto saiu do catálogo");
  ok(!!(await s.$('[data-vivo=catalogo] .ticket[data-id="palanques-teste"]')), "produto novo apareceu no catálogo");
  ok(await s.$eval('.ticket[data-id="palanques-teste"] img', i => /larssen-fotos/.test(i.src)), "produto novo usa a foto do painel");
  ok(/Mourões de eucalipto/.test(await s.$eval('.ticket[data-id="mouroes"] h3', e => e.textContent)), "nome editado aparece no catálogo");
  ok((await s.$eval("[data-n-produtos]", e => e.textContent)) === String(CAT.produtos.length), "contagem de produtos atualizada (" + CAT.produtos.length + ")");
  // filtros do catálogo continuam funcionando depois do redesenho
  await s.$eval('[data-filtro="tratadas"]', e => e.click()); await espera(400);
  const visiveis = await s.$$eval("[data-vivo=catalogo] .ticket", l => l.filter(t => t.offsetParent !== null).map(t => t.dataset.linha));
  ok(visiveis.length > 0 && visiveis.every(x => x === "tratadas"), "filtro por linha funciona no catálogo redesenhado");
  await s.$eval('.ticket[data-id="palanques-teste"] [data-add]', e => e.click()); await espera(300);
  ok(await s.evaluate(() => window.Orcamento && Orcamento.ler().some(x => x.id === "palanques-teste")), "botão Romaneio do produto novo funciona");

  await s.goto(B + "/produto-palanques-teste.html?fresco=1", { waitUntil: "networkidle2" }); await espera(1500);
  ok((await s.$eval("h1", e => e.textContent)) === "Palanques teste", "página do produto novo abre (molde) antes do build");
  ok(/0,12 × 2,20 m/.test(await s.$eval(".tabela-bitolas", e => e.textContent)), "ficha do produto novo mostra a bitola");
  await s.goto(B + "/produto-mouroes.html?fresco=1", { waitUntil: "networkidle2" }); await espera(1500);
  ok((await s.$eval("h1", e => e.textContent)) === "Mourões de eucalipto", "ficha estática mostra o nome editado");
  ok(/sem rachaduras/.test(await s.$eval(".descricao-prod", e => e.textContent).catch(() => "")), "descrição nova aparece na ficha");
  await s.goto(B + "/produto-cavaco.html?fresco=1", { waitUntil: "networkidle2" }); await espera(1500);
  ok(/saiu do catálogo/.test(await s.$eval("h1", e => e.textContent)), "ficha de produto oculto avisa que saiu do catálogo");
  await s.goto(B + "/?fresco=1", { waitUntil: "networkidle2" }); await espera(1500);
  const dest = await s.$$eval("[data-vivo=destaques] .ticket", l => l.map(t => t.dataset.id));
  ok(dest.includes("palanques-teste") && !dest.includes("decks"), "destaques da página inicial seguem o painel");

  console.log("== painel: modo demonstração");
  const d = await pagina(); await d.goto(B + "/painel?demo", { waitUntil: "networkidle2" });
  await d.type("#e-email", "x@x.x"); await d.type("#e-senha", "qualquer1"); await clica(d, "#b-entrar"); await d.waitForSelector(".cartao", { timeout: 8000 });
  ok((await d.$$eval(".cartao", l => l.length)) === CAT.produtos.length, "demonstração lista os produtos sem banco");
  ok(!!(await d.$(".demo-faixa")), "faixa de demonstração aparece");

  console.log("== celular");
  const c = await pagina({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }); await entra(c, EQ); await c.waitForSelector(".cartao");
  ok((await c.evaluate(() => document.documentElement.scrollWidth)) <= 390, "lista do painel sem rolagem lateral no celular");
  await c.goto(B + "/painel#editar/dormentes", { waitUntil: "networkidle2" }); await c.waitForSelector("#f-ed");
  ok((await c.evaluate(() => document.documentElement.scrollWidth)) <= 390, "editor sem rolagem lateral no celular");

  console.log("erros:", erros.length ? erros.slice(0, 6) : 0);
  ok(!erros.length, "sem erros de JavaScript nem diálogos nativos");
  await b.close(); console.log(falhas ? "FALHAS: " + falhas : "TUDO PASSOU"); process.exit(falhas ? 1 : 0);
})().catch(e => { console.error("ERRO", e); process.exit(2); });
