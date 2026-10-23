/* Grupo Larssen — modelos dos produtos (cartão do romaneio, catálogo agrupado e ficha do produto).
   Usado pelo build/build.js (páginas estáticas) e pelo navegador (assets/vivo.js), para que o que a equipe muda no painel
   apareça no site na hora com exatamente o mesmo visual. */
(function (raiz) {
  "use strict";
  var ETAPAS = ["floresta", "serraria", "beneficiamento", "autoclave"];
  var NOME_CARIMBO = { floresta: "Floresta", serraria: "Serrado", beneficiamento: "Aplainado", autoclave: "Autoclavado" };
  var KM_LINHA = { bruta: 2, beneficiada: 5, tratadas: 9, casas: 5, agro: 11, industria: 11, montadas: 5 };
  var GRADE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/></svg>';

  function cria(ctx) {
    var LINHAS = ctx.LINHAS, EMPRESAS = ctx.EMPRESAS, IC = ctx.IC, paginaEmp = ctx.paginaEmp, dims = ctx.dims || {};
    var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var emp = function (id) { return EMPRESAS.find(function (e) { return e.id === id; }) || EMPRESAS[0]; };
    var linha = function (id) { return LINHAS.find(function (l) { return l.id === id; }) || LINHAS[0]; };
    var zap = function (txt) { return "https://wa.me/" + ctx.whats + "?text=" + encodeURIComponent(txt); };
    var base = function (f) { return String(f || "").replace(/\.(jpe?g|png|webp)$/i, ""); };
    var ehUrl = function (f) { return /^https?:\/\//.test(f || ""); };

    // foto do site (img/m · p · g) ou foto enviada pelo painel (…-g.webp, com a miniatura …-p.webp ao lado)
    function img(foto, alt, o) {
      o = o || {};
      var sizes = o.sizes || "100vw", carregar = o.carregar || "lazy", prio = o.prio === undefined ? carregar === "eager" : o.prio;
      var fim = ' sizes="' + sizes + '" alt="' + esc(alt) + '" loading="' + carregar + '"' + (prio ? ' fetchpriority="high"' : "") + ' decoding="async"' + (o.cls ? ' class="' + o.cls + '"' : "") + (o.attrs ? " " + o.attrs : "") + ">";
      if (!foto) return '<img src="assets/sem-foto.svg" width="1600" height="1000"' + fim;
      if (ehUrl(foto)) { var p = foto.replace(/-g\.(webp|jpg)$/, "-p.$1"); return '<img src="' + esc(foto) + '" srcset="' + esc(p) + ' 600w, ' + esc(foto) + ' 1600w" width="1600" height="1000"' + fim; }
      var b = base(foto), d = dims[b] || [1600, 1000];
      return '<img src="img/g/' + b + '.webp" srcset="img/m/' + b + '.webp 520w, img/p/' + b + '.webp 900w, img/g/' + b + '.webp ' + d[0] + 'w" width="' + d[0] + '" height="' + d[1] + '"' + fim;
    }
    function botaoAdd(p, rotulo) {
      rotulo = rotulo || "Romaneio";
      var e = emp(linha(p.linha).empresa);
      return '<button type="button" class="bt-add" data-add="' + esc(p.id) + '" data-nome="' + esc(p.nome) + '" data-empresa="' + esc(e.nome) + '" data-rotulo="' + rotulo + '">' + IC.mais + '<span class="t">' + rotulo + "</span></button>";
    }
    function carimbos(p) { return p.carimbos.map(function (c) { return '<span class="carimbo c-' + c + '">' + (NOME_CARIMBO[c] || c) + "</span>"; }).join(""); }
    function ticket(p, o) {
      o = o || {};
      var l = linha(p.linha), e = emp(l.empresa);
      return '<article class="ticket revela" data-id="' + esc(p.id) + '" data-linha="' + esc(p.linha) + '" data-empresa-id="' + e.id + '">\n' +
        '  <div class="foto">' + img(p.foto, p.nome, { sizes: "(min-width:1100px) 380px, (min-width:700px) 45vw, 92vw", carregar: o.carregar || "lazy", prio: false }) + "</div>\n" +
        '  <div class="serrilha" aria-hidden="true"></div>\n' +
        '  <div class="corpo">\n' +
        '    <h3><a href="produto-' + esc(p.id) + '.html">' + esc(p.nome) + "</a></h3>\n" +
        '    <p class="uso">' + esc(p.uso) + "</p>\n" +
        '    <ul class="bitolas">' + p.bitolas.slice(0, 3).map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul>\n" +
        '    <div class="carimbos" aria-label="Etapas por onde passa">' + carimbos(p) + "</div>\n" +
        '    <div class="pe"><span class="madeira">' + esc(p.madeira) + "<small>" + esc(l.nome) + " · " + esc(e.curto) + "</small></span>" + botaoAdd(p) + "</div>\n" +
        "  </div>\n</article>";
    }
    function catalogo(prods, o) {
      o = o || {};
      var comVistas = o.comVistas !== false, ancora = o.ancora || "";
      var grupos = LINHAS.filter(function (l) { return prods.some(function (p) { return p.linha === l.id; }); });
      var vistas = comVistas ? '<div class="vistas" role="group" aria-label="Ver catálogo como"><button type="button" data-vista="lista" aria-pressed="true">' + IC.romaneio + ' Romaneio</button><button type="button" data-vista="grade" aria-pressed="false">' + GRADE + " Fotos</button></div>" : "";
      var i = 0;
      return vistas + '<div class="catalogo vista-lista" data-vistas>' + grupos.map(function (l) {
        var lista = prods.filter(function (p) { return p.linha === l.id; });
        return '<section class="grupo-cat" data-grupo="' + l.id + '"' + (ancora ? ' id="' + ancora + "-" + l.id + '"' : "") + ">\n" +
          '      <header class="cab-grupo"><span class="marco">KM<b>' + (KM_LINHA[l.id] != null ? KM_LINHA[l.id] : "") + "</b></span><div><h2>" + esc(l.nome) + "</h2><p>" + esc(l.texto) + '</p></div><span class="qtd-grupo">' + lista.length + " " + (lista.length === 1 ? "item" : "itens") + "</span></header>\n" +
          '      <div class="grade-romaneio">' + lista.map(function (p) { return ticket(p, { carregar: i++ < 4 ? "eager" : "lazy" }); }).join("") + "</div>\n" +
          "    </section>";
      }).join("") + "</div>";
    }
    // conteúdo da ficha (o miolo de produto-ID.html); `todos` serve para "Da mesma linha"
    function ficha(p, todos) {
      var l = linha(p.linha), e = emp(l.empresa);
      var rel = todos.filter(function (x) { return x.linha === p.linha && x.id !== p.id; }).slice(0, 3);
      var extras = (p.fotos || []).filter(Boolean);
      return '<div class="ficha-produto" data-ficha="' + esc(p.id) + '">\n' +
        '<section class="capa clara" style="min-height:0;padding-bottom:0"><div class="miolo" style="padding-bottom:30px"><nav class="migalhas" aria-label="Você está em"><a href="index.html">Grupo Larssen</a><span>/</span><a href="produtos.html">Produtos</a><span>/</span><a href="produtos.html#' + l.id + '">' + esc(l.nome) + "</a></nav><h1>" + esc(p.nome) + "</h1></div></section>\n" +
        '<section class="bloco" style="padding-top:30px" data-saida="Ficha">\n' +
        '  <div class="miolo ficha">\n' +
        "    <div>\n" +
        '      <div class="foto-g">' + img(p.foto, p.nome, { carregar: "eager", sizes: "(min-width:860px) 56vw, 92vw" }) + "</div>\n" +
        (extras.length ? '      <div class="fotos-extras">' + extras.map(function (f) { return '<a href="' + esc(ehUrl(f) ? f : "img/g/" + base(f) + ".webp") + '" target="_blank" rel="noopener">' + img(f, p.nome, { sizes: "160px" }) + "</a>"; }).join("") + "</div>\n" : "") +
        '      <div class="mini-rota" aria-label="Etapas por onde o produto passa">' + ETAPAS.map(function (s) { return '<span class="' + (p.carimbos.indexOf(s) >= 0 ? "on" : "") + '">' + NOME_CARIMBO[s] + "</span>"; }).join("") + "</div>\n" +
        (p.descricao ? '      <p class="lead descricao-prod" style="margin-top:26px">' + esc(p.descricao).replace(/\n+/g, "<br>") + "</p>\n" : "") +
        '      <p class="lead" style="margin-top:' + (p.descricao ? 14 : 26) + 'px">' + esc(l.texto) + "</p>\n" +
        "    </div>\n" +
        '    <article class="ticket">\n' +
        '      <div class="corpo" style="padding-top:18px">\n' +
        '        <h2 class="tit-ficha">Ficha técnica</h2>\n' +
        '        <table class="tabela-bitolas"><tbody>\n' +
        '          <tr><th scope="row">Uso</th><td>' + esc(p.uso) + "</td></tr>\n" +
        '          <tr><th scope="row">Madeira</th><td>' + esc(p.madeira) + "</td></tr>\n" +
        '          <tr><th scope="row">Bitolas</th><td>' + p.bitolas.map(esc).join("<br>") + "</td></tr>\n" +
        '          <tr><th scope="row">Empresa</th><td><a href="' + paginaEmp[e.id] + '">' + esc(e.nome) + "</a></td></tr>\n" +
        "        </tbody></table>\n" +
        '        <div class="carimbos">' + carimbos(p) + "</div>\n" +
        '        <div style="display:grid;gap:10px;margin-top:16px">' + botaoAdd(p, "Adicionar ao romaneio").replace('class="bt-add"', 'class="bt-add" style="height:52px;justify-content:center;font-size:18px"') + '<a class="botao zap" style="justify-content:center" href="' + zap("Olá! Quero um orçamento de " + p.nome + " (" + p.madeira + ").") + '" target="_blank" rel="noopener">' + IC.zap + " Pedir só este no WhatsApp</a></div>\n" +
        "      </div>\n" +
        "    </article>\n" +
        "  </div>\n" +
        "</section>\n" +
        (rel.length ? '<section class="bloco" style="background:var(--concreto)"><div class="miolo"><div class="cabeca"><h2>Da mesma linha</h2></div><div class="grade-romaneio">' + rel.map(function (x) { return ticket(x); }).join("") + "</div></div></section>" : "") +
        "\n</div>";
    }
    // linha do banco (painel) -> produto do site
    function normaliza(r) {
      var arr = function (a) { return Array.isArray(a) ? a.map(function (x) { return String(x).trim(); }).filter(Boolean) : []; };
      return { id: String(r.id), nome: String(r.nome || ""), linha: LINHAS.some(function (l) { return l.id === r.linha; }) ? r.linha : LINHAS[0].id, uso: String(r.uso || ""), madeira: String(r.madeira || ""), bitolas: arr(r.bitolas), carimbos: arr(r.carimbos).filter(function (c) { return ETAPAS.indexOf(c) >= 0; }), foto: r.foto || "", fotos: arr(r.fotos), descricao: String(r.descricao || "").replace(/\r/g, "").trim(), destaque: +r.destaque || 0, ordem: +r.ordem || 0 };
    }
    return { esc: esc, img: img, ticket: ticket, catalogo: catalogo, ficha: ficha, botaoAdd: botaoAdd, normaliza: normaliza, NOME_CARIMBO: NOME_CARIMBO, ETAPAS: ETAPAS };
  }
  if (typeof module !== "undefined" && module.exports) module.exports = cria; else raiz.LarssenModelo = cria;
})(this);
