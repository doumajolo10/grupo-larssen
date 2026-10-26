// Gera o site estático do Grupo Larssen a partir de build/dados.js.
// Uso: node build/build.js   (gera os .html na raiz do projeto)
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const { CONTATO, EMPRESAS, LINHAS, PRODUTOS, ETAPAS, AUTOCLAVE, ESTADOS } = require("./dados.js");
const IC = require("./icones.js");
const RAIZ = path.join(__dirname, "..");
const SITE = "https://grupolarssen.com.br";
// versão dos assets (cache): muda só quando o conteúdo muda, para a rotina do painel não regravar tudo à toa
const V = require("crypto").createHash("sha1").update(["assets/estilo.css", "assets/app.js", "assets/vivo.js", "assets/modelo-produtos.js", "build/orcamento.js", "fontes/fontes.css", "painel/painel.js", "painel/painel.css"].map(f => fs.readFileSync(path.join(RAIZ, f))).join("")).digest("hex").slice(0, 8);

// ---------- utilidades ----------
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const arred = t => t.replace(/-?\d+\.\d+/g, n => (+n).toFixed(1).replace(/\.0$/, ""));
const lerSvg = f => arred(fs.readFileSync(path.join(RAIZ, f), "utf8"));
const simbolo = (id, f) => { const t = lerSvg(f); const vb = t.match(/viewBox="([^"]+)"/)[1]; return { id, vb, corpo: t.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "") }; };
const SIMBOLOS = [simbolo("lg-grupo", "assets/logos/grupo.svg"), ...["florestal", "madeireira", "tratadas", "transportes", "escavacoes"].map(i => simbolo("ic-" + i, "assets/logos/icone-" + i + ".svg"))];
const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${SIMBOLOS.map(s => `<symbol id="${s.id}" viewBox="${s.vb}">${s.corpo}</symbol>`).join("")}</defs></svg>`;
const usar = id => { const s = SIMBOLOS.find(x => x.id === id); const [, , w, h] = s.vb.split(" "); return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false"><use href="#${id}"/></svg>`; };
const GRUPO = usar("lg-grupo");
const ICONE = id => usar("ic-" + id);
const emp = id => EMPRESAS.find(e => e.id === id);
const linha = id => LINHAS.find(l => l.id === id);
const base = f => f.replace(/\.(jpe?g|png)$/i, "");
// medidas das fotos: guardadas em build/dims.json (a rotina do painel no GitHub não tem ffprobe)
const DIMS_ARQ = path.join(__dirname, "dims.json");
const dims = fs.existsSync(DIMS_ARQ) ? JSON.parse(fs.readFileSync(DIMS_ARQ, "utf8")) : {};
for (const f of fs.readdirSync(path.join(RAIZ, "img/g")).filter(f => f.endsWith(".webp") && !dims[f.replace(".webp", "")])) {
  try { const o = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", path.join(RAIZ, "img/g", f)]).toString().trim().split(","); dims[f.replace(".webp", "")] = o.map(Number); } catch (e) {}
}
function img(foto, alt, { sizes = "100vw", cls = "", attrs = "", carregar = "lazy", prio = carregar === "eager" } = {}) {
  const b = base(foto), [w, h] = dims[b] || [1600, 1000];
  return `<img src="img/g/${b}.webp" srcset="img/m/${b}.webp 520w, img/p/${b}.webp 900w, img/g/${b}.webp ${w}w" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}" loading="${carregar}"${prio ? ' fetchpriority="high"' : ""} decoding="async"${cls ? ` class="${cls}"` : ""}${attrs ? " " + attrs : ""}>`;
}
const zap = (txt) => `https://wa.me/${CONTATO.whats}?text=${encodeURIComponent(txt)}`;
const paginaEmp = { florestal: "florestal.html", madeireira: "madeireira.html", tratadas: "madeiras-tratadas.html", transportes: "transportes.html", escavacoes: "escavacoes.html" };
const nomeCarimbo = { floresta: "Floresta", serraria: "Serrado", beneficiamento: "Aplainado", autoclave: "Autoclavado" };
// modelo dos produtos compartilhado com o navegador (o painel muda o cadastro e o site redesenha igual)
const SUPA = { url: "https://cwsjddppdogvyitspbfr.supabase.co", chave: "sb_publishable_zpNPLwlPqkOR6pnvrxRGHw_78r3siqN" };
const CTX = { LINHAS, EMPRESAS: EMPRESAS.map(e => ({ id: e.id, nome: e.nome, curto: e.curto })), IC: { mais: IC.mais, romaneio: IC.romaneio, zap: IC.zap }, paginaEmp, whats: CONTATO.whats };
const MOD = require("../assets/modelo-produtos.js")(Object.assign({ dims }, CTX));

// ---------- peças comuns ----------
function cabecalho(atual) {
  const saidas = EMPRESAS.map(e => `<a href="${paginaEmp[e.id]}">${ICONE(e.id)}<span>${esc(e.nome)}</span><small class="num">KM ${e.km}</small></a>`).join("");
  const nav = [["produtos.html", "Produtos"], ["processo.html", "Processo"], ["sustentabilidade.html", "Sustentabilidade"], ["sobre.html", "Sobre"], ["contato.html", "Contato"]]
    .map(([h, t]) => `<a href="${h}"${atual === h ? ' aria-current="page"' : ""}>${t}</a>`).join("");
  return `
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<header class="topo">
  <a class="marca" href="index.html" aria-label="Grupo Larssen, página inicial"><span class="placa">${GRUPO}</span></a>
  <nav class="nav" aria-label="Principal">
    <div class="sub"><button type="button" aria-expanded="false" aria-haspopup="true">Empresas ${IC.setaB}</button><div class="saidas placa">${saidas}</div></div>
    ${nav}
  </nav>
  <div class="acoes-topo">
    <button type="button" class="bt-romaneio" data-abre-romaneio aria-haspopup="dialog">${IC.romaneio}<span class="txt">Romaneio</span><span class="conta num" aria-label="itens no romaneio">0</span></button>
    <button type="button" class="bt-menu" data-abre-menu aria-expanded="false" aria-label="Abrir menu">${IC.menu}</button>
  </div>
</header>
<div class="menu-movel" role="dialog" aria-label="Menu">
  <button type="button" class="fechar" data-fecha-menu aria-label="Fechar menu">${IC.x}</button>
  <a href="index.html">Início</a><a href="produtos.html">Produtos</a><a href="processo.html">Processo</a><a href="sustentabilidade.html">Sustentabilidade</a><a href="sobre.html">Sobre</a><a href="contato.html">Contato</a>
  <hr>
  ${EMPRESAS.map(e => `<a class="saida-m" href="${paginaEmp[e.id]}">${ICONE(e.id)} ${esc(e.nome)}</a>`).join("")}
  <hr>
  <a class="saida-m" href="${zap("Olá, Grupo Larssen!")}" target="_blank" rel="noopener">${IC.zap} ${CONTATO.whatsTexto}</a>
</div>
<div class="trilho" aria-hidden="true"><div class="asfalto"></div><div class="faixa"></div><div class="feito"></div><div class="veiculo">${IC.caminhao}</div><div class="km"><span class="marco">KM<b class="num">0,0</b></span><small></small></div></div>
<div class="trilho-movel" aria-hidden="true"><i></i></div>`;
}
function gaveta() {
  return `
<div class="gaveta-fundo" data-fecha-romaneio></div>
<aside class="gaveta" role="dialog" aria-modal="true" aria-labelledby="titulo-romaneio" aria-hidden="true" inert>
  <header><div><h2 id="titulo-romaneio">Romaneio</h2><small>Sua lista de orçamento. Enviamos tudo de uma vez pelo WhatsApp.</small></div><button type="button" class="fechar" data-fecha-romaneio aria-label="Fechar romaneio">${IC.x}</button></header>
  <div class="itens" data-itens-romaneio></div>
  <footer>
    <form data-form-romaneio novalidate>
      <div class="dois"><div class="campo"><label for="g-nome">Seu nome</label><input id="g-nome" name="nome" autocomplete="name" required></div>
      <div class="campo"><label for="g-cidade">Cidade da entrega</label><input id="g-cidade" name="cidade" autocomplete="address-level2" required></div></div>
      <div class="campo" style="margin-top:10px"><label for="g-obs">Observações (medidas, prazo)</label><textarea id="g-obs" name="obs" rows="2"></textarea></div>
      <p class="erro" role="alert"></p>
      <button class="botao zap" type="submit" data-enviar-romaneio style="width:100%;justify-content:center">${IC.zap} Enviar romaneio no WhatsApp</button>
    </form>
  </footer>
</aside>
<div class="aviso-toast" role="status" aria-live="polite">${IC.check}<span></span></div>
<div class="lightbox" role="dialog" aria-label="Foto ampliada"><button type="button" class="fx" aria-label="Fechar">${IC.x}</button><button type="button" class="ant" aria-label="Foto anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 5l-7 7 7 7"/></svg></button><button type="button" class="prox" aria-label="Próxima foto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 5l7 7-7 7"/></svg></button></div>
<div class="cortina" aria-hidden="true">${GRUPO}</div>`;
}
function rodape() {
  return `
<footer class="rodape">
  <div class="miolo">
    <div class="grade-r">
      <div><div class="logo-r">${GRUPO}</div><p>Floresta, serraria, tratamento, transporte e obra: cinco empresas em uma rota só, em Três Passos/RS, desde 1970.</p></div>
      <div><h2 class="tit-r">Empresas</h2><ul>${EMPRESAS.map(e => `<li><a href="${paginaEmp[e.id]}">${ICONE(e.id)}${esc(e.nome)}</a></li>`).join("")}</ul></div>
      <div><h2 class="tit-r">Navegue</h2><ul><li><a href="produtos.html">Catálogo de produtos</a></li><li><a href="processo.html">Do talhão à entrega</a></li><li><a href="sustentabilidade.html">Sustentabilidade</a></li><li><a href="sobre.html">Sobre o grupo</a></li><li><a href="orcamento.html">Romaneio de orçamento</a></li><li><a href="contato.html">Contato</a></li></ul></div>
      <div><h2 class="tit-r">Fale com a gente</h2><ul>
        <li><a href="${zap("Olá, Grupo Larssen!")}" target="_blank" rel="noopener">${IC.zap}${CONTATO.whatsTexto}</a></li>
        <li><a href="mailto:${CONTATO.emails.madeireira}">${IC.email}${CONTATO.emails.madeireira}</a></li>
        <li><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Larssen Madeiras Tratadas, " + CONTATO.endereco + ", Três Passos, RS")}" target="_blank" rel="noopener">${IC.pino}Atendimento: ${CONTATO.endereco}, ${CONTATO.cidade}</a></li>
        <li><a href="${CONTATO.instagram.replace("madeireiralarssen", "grupolarssen")}" target="_blank" rel="noopener">${IC.insta}@grupolarssen</a></li>
        <li><a href="${CONTATO.facebook}" target="_blank" rel="noopener">${IC.face}/larssenmadeireira</a></li>
      </ul></div>
    </div>
    <div class="base"><span>© <span data-ano>2026</span> Grupo Larssen · Três Passos/RS · <a href="privacidade.html">Política de privacidade</a></span><span>Madeireira Larssen · Larssen Madeiras Tratadas · Larssen Florestal · Larssen Escavações · Log Larssen Transportes</span></div>
  </div>
  <div class="estrada-r" aria-hidden="true"></div>
</footer>`;
}
// dados estruturados para o Google: o grupo (com os nomes antigos das marcas), as 5 empresas, o site e a trilha da página
function dadosEstruturados(arquivo, titulo, imagem, home) {
  const endereco = { "@type": "PostalAddress", streetAddress: CONTATO.endereco, addressLocality: "Três Passos", addressRegion: "RS", postalCode: CONTATO.cep, addressCountry: "BR" };
  const grupo = {
    "@type": ["Organization", "LocalBusiness"], "@id": `${SITE}/#grupo`, name: "Grupo Larssen",
    alternateName: ["Madeireira Larssen", "Larssen Madeiras Tratadas", "Larssen Florestal", "Log Larssen Transportes", "Larssen Escavações"],
    description: "Floresta, serraria, madeira tratada em autoclave, transporte e escavação em Três Passos/RS, desde 1970.",
    url: `${SITE}/`, logo: `${SITE}/assets/logo-grupo-larssen.png`, image: imagem, telephone: "+55 55 3522-1635", email: CONTATO.emails.madeireira,
    address: endereco, areaServed: "BR", foundingDate: "1970", priceRange: "$$",
    sameAs: ["https://www.instagram.com/grupolarssen", CONTATO.facebook],
    subOrganization: EMPRESAS.map((e) => ({ "@type": "Organization", name: e.nome, url: `${SITE}/${paginaEmp[e.id]}`, parentOrganization: { "@id": `${SITE}/#grupo` } })),
  };
  const site = { "@type": "WebSite", "@id": `${SITE}/#site`, name: "Grupo Larssen", alternateName: ["Madeireira Larssen", "Larssen Madeiras Tratadas"], url: `${SITE}/`, inLanguage: "pt-BR", publisher: { "@id": `${SITE}/#grupo` } };
  const g = [grupo, site];
  if (!home) g.push({ "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Grupo Larssen", item: `${SITE}/` }, { "@type": "ListItem", position: 2, name: titulo.split(" · ")[0], item: `${SITE}/${arquivo}` }] });
  return JSON.stringify({ "@context": "https://schema.org", "@graph": g }).replace(/</g, "\\u003c");
}
function pagina({ arquivo, titulo, descricao, corpo, kmIni = 0, kmFim = 25, imagem = "madeireiralarssen_2019_08_aereas.jpg", home = false }) {
  const og = `${SITE}/img/g/${base(imagem)}.webp`;
  const html = `<!doctype html>
<html lang="pt-BR" data-whats="${CONTATO.whats}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descricao)}">
<meta name="theme-color" content="#54763A">
<link rel="canonical" href="${SITE}/${arquivo === "index.html" ? "" : arquivo}">
<meta property="og:type" content="website"><meta property="og:locale" content="pt_BR">
<meta property="og:title" content="${esc(titulo)}"><meta property="og:description" content="${esc(descricao)}"><meta property="og:image" content="${og}">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="fontes/BarlowCondensed-800-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fontes/Barlow-400-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fontes/BarlowCondensed-700-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fontes/Barlow-600-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="fontes/fontes.css?v=${V}">
<link rel="stylesheet" href="assets/estilo.css?v=${V}">
<script type="application/ld+json">${dadosEstruturados(arquivo, titulo, og, home)}</script>
</head>
<body data-km-ini="${kmIni}" data-km-fim="${kmFim}">
${SPRITE}
${cabecalho(arquivo)}
<main id="conteudo">
${corpo}
</main>
${rodape()}
${gaveta()}
<script src="assets/vendor/gsap-3.12.5.min.js" defer></script>
<script src="assets/vendor/ScrollTrigger-3.12.5.min.js" defer></script>
<script src="assets/vendor/lenis-1.1.13.min.js" defer></script>
<script src="assets/dados-site.js?v=${V}" defer></script>
<script src="assets/modelo-produtos.js?v=${V}" defer></script>
<script src="assets/vivo.js?v=${V}" defer></script>
<script src="assets/orcamento.js?v=${V}" defer></script>
<script src="assets/app.js?v=${V}" defer></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(RAIZ, arquivo), html);
  return arquivo;
}

// ---------- componentes ----------
const ticket = (p, o) => MOD.ticket(p, o);
function destaquesHome(prods) {
  const marcados = prods.filter(p => p.destaque > 0).sort((a, b) => a.destaque - b.destaque);
  if (marcados.length) return marcados.slice(0, 8);
  return ["dormentes-tratados", "pergolados", "decks", "assoalhos", "mouroes", "maravalha-aviario", "tesouras", "cavaco"].map(id => prods.find(p => p.id === id)).filter(Boolean);
}
const botaoAdd = (p, rotulo) => MOD.botaoAdd(p, rotulo);
function listaServicos(serv) {
  return `<ul class="lista-servicos">${serv.map(([t, d]) => `<li>${IC.check}<span><b>${esc(t)}.</b> ${esc(d)}</span></li>`).join("")}</ul>`;
}
function chamadaFinal(titulo = "Monte seu romaneio e receba o orçamento no WhatsApp.") {
  return `<section class="chamada bloco"><div class="miolo"><h2>${titulo}</h2><div class="acoes"><a class="botao" href="produtos.html">${IC.romaneio} Abrir o catálogo</a><a class="botao zap" href="${zap("Olá, Grupo Larssen! Quero um orçamento.")}" target="_blank" rel="noopener">${IC.zap} Falar agora</a></div></div></section>`;
}

// ---------- catálogo agrupado (romaneio) ----------
const catalogo = (prods, o) => MOD.catalogo(prods, o);

// ---------- mapa do Brasil (IBGE) ----------
function mapaBrasil() {
  const geo = JSON.parse(fs.readFileSync(path.join(RAIZ, "pesquisa/br-uf.json"), "utf8"));
  const ufs = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(RAIZ, "pesquisa/ufs.json"), "utf8")).map(u => [String(u.id), u.sigla]));
  const lon0 = -74.2, lon1 = -28.6, lat0 = 5.4, lat1 = -33.9, W = 600, H = Math.round(W * (lat0 - lat1) / (lon1 - lon0) * 1.05);
  const pr = ([lo, la]) => [((lo - lon0) / (lon1 - lon0) * W).toFixed(1), ((lat0 - la) / (lat0 - lat1) * H).toFixed(1)];
  const centro = {};
  const paths = geo.features.map(f => {
    const sig = ufs[f.properties.codarea]; const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    let sx = 0, sy = 0, n = 0;
    const d = polys.map(poly => poly.map(anel => anel.map((c, i) => { const [x, y] = pr(c); sx += +x; sy += +y; n++; return (i ? "L" : "M") + x + " " + y; }).join("") + "Z").join("")).join("");
    centro[sig] = [sx / n, sy / n];
    return `<path class="uf${ESTADOS.includes(sig) ? " atende" : ""}" d="${d}"><title>${sig}</title></path>`;
  }).join("");
  // origem: Três Passos
  const [ox, oy] = pr([-53.93, -27.45]).map(Number);
  const ajuste = { RS: [6, -18], SC: [10, -6], RJ: [6, 4] };
  const rotas = ESTADOS.filter(s => s !== "RS").map(s => { const [cx, cy] = centro[s]; const mx = (ox + cx) / 2 - (cy - oy) * 0.18, my = (oy + cy) / 2 - (cx - ox) * 0.18 - 14; return `<path class="rota" d="M${ox} ${oy}Q${mx.toFixed(1)} ${my.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)}"/>`; }).join("");
  const rotulos = ESTADOS.map(s => { const [cx, cy] = centro[s], a = ajuste[s] || [0, 0]; return `<text x="${(cx + a[0]).toFixed(1)}" y="${(cy + a[1] + 4).toFixed(1)}" text-anchor="middle">${s}</text>`; }).join("");
  return `<svg class="mapa-br" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mapa do Brasil com os estados atendidos: ${ESTADOS.join(", ")}">${paths}${rotas}<circle class="origem-anel" cx="${ox}" cy="${oy}" r="9"/><circle class="origem" cx="${ox}" cy="${oy}" r="5"/>${rotulos}</svg>`;
}

// ---------- autoclave (desenho) ----------
function desenhoAutoclave() {
  const pecas = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) pecas.push(`<rect class="pecaA" x="${92 + c * 38}" y="${118 + r * 26}" width="32" height="20" rx="2"/>`);
  return `<svg viewBox="0 0 640 360" role="img" aria-label="Corte da autoclave mostrando a etapa atual do tratamento">
  <defs><clipPath id="camara"><rect x="70" y="90" width="380" height="150" rx="75"/></clipPath></defs>
  <rect x="70" y="90" width="380" height="150" rx="75" fill="#2f4a22" stroke="#fff" stroke-width="3"/>
  <g clip-path="url(#camara)">
    <rect id="nivel-cca" x="60" y="90" width="400" height="150" fill="#9fd1b4" opacity=".55" style="transform-box:fill-box;transform-origin:bottom;transform:scaleY(0);transition:transform 1.1s cubic-bezier(.22,1,.36,1)"/>
    <g style="transition:fill .8s">${pecas.join("")}</g>
    <g id="bolhas" style="transition:opacity .5s;opacity:0" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round">${[110, 190, 270, 350, 420].map(x => `<path d="M${x} 228v-110M${x - 7} 126l7-8 7 8"/>`).join("")}</g>
  </g>
  <path d="M60 165h-30M450 165h40" stroke="#fff" stroke-width="3"/>
  ${[120, 200, 280, 360].map(x => `<path d="M${x} 90v150" stroke="rgba(255,255,255,.35)" stroke-width="2"/>`).join("")}
  <rect x="490" y="120" width="70" height="150" rx="10" fill="none" stroke="#fff" stroke-width="3"/>
  <rect x="496" y="180" width="58" height="84" rx="6" fill="#9fd1b4" opacity=".55"/>
  <text x="525" y="298" text-anchor="middle" fill="#fff" font-family="Barlow Condensed" font-weight="700" font-size="16">TANQUE CCA</text>
  <g id="seta-tanque" style="transition:opacity .4s;opacity:0" transform=""><path d="M478 150h-22l8-8M456 150l8 8" stroke="#f2b705" stroke-width="4" fill="none" stroke-linecap="round"/></g>
  <circle cx="250" cy="50" r="34" fill="#fff"/><circle cx="250" cy="50" r="28" fill="none" stroke="#2f4a22" stroke-width="2" stroke-dasharray="3 5"/>
  <path d="M232 70a26 26 0 0 1 36 0" stroke="#c0392b" stroke-width="3" fill="none"/>
  <line id="ponteiro" x1="250" y1="50" x2="250" y2="26" stroke="#1b211d" stroke-width="4" stroke-linecap="round" style="transform-box:view-box;transform-origin:250px 50px;transition:transform 1.1s cubic-bezier(.22,1,.36,1)"/>
  <circle cx="250" cy="50" r="5" fill="#1b211d"/>
  <path d="M250 84v6" stroke="#fff" stroke-width="3"/>
  <text id="rotulo-est" x="70" y="290" fill="#fff" font-family="Barlow Condensed" font-weight="800" font-size="26">1 · Carga</text>
  <text x="70" y="318" fill="rgba(255,255,255,.8)" font-family="Barlow" font-size="16">Corte da autoclave: madeira, solução de CCA e manômetro</text>
</svg>`;
}

// ================= PÁGINAS =================
const paginas = [];

// ----- HOME -----
{
  const caps = [
    { p: 0, km: 0, id: "florestal", t: "Larssen Florestal", d: "Talhões de pinus e eucalipto plantados e colhidos com harvester." },
    { p: 0.3, km: 2, id: "madeireira", t: "Madeireira Larssen", d: "A tora vira madeira serrada e beneficiada: 100 m³ por dia." },
    { p: 0.5, km: 9, id: "tratadas", t: "Madeiras Tratadas", d: "A autoclave injeta CCA sob pressão e a madeira dura mais de dez vezes mais." },
    { p: 0.72, km: 21, id: "transportes", t: "Log Larssen Transportes", d: "Frota própria pega a estrada para todo o Brasil." },
    { p: 0.9, km: 25, id: "escavacoes", t: "Larssen Escavações", d: "Na obra, escavadeira e rompedor preparam o terreno." },
  ];
  const saidasPlaca = EMPRESAS.map(e => `<a href="${paginaEmp[e.id]}" data-id="${e.id}">${ICONE(e.id)}<span>${esc(e.curto === "Madeiras Tratadas" ? "Tratadas" : e.curto)}</span><span class="k">KM ${e.km}</span></a>`).join("");
  const pinos = EMPRESAS.map(e => `<a class="pino" href="${paginaEmp[e.id]}" data-id="${e.id}" aria-label="${esc(e.nome)}, km ${e.km}"><span class="marco">KM<b>${e.km}</b><span>${esc(e.curto)}</span></span><i></i></a>`).join("");
  const frase = [["Desde"], ["1970", 1], ["a"], ["Larssen"], ["juntou"], ["500 hectares", 1], ["de"], ["floresta"], ["plantada,"], ["uma"], ["serraria"], ["de"], ["100 m³", 1], ["por"], ["dia,"], ["autoclave,"], ["frota"], ["própria"], ["e"], ["máquinas"], ["de"], ["obra."], ["Tudo"], ["na"], ["mesma"], ["estrada."]]
    .map(([t, d]) => `<span class="p on${d ? " dado" : ""}">${t}</span>`).join(" ");
  const paradas = ETAPAS.map(et => {
    const e = et.empresa ? emp(et.empresa) : null;
    return `<article class="parada"><div class="foto">${img(et.foto, et.nome, { sizes: "(min-width:760px) 34vw, 92vw" })}<span class="marco">KM<b class="num">${et.km}</b></span></div><h3>${esc(et.nome)}</h3><p>${esc(et.texto)}</p>${e ? `<a class="link-seta" href="${paginaEmp[e.id]}">${esc(e.nome)} ${IC.seta}</a>` : ""}</article>`;
  }).join("");
  const saidas = EMPRESAS.map((e, i) => {
    const [f1, f2] = e.fotos;
    const marca = e.logo ? `<img class="logo-emp" src="${e.logo}" alt="${esc(e.nome)}" width="280" height="70">` : `<div class="nome-emp"><span class="ic" style="background:${e.cor}">${ICONE(e.id)}</span><span><b>${esc(e.nome)}</b><small>Empresa do Grupo Larssen</small></span></div>`;
    const lista = e.servicos ? listaServicos(e.servicos.slice(0, 4)) : `<ul class="lista-servicos">${e.linhas.map(l => `<li>${IC.check}<span><b>${esc(linha(l).nome)}.</b> ${esc(linha(l).texto.split(".")[0])}.</span></li>`).join("")}</ul>`;
    return `<div class="saida" data-saida="${esc(e.curto)}" id="${e.id}">
      <div class="colagem">
        <div class="placa placa-saida">${ICONE(e.id)}<span>Saída · KM ${e.km}<b>${esc(e.curto)}</b></span></div>
        <div class="f1 mascara">${img(f1, e.nome, { sizes: "(min-width:900px) 46vw, 92vw", attrs: 'data-parallax="10"' })}</div>
        <div class="f2 mascara">${img(f2, e.nome, { sizes: "(min-width:900px) 24vw, 46vw", attrs: 'data-parallax="14"' })}</div>
      </div>
      <div class="revela">${marca}<h3>${esc(e.frase)}</h3><p>${esc(e.texto)}</p>${lista}<a class="botao verde" href="${paginaEmp[e.id]}">Conhecer a ${esc(e.curto === "Madeiras Tratadas" ? "Tratadas" : e.curto)} ${IC.seta}</a></div>
    </div>`;
  }).join("");
  const destaque = destaquesHome(PRODUTOS).map(p => ticket(p)).join("");
  const corpo = `
<section class="bloco abertura" data-saida="Desde 1970">
  <div class="miolo frase-grade">
    <div>
    <h1 class="titulo-abertura">Da floresta à entrega.</h1>
    <p class="frase-grande">${frase}</p>
    <div class="dados-linha revela">
      <div><b class="num">1970</b><span>início da serraria</span></div>
      <div><b class="num" data-conta="500">500</b><span>hectares reflorestados</span></div>
      <div><b class="num" data-conta="47000" data-suf=" m²">47.000 m²</b><span>de parque industrial</span></div>
      <div><b class="num" data-conta="5">5</b><span>empresas no grupo</span></div>
    </div>
    <div class="acoes-abertura"><a class="botao" href="produtos.html">${IC.romaneio} Montar orçamento</a><a class="botao zap" href="${zap("Olá, Grupo Larssen! Quero falar com um vendedor.")}" target="_blank" rel="noopener">${IC.zap} WhatsApp</a></div>
    </div>
    <div class="frase-foto">${img("madeireiralarssen_2019_08_aereas.jpg", "Vista aérea do parque industrial da Larssen em Três Passos", { sizes: "(min-width:900px) 40vw, 92vw", attrs: 'data-parallax="12"', carregar: "eager" })}<span class="marco">KM<b>2</b></span></div>
  </div>
</section>

<section class="rota-h" data-rota-h data-saida="A rota">
  <div class="miolo cabeca-r"><div class="cabeca com-marco"><span class="marco">KM<b>0–25</b></span><div><h2>A rota da madeira, quilômetro por quilômetro.</h2><p class="lead">Cada etapa acontece dentro do grupo. Por isso a gente responde pelo produto do plantio até a sua obra.</p></div></div></div>
  <div class="janela"><div class="pista">${paradas}</div></div>
  <div class="estrada-h" aria-hidden="true"><span class="caminhao-h">${IC.caminhaoLado}</span></div>
</section>

<section class="bloco" aria-labelledby="t-empresas">
  <div class="miolo">
    <div class="cabeca com-marco"><span class="marco">KM<b>5</b></span><div><h2 id="t-empresas">Cinco empresas, cinco saídas da mesma estrada.</h2><p class="lead">Escolha por onde entrar: cada empresa tem página própria, com serviços, fotos e contato direto.</p></div></div>
    ${saidas}
  </div>
</section>

<section class="autoclave bloco" data-autoclave data-saida="Autoclave">
  <div class="miolo">
    <div class="cabeca com-marco"><span class="marco">KM<b>9</b></span><div><h2>Seis estações dentro da autoclave.</h2><p class="lead">Ciclos alternados de vácuo e pressão levam o preservativo CCA tipo C até o miolo da madeira. Role e acompanhe uma carga.</p></div></div>
    <div class="auto-grade">
      <div class="auto-palco">${desenhoAutoclave()}</div>
      <div class="estacoes">${AUTOCLAVE.map(([t, d], i) => `<div class="estacao${i === 0 ? " on" : ""}"><span class="n">${i + 1}</span><h3>${t}</h3><p>${d}</p></div>`).join("")}</div>
    </div>
    <div class="cca"><div><b>C</b><span>Cromo fixa os ingredientes nas fibras.</span></div><div><b>C</b><span>Cobre combate os fungos apodrecedores.</span></div><div><b>A</b><span>Arsênio protege contra cupim e broca.</span></div></div>
    <p style="margin-top:30px"><a class="botao" href="processo.html">Ver o processo completo ${IC.seta}</a></p>
  </div>
</section>

<section class="bloco" aria-labelledby="t-cat" data-saida="Produtos">
  <div class="miolo">
    <div class="cabeca com-marco"><span class="marco">KM<b>2–11</b></span><div><h2 id="t-cat">Do dormente à maravalha, em bitolas de verdade.</h2><p class="lead">Cada produto mostra medidas, espécie e as etapas por onde passou. Junte os que precisa no romaneio e mande tudo de uma vez.</p></div></div>
    <div class="grade-romaneio" data-vivo="destaques">${destaque}</div>
    <p style="margin-top:36px"><a class="botao verde" href="produtos.html"><span>Ver os <span data-n-produtos>${PRODUTOS.length}</span> produtos</span> ${IC.seta}</a></p>
  </div>
</section>

<section class="mapa-sec bloco" data-saida="Entregas">
  <div class="miolo mapa-grade">
    <div class="revela"><h2>Sai de Três Passos para o Brasil inteiro.</h2><p class="lead" style="margin-top:20px">Atendemos todos os estados, principalmente Rio Grande do Sul, Santa Catarina, Paraná, Mato Grosso do Sul, Mato Grosso, São Paulo, Minas Gerais e Rio de Janeiro.</p><ul class="ufs">${ESTADOS.map(s => `<li>${s}</li>`).join("")}</ul></div>
    <div data-mapa>${mapaBrasil()}</div>
  </div>
</section>

<section class="faixa-foto" data-saida="Floresta">
  ${img("larssenmadeirastratadas_2020_01_sustentabilidade.jpg", "Floresta plantada com luz do sol entre as árvores", { attrs: 'data-parallax="12"' })}
  <div class="miolo">
    <h2>Para cada árvore colhida, a floresta continua.</h2>
    <p>Cerca de 500 hectares reflorestados, só para extração, e mata nativa preservada.</p>
    <div class="tres"><div><b>Florestamento</b><span>Plantio de mudas em áreas que não tinham floresta há pelo menos 50 anos.</span></div><div><b>Reflorestamento</b><span>Replantio de pinus e eucalipto de qualidade, só para extração.</span></div><div><b>Nativas</b><span>Conservação de espécies nativas e regeneração de áreas.</span></div></div>
    <p style="margin-top:28px"><a class="botao branco" href="sustentabilidade.html">Sustentabilidade ${IC.seta}</a></p>
  </div>
</section>
${chamadaFinal()}`;
  paginas.push(pagina({ arquivo: "index.html", titulo: "Grupo Larssen · Da floresta à entrega · Três Passos/RS", descricao: "Floresta, serraria, madeira tratada em autoclave, transporte e escavações. Cinco empresas do Grupo Larssen em Três Passos/RS, desde 1970.", corpo }));
}

// ----- EMPRESAS -----
for (const e of EMPRESAS) {
  const marca = e.logo ? `<span class="logo-capa"><img src="${e.logo}" alt="${esc(e.nome)}" width="280" height="70"></span>` : "";
  const nums = e.numeros ? `<div class="numeros revela">${e.numeros.map(([n, t]) => `<div><b class="num">${esc(n)}</b><span>${esc(t)}</span></div>`).join("")}</div>` : "";
  const prods = PRODUTOS.filter(p => linha(p.linha).empresa === e.id);
  const linhasBloco = e.linhas ? `<section class="bloco" style="background:var(--concreto)" data-saida="Produtos"><div class="miolo"><div class="cabeca"><h2>Linhas de produto</h2><p class="lead"><span data-n-empresa="${e.id}">${prods.length}</span> produtos com bitolas e espécies. Adicione ao romaneio e peça o orçamento.</p></div><div data-vivo="empresa" data-empresa="${e.id}">${catalogo(prods)}</div></div></section>` : "";
  const servBloco = e.servicos ? `<section class="bloco" data-saida="Serviços"><div class="miolo grade-2"><div class="revela"><h2>O que a ${esc(e.curto === "Transportes" ? "Log Larssen" : e.curto)} faz</h2><p class="lead" style="margin-top:18px">${esc(e.frase)}</p><p style="margin-top:22px"><a class="botao zap" href="${zap(`Olá! Quero um orçamento com a ${e.nome}.`)}" target="_blank" rel="noopener">${IC.zap} Pedir orçamento</a></p></div><div class="revela">${listaServicos(e.servicos)}</div></div></section>` : "";
  const auto = e.id === "tratadas" ? `<section class="autoclave bloco" data-autoclave data-saida="Autoclave"><div class="miolo"><div class="cabeca"><h2>Como a autoclave trata a madeira</h2><p class="lead">Vácuo, pressão e CCA tipo C: a solução preservativa entra até a saturação das fibras.</p></div><div class="auto-grade"><div class="auto-palco">${desenhoAutoclave()}</div><div class="estacoes">${AUTOCLAVE.map(([t, d], i) => `<div class="estacao${i === 0 ? " on" : ""}"><span class="n">${i + 1}</span><h3>${t}</h3><p>${d}</p></div>`).join("")}</div></div><div class="cca"><div><b>C</b><span>Cromo fixa os ingredientes nas fibras.</span></div><div><b>C</b><span>Cobre combate os fungos apodrecedores.</span></div><div><b>A</b><span>Arsênio protege contra cupim e broca.</span></div></div></div></section>` : "";
  const galeria = `<section class="bloco" data-saida="Fotos"><div class="miolo"><div class="cabeca"><h2>Fotos</h2></div><div class="galeria">${e.fotos.map(f => `<a href="img/g/${base(f)}.webp" class="mascara">${img(f, e.nome, { sizes: "(min-width:700px) 58vw, 92vw" })}</a>`).join("")}</div></div></section>`;
  const outras = EMPRESAS.filter(x => x.id !== e.id);
  const corpo = `
<section class="capa" data-saida="${esc(e.curto)}">
  ${img(e.foto, e.nome, { carregar: "eager", attrs: 'data-parallax="10"' })}
  <div class="miolo">
    <div class="placa placa-cab">${ICONE(e.id)}<span>Saída · KM ${e.km}</span></div><br>
    ${marca}
    <h1>${esc(e.nome)}</h1>
    <p>${esc(e.frase)}</p>
  </div>
</section>
<section class="bloco"><div class="miolo grade-2"><div class="revela"><h2>${e.desde ? `Desde ${e.desde}.` : "Parte da rota."}</h2></div><div class="revela"><p class="lead">${esc(e.texto)}</p>${nums}</div></div></section>
${servBloco}${auto}${linhasBloco}${galeria}
<section class="bloco" style="background:var(--concreto)"><div class="miolo"><div class="cabeca"><h2>Outras saídas da rota</h2></div><div class="grade-romaneio">${outras.map(o => `<a class="ticket revela" href="${paginaEmp[o.id]}" style="text-decoration:none"><div class="foto">${img(o.foto, o.nome, { sizes: "(min-width:1100px) 300px, 45vw" })}<span class="marco" style="position:absolute;left:12px;top:12px">KM<b>${o.km}</b></span></div><div class="serrilha" aria-hidden="true"></div><div class="corpo"><h3>${esc(o.nome)}</h3><p class="uso">${esc(o.frase)}</p><span class="link-seta" style="margin-top:auto">Ir para ${esc(o.curto)} ${IC.seta}</span></div></a>`).join("")}</div></div></section>
${chamadaFinal(e.servicos && !e.linhas ? `Fale com a ${esc(e.curto === "Transportes" ? "Log Larssen" : "Larssen " + e.curto)} pelo WhatsApp.` : undefined)}`;
  paginas.push(pagina({ arquivo: paginaEmp[e.id], titulo: `${e.nome} · Grupo Larssen`, descricao: `${e.frase} ${e.texto}`.slice(0, 158), corpo, kmIni: e.km, kmFim: e.km + 1, imagem: e.foto }));
}

// ----- CATÁLOGO -----
{
  const chips = [["todos", "Todos"], ...LINHAS.map(l => [l.id, l.nome])].map(([id, t], i) => `<button type="button" class="chip" data-filtro="${id}" aria-pressed="${i === 0}">${esc(t)}</button>`).join("");
  const corpo = `
<section class="capa clara"><div class="miolo"><nav class="migalhas" aria-label="Você está em"><a href="index.html">Grupo Larssen</a><span>/</span><span>Produtos</span></nav><h1>Catálogo de produtos</h1><p><span data-n-produtos>${PRODUTOS.length}</span> produtos da Madeireira Larssen e da Larssen Madeiras Tratadas, com bitolas, espécies e etapas. Adicione ao romaneio e peça o orçamento de uma vez.</p></div></section>
<section class="bloco" style="padding-top:20px" data-catalogo data-saida="Catálogo">
  <div class="miolo">
    <div class="filtros"><div class="linha">${chips}<label class="busca">${IC.busca}<span class="sr">Buscar produto</span><input type="search" data-busca placeholder="Buscar: dormente, deck, eucalipto…"></label></div></div>
    <p class="contagem" data-contagem aria-live="polite">${PRODUTOS.length} produtos</p>
    <div data-vivo="catalogo">${catalogo(PRODUTOS)}</div>
    <div class="vazio" data-vazio hidden><p><b>Nenhum produto com esse nome.</b> Tente outra palavra ou fale direto com a gente: fazemos cortes especiais sob medida.</p><a class="botao zap" href="${zap("Olá! Procuro um produto que não achei no catálogo.")}" target="_blank" rel="noopener">${IC.zap} Perguntar no WhatsApp</a></div>
  </div>
</section>
${chamadaFinal()}`;
  paginas.push(pagina({ arquivo: "produtos.html", titulo: "Catálogo de produtos · Grupo Larssen", descricao: "Madeira bruta, beneficiada, tratada em autoclave, casas de madeira, maravalha, cavaco e peças montadas, com bitolas e espécies.", corpo, kmIni: 2, kmFim: 9 }));
}

// ----- FICHAS DE PRODUTO -----
for (const p of PRODUTOS) {
  const l = linha(p.linha), e = emp(l.empresa);
  const corpo = MOD.ficha(p, PRODUTOS);
  paginas.push(pagina({ arquivo: `produto-${p.id}.html`, titulo: `${p.nome} · ${l.nome} · Grupo Larssen`, descricao: `${p.nome}: ${p.uso}. ${p.madeira}. ${p.bitolas.join("; ")}.`.slice(0, 158), corpo, kmIni: 2, kmFim: 9, imagem: p.foto }));
}

// molde para produto cadastrado no painel antes da próxima atualização das páginas (o vivo.js preenche)
paginas.push(pagina({ arquivo: "produto.html", titulo: "Produto · Grupo Larssen", descricao: "Ficha de produto do Grupo Larssen.", kmIni: 2, kmFim: 9, corpo: `<div class="ficha-produto" data-ficha="" data-molde><section class="capa clara" style="min-height:60vh"><div class="miolo"><nav class="migalhas" aria-label="Você está em"><a href="index.html">Grupo Larssen</a><span>/</span><a href="produtos.html">Produtos</a></nav><h1>Carregando o produto…</h1><p data-molde-msg>Um instante.</p></div></section></div>` }));

// ----- PROCESSO -----
{
  const corpo = `
<section class="capa">${img("madeireiralarssen_2019_08_aereas.jpg", "Vista aérea do parque industrial", { carregar: "eager", attrs: 'data-parallax="10"' })}<div class="miolo"><nav class="migalhas" aria-label="Você está em"><a href="index.html">Grupo Larssen</a><span>/</span><span>Processo</span></nav><h1>Do talhão à entrega.</h1><p>Sete etapas, cinco empresas, uma estrada. Veja o que acontece com a madeira em cada quilômetro.</p></div></section>
<section class="bloco"><div class="miolo">${ETAPAS.map((et, i) => { const e = et.empresa ? emp(et.empresa) : null; return `<div class="saida" data-saida="${esc(et.nome)}"><div class="colagem" style="aspect-ratio:16/11"><div class="placa placa-saida">${e ? ICONE(e.id) : ""}<span>KM ${et.km}<b>${esc(et.nome)}</b></span></div><div class="f1 mascara" style="inset:0">${img(et.foto, et.nome, { sizes: "(min-width:900px) 46vw, 92vw", attrs: 'data-parallax="10"' })}</div></div><div class="revela"><h2 style="font-size:clamp(2rem,4vw,3.2rem);margin-bottom:16px">${esc(et.nome)}</h2><p class="lead">${esc(et.texto)}</p>${e ? `<a class="link-seta" href="${paginaEmp[e.id]}">${esc(e.nome)} ${IC.seta}</a>` : ""}</div></div>`; }).join("")}</div></section>
<section class="autoclave bloco" data-autoclave data-saida="Autoclave"><div class="miolo"><div class="cabeca"><h2>Seis estações dentro da autoclave.</h2><p class="lead">Após o preparo e a secagem, a madeira passa por ciclos de vácuo e pressão até a completa saturação das fibras com CCA tipo C.</p></div><div class="auto-grade"><div class="auto-palco">${desenhoAutoclave()}</div><div class="estacoes">${AUTOCLAVE.map(([t, d], i) => `<div class="estacao${i === 0 ? " on" : ""}"><span class="n">${i + 1}</span><h3>${t}</h3><p>${d}</p></div>`).join("")}</div></div><div class="cca"><div><b>C</b><span>Cromo: fixador. Prende os ingredientes ativos nas fibras de forma insolúvel.</span></div><div><b>C</b><span>Cobre: fungicida. Retarda a ação dos fungos apodrecedores.</span></div><div><b>A</b><span>Arsênio: inseticida. Imuniza contra insetos xilófagos, como cupim e broca.</span></div></div></div></section>
<section class="bloco"><div class="miolo grade-2"><div class="revela"><h2>Por que tratar a madeira?</h2></div><div class="revela">${listaServicos([["Contra fungos e insetos", "Previne o ataque de agentes biológicos, cupins e brocas."], ["Contra o tempo", "Mais resistência ao sol, à chuva e à umidade."], ["Direto no solo", "A madeira pode ficar em contato direto com a terra."], ["Acabamento que dura", "Vernizes e stains duram mais sobre a madeira tratada."]])}<p style="margin-top:12px">O resultado são produtos ambientalmente adequados, com qualidade, durabilidade e segurança: a solução preservativa aumenta a durabilidade da madeira em mais de dez vezes.</p></div></div></section>
${chamadaFinal()}`;
  paginas.push(pagina({ arquivo: "processo.html", titulo: "Processo: do talhão à entrega · Grupo Larssen", descricao: "Floresta, serraria, beneficiamento, autoclave com CCA tipo C, subprodutos, transporte e obra: a rota da madeira no Grupo Larssen.", corpo }));
}

// ----- SUSTENTABILIDADE -----
{
  const corpo = `
<section class="capa">${img("larssenmadeirastratadas_2020_02_reflorestamento.jpg", "Área de reflorestamento", { carregar: "eager", attrs: 'data-parallax="10"' })}<div class="miolo"><nav class="migalhas" aria-label="Você está em"><a href="index.html">Grupo Larssen</a><span>/</span><span>Sustentabilidade</span></nav><h1>Madeira que volta a crescer.</h1><p>Produtividade e consumo consciente de madeira e seus subprodutos, respeitando a legislação e em harmonia com o meio ambiente.</p></div></section>
<section class="bloco" data-saida="Compromisso"><div class="miolo grade-2"><div class="revela"><h2>Três pilares: social, ambiental e econômico.</h2></div><div class="revela"><p class="lead">O compromisso começa nas boas práticas do manejo florestal. Quando é reflorestada, a madeira é mais correta do ponto de vista ambiental do que qualquer outra matéria-prima da construção civil.</p><div class="numeros"><div><b class="num" data-conta="500" data-suf=" ha">500 ha</b><span>de reflorestamento só para extração</span></div><div><b class="num">10x</b><span>mais vida útil com o tratamento</span></div><div><b class="num">100%</b><span>da biomassa reaproveitada como produto</span></div></div></div></div></section>
<section class="faixa-foto">${img("madeireiralarssen_2019_08_responsabilidade.jpg", "Floresta plantada", { attrs: 'data-parallax="12"' })}<div class="miolo"><h2>Florestamento, reflorestamento e nativas.</h2><div class="tres"><div><b>Florestamento</b><span>Implantação de florestas com mudas em áreas que não eram florestadas há pelo menos 50 anos.</span></div><div><b>Reflorestamento</b><span>Replantio de espécies de qualidade, como pinus e eucalipto, só para fins de extração.</span></div><div><b>Preservação de nativas</b><span>Conservação de plantas do ecossistema, com benefícios para a biodiversidade.</span></div></div></div></section>
<section class="bloco" data-saida="Subprodutos"><div class="miolo"><div class="cabeca"><h2>Nada se perde na serraria.</h2><p class="lead">O que sobra do corte vira produto: maravalha e serragem para a pecuária, cavaco para gerar energia limpa nas caldeiras.</p></div><div class="grade-romaneio">${["maravalha-aviario", "compost-barn", "cama-cavalos", "cavaco"].map(id => ticket(PRODUTOS.find(p => p.id === id))).join("")}</div></div></section>
${chamadaFinal()}`;
  paginas.push(pagina({ arquivo: "sustentabilidade.html", titulo: "Sustentabilidade · Grupo Larssen", descricao: "Cerca de 500 hectares de reflorestamento, preservação de nativas e reaproveitamento total dos subprodutos da madeira.", corpo, kmIni: 0, kmFim: 2, imagem: "larssenmadeirastratadas_2020_02_reflorestamento.jpg" }));
}

// ----- SOBRE -----
{
  const marcos = [
    ["1970", "A serraria", "Começa a Madeireira Larssen, que hoje ocupa 47.000 m² no Distrito Industrial de Três Passos."],
    ["2010", "O tratamento", "Nasce a Larssen Madeiras Tratadas, com autoclave para pinus e eucalipto."],
    ["2023", "A estrada", "A Log Larssen Transportes passa a cuidar das cargas do grupo e de terceiros."],
    ["2025", "55 anos", "O grupo completa 55 anos construindo histórias, com floresta, serraria, tratamento, transporte e escavações."],
  ];
  const corpo = `
<section class="capa">${img("madeireiralarssen_2019_08_empresa3.jpg", "Parque industrial da Madeireira Larssen", { carregar: "eager", attrs: 'data-parallax="10"' })}<div class="miolo"><nav class="migalhas" aria-label="Você está em"><a href="index.html">Grupo Larssen</a><span>/</span><span>Sobre</span></nav><h1>Desde 1970 na mesma estrada.</h1><p>Um grupo familiar de Três Passos/RS que cresceu acompanhando a madeira: do plantio à obra.</p></div></section>
<section class="bloco" data-saida="História"><div class="miolo grade-2"><div class="revela"><h2>Linha do tempo</h2><p class="lead" style="margin-top:18px">A Larssen Florestal e a Larssen Escavações completam a rota: uma começa antes da serraria, a outra termina na obra.</p></div><div class="tempo revela">${marcos.map(([a, t, d]) => `<div class="marco-t"><span class="ano num">${a}</span><div><h3>${t}</h3><p>${d}</p></div></div>`).join("")}</div></div></section>
<section class="bloco" style="background:var(--concreto)" data-saida="Números"><div class="miolo"><div class="cabeca"><h2>Estrutura</h2><p class="lead">Ao longo dos anos o grupo ajustou processos e estrutura para cobrir todas as fases da produção e da logística.</p></div><div class="numeros revela"><div><b class="num" data-conta="47000" data-suf=" m²">47.000 m²</b><span>de área total</span></div><div><b class="num" data-conta="11000" data-suf=" m²">11.000 m²</b><span>de área coberta</span></div><div><b class="num" data-conta="100" data-suf=" m³">100 m³</b><span>de produção por dia</span></div><div><b class="num" data-conta="50">50</b><span>colaboradores na madeireira</span></div><div><b class="num" data-conta="500" data-suf=" ha">500 ha</b><span>de reflorestamento</span></div></div></div></section>
<section class="bloco" data-saida="Missão"><div class="miolo"><div class="grade-2"><div class="revela"><h3 style="font-size:32px;margin-bottom:12px">Missão</h3><p>Oferecer produtos e serviços com qualidade e segurança, com responsabilidade social e ambiental, atendendo com excelência aos nossos clientes.</p><h3 style="font-size:32px;margin:28px 0 12px">Visão</h3><p>Ser referência no setor da transformação de madeiras, fornecendo produtos de alta qualidade, com ética, transparência e competência, buscando aprimoramento contínuo junto das certificações ambientais.</p></div><div class="revela"><h3 style="font-size:32px;margin-bottom:12px">Valores</h3>${listaServicos([["Clientes", "Atenção às solicitações e necessidades de clientes e consumidores."], ["Fábrica", "Busca pela excelência nos produtos."], ["Marca", "Desenvolvimento constante do negócio e valorização da marca."], ["Pessoas", "Saúde e segurança dos colaboradores, transparência nas relações, desenvolvimento pessoal e profissional, criatividade e participação de todos."], ["Parceiros", "Trabalho junto a Ibama, Prefeitura e Sindicato, atendendo todas as normas."]])}</div></div></div></section>
<section class="bloco" style="padding-top:0"><div class="miolo"><div class="galeria">${["madeireiralarssen_2019_08_aereas.jpg", "madeireiralarssen_2019_08_galpao.jpg", "larssenmadeirastratadas_2020_01_madelarssen_04.jpg", "madeireiralarssen_2020_10_estrutura.jpg"].map(f => `<a href="img/g/${base(f)}.webp" class="mascara">${img(f, "Estrutura do Grupo Larssen", { sizes: "(min-width:700px) 58vw, 92vw" })}</a>`).join("")}</div></div></section>
${chamadaFinal()}`;
  paginas.push(pagina({ arquivo: "sobre.html", titulo: "Sobre o Grupo Larssen · Desde 1970 · Três Passos/RS", descricao: "História, estrutura, missão, visão e valores do Grupo Larssen: madeira em Três Passos/RS desde 1970.", corpo, imagem: "madeireiralarssen_2019_08_empresa3.jpg" }));
}

// ----- CONTATO -----
{
  const mapaQ = encodeURIComponent("Larssen Madeiras Tratadas, Rua Renato José Oppermann, 210, Três Passos - RS, 98600-000");
  const corpo = `
<section class="capa clara"><div class="miolo"><nav class="migalhas" aria-label="Você está em"><a href="index.html">Grupo Larssen</a><span>/</span><span>Contato</span></nav><h1>Fale com o Grupo Larssen.</h1><p>Um número para as cinco empresas. Escreva o que precisa e a mensagem chega no WhatsApp do grupo.</p></div></section>
<section class="bloco" style="padding-top:40px" data-saida="Contato"><div class="miolo contato-grade">
  <div>
    <div class="canais">
      <a class="canal" href="${zap("Olá, Grupo Larssen!")}" target="_blank" rel="noopener"><span class="ic">${IC.zap}</span><span><b>WhatsApp de vendas</b><span>${CONTATO.whatsTexto}</span></span></a>
      <a class="canal" href="${CONTATO.telLink}"><span class="ic">${IC.tel}</span><span><b>Ligar</b><span>${CONTATO.telefone}</span></span></a>
      <a class="canal" href="mailto:${CONTATO.emails.madeireira}"><span class="ic">${IC.email}</span><span><b>E-mail</b><span>${CONTATO.emails.madeireira}</span></span></a>
      <a class="canal" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Larssen Madeiras Tratadas, " + CONTATO.endereco + ", Três Passos, RS")}" target="_blank" rel="noopener"><span class="ic">${IC.pino}</span><span><b>Atendimento: ${CONTATO.localAtendimento}</b><span>${CONTATO.endereco}, ${CONTATO.bairro}, CEP ${CONTATO.cep}, ${CONTATO.cidade}</span></span></a>
      <a class="canal" href="https://www.instagram.com/grupolarssen" target="_blank" rel="noopener"><span class="ic">${IC.insta}</span><span><b>Instagram</b><span>@grupolarssen</span></span></a>
    </div>
  </div>
  <div>
    <form class="form-c" data-form-contato novalidate>
      <h2 style="font-size:36px">Mande sua mensagem</h2>
      <div class="dois"><div class="campo"><label for="c-nome">Nome</label><input id="c-nome" name="nome" autocomplete="name" required></div><div class="campo"><label for="c-tel">Telefone</label><input id="c-tel" name="telefone" type="tel" autocomplete="tel" inputmode="tel" required></div></div>
      <div class="campo"><label for="c-emp">Assunto</label><select id="c-emp" name="empresa"><option value="">Escolha a empresa</option>${EMPRESAS.map(e => `<option>${esc(e.nome)}</option>`).join("")}<option>Outro assunto</option></select></div>
      <div class="campo"><label for="c-msg">Mensagem</label><textarea id="c-msg" name="mensagem" rows="4" required placeholder="Ex.: preciso de 40 mourões tratados para entrega em Ijuí."></textarea></div>
      <p class="erro" role="alert"></p>
      <button class="botao zap" type="submit" style="justify-content:center">${IC.zap} Enviar no WhatsApp</button>
      <p class="nota-lgpd">A mensagem abre no seu WhatsApp, pronta para enviar. Nenhum dado fica guardado neste site. <a href="privacidade.html">Política de privacidade</a></p>
    </form>
    <div class="mapa-emb"><iframe title="Mapa: ${CONTATO.endereco}, Três Passos/RS" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${mapaQ}&z=15&output=embed"></iframe></div>
  </div>
</div></section>`;
  paginas.push(pagina({ arquivo: "contato.html", titulo: "Contato · Grupo Larssen · Três Passos/RS", descricao: `WhatsApp ${CONTATO.whatsTexto}, telefone ${CONTATO.telefone}, e-mail e endereço do Grupo Larssen em Três Passos/RS.`, corpo }));
}

// ----- ROMANEIO (página) -----
{
  const corpo = `
<section class="capa clara"><div class="miolo"><nav class="migalhas" aria-label="Você está em"><a href="index.html">Grupo Larssen</a><span>/</span><span>Romaneio</span></nav><h1>Seu romaneio de orçamento.</h1><p>Confira os itens, ajuste as quantidades e envie. Um vendedor responde com preço e frete.</p></div></section>
<section class="bloco" style="padding-top:40px" data-saida="Romaneio"><div class="miolo contato-grade">
  <div class="ticket" style="align-self:start"><div class="corpo" style="padding-top:12px"><div data-itens-romaneio></div></div></div>
  <form class="form-c" data-form-romaneio novalidate>
    <h2 style="font-size:36px">Para quem é o orçamento?</h2>
    <div class="campo"><label for="r-nome">Seu nome</label><input id="r-nome" name="nome" autocomplete="name" required></div>
    <div class="campo"><label for="r-cidade">Cidade da entrega</label><input id="r-cidade" name="cidade" autocomplete="address-level2" required></div>
    <div class="campo"><label for="r-obs">Observações</label><textarea id="r-obs" name="obs" rows="4" placeholder="Medidas, quantidade em m³ ou peças, prazo…"></textarea></div>
    <p class="erro" role="alert"></p>
    <button class="botao zap" type="submit" data-enviar-romaneio style="justify-content:center">${IC.zap} Enviar no WhatsApp</button>
    <p class="nota-lgpd">O pedido abre no seu WhatsApp, pronto para enviar. A lista fica só no seu navegador. <a href="privacidade.html">Política de privacidade</a></p>
    <a class="link-seta" href="produtos.html">Adicionar mais produtos ${IC.seta}</a>
  </form>
</div></section>`;
  paginas.push(pagina({ arquivo: "orcamento.html", titulo: "Romaneio de orçamento · Grupo Larssen", descricao: "Junte os produtos do Grupo Larssen e envie o pedido de orçamento pelo WhatsApp.", corpo }));
}

// ----- PRIVACIDADE -----
paginas.push(pagina({ arquivo: "privacidade.html", titulo: "Política de privacidade · Grupo Larssen", descricao: "Como o site do Grupo Larssen trata os seus dados, conforme a LGPD: sem cadastro, sem rastreamento e com mensagens que abrem no seu WhatsApp.", corpo: require("./privacidade.js")({ CONTATO, esc }) }));

// ----- 404 -----
paginas.push(pagina({ arquivo: "404.html", titulo: "Página não encontrada · Grupo Larssen", descricao: "Essa página saiu da rota. Volte ao início do site do Grupo Larssen ou procure no catálogo de produtos.", corpo: `<section class="capa clara" style="min-height:80vh"><div class="miolo"><span class="marco" style="margin-bottom:24px">KM<b>404</b></span><h1>Essa estrada não existe.</h1><p>O endereço pode ter mudado. Volte para a rota principal ou procure no catálogo.</p><p style="display:flex;gap:12px;flex-wrap:wrap;margin-top:20px"><a class="botao" href="index.html">Voltar ao início</a><a class="botao linha" href="produtos.html">Ver produtos</a></p></div></section>` }));

// ---------- painel de produtos (/painel) ----------
{
  const lg = SIMBOLOS.find(x => x.id === "lg-grupo");
  fs.writeFileSync(path.join(RAIZ, "painel/index.html"), `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Painel de produtos · Grupo Larssen</title>
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#FFFFFF">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fontes/Barlow-400-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fontes/BarlowCondensed-800-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/fontes/fontes.css?v=${V}">
<link rel="stylesheet" href="/painel/painel.css?v=${V}">
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><symbol id="lg-grupo" viewBox="${lg.vb}">${lg.corpo}</symbol></defs></svg>
<div id="app"><div class="carregando-tela" role="status" aria-label="Carregando o painel"></div></div>
<div class="avisos" id="avisos" role="status" aria-live="polite"></div>
<noscript><p style="padding:24px">O painel precisa do JavaScript ligado no navegador.</p></noscript>
<script src="/painel/painel.js?v=${V}"></script>
</body>
</html>
`);
}

// ---------- extras ----------
// o catálogo ao vivo só liga depois que o banco do painel existe (build/puxa.js conseguiu baixar a lista)
const PAINEL_ATIVO = fs.existsSync(path.join(__dirname, "produtos.json"));
fs.writeFileSync(path.join(RAIZ, "assets/dados-site.js"), "/* gerado por build/build.js */\nwindow.LARSSEN_CTX = " + JSON.stringify(Object.assign({ supa: SUPA, painelAtivo: PAINEL_ATIVO, estaticos: PRODUTOS.map(p => p.id) }, CTX)) + ";\n");
fs.copyFileSync(path.join(__dirname, "orcamento.js"), path.join(RAIZ, "assets/orcamento.js"));
{ const t = fs.readFileSync(path.join(RAIZ, "assets/logos/icone-madeireira.svg"), "utf8"); const [x, y, w, h] = t.match(/viewBox="([^"]+)"/)[1].split(" ").map(Number); const m = Math.max(w, h) * 0.28, L = Math.max(w, h) + m * 2; const d = arred(t.match(/ d="([^"]+)"/)[1]); fs.writeFileSync(path.join(RAIZ, "assets/favicon.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${(x + w / 2 - L / 2).toFixed(1)} ${(y + h / 2 - L / 2).toFixed(1)} ${L.toFixed(1)} ${L.toFixed(1)}"><rect x="${(x + w / 2 - L / 2).toFixed(1)}" y="${(y + h / 2 - L / 2).toFixed(1)}" width="${L.toFixed(1)}" height="${L.toFixed(1)}" rx="${(L * 0.2).toFixed(1)}" fill="#54763A"/><path fill="#fff" fill-rule="evenodd" d="${d}"/></svg>`); }
fs.writeFileSync(path.join(RAIZ, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paginas.filter(p => !["404.html", "produto.html"].includes(p)).map(p => `<url><loc>${SITE}/${p === "index.html" ? "" : p}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod><priority>${p === "index.html" ? "1.0" : /^produto-/.test(p) ? "0.6" : "0.8"}</priority></url>`).join("")}</urlset>\n`);
fs.writeFileSync(path.join(RAIZ, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /painel\nSitemap: ${SITE}/sitemap.xml\n`);
fs.writeFileSync(DIMS_ARQ, JSON.stringify(dims));
console.log("páginas geradas:", paginas.length);
