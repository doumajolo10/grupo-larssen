/* Grupo Larssen — catálogo ao vivo.
   Busca no painel (Supabase) os produtos ativos e redesenha catálogo, destaques, páginas das empresas e fichas
   com o mesmo modelo das páginas estáticas (assets/modelo-produtos.js). Se o painel não responder, fica o que veio no HTML.
   ?fresco=1 ignora o cache de 30 s. */
(function () {
  "use strict";
  var C = window.LARSSEN_CTX, doc = document;
  var regioes = doc.querySelectorAll("[data-vivo],[data-ficha],[data-n-produtos]");
  // sem o banco do painel criado ainda, fica o que veio no HTML (e o molde de produto novo volta para o catálogo)
  if (!C || !window.LarssenModelo || !regioes.length || !window.fetch || !(C.painelAtivo || window.LARSSEN_FORCA_VIVO)) { window.LARSSEN_VIVO = Promise.resolve(); if (doc.querySelector("[data-ficha][data-molde]")) location.replace("produtos.html"); return; }
  var M = window.LarssenModelo(C), CHAVE = "larssen-vivo-v1", TTL = 30000;
  var fresco = /[?&]fresco=1/.test(location.search);
  var html = doc.documentElement;
  var guardado = function () { try { var c = JSON.parse(localStorage.getItem(CHAVE)); if (c && Date.now() - c.t < TTL) return c.lista; } catch (e) {} return null; };
  var guarda = function (l) { try { localStorage.setItem(CHAVE, JSON.stringify({ t: Date.now(), lista: l })); } catch (e) {} };
  var ordena = function (l) { return l.slice().sort(function (a, b) { return (a.ordem - b.ordem) || a.nome.localeCompare(b.nome, "pt-BR"); }); };

  function busca() {
    var c = fresco ? null : guardado(); if (c) return Promise.resolve(c);
    var ctl = window.AbortController ? new AbortController() : null, t = setTimeout(function () { if (ctl) ctl.abort(); }, 2500);
    return fetch(C.supa.url + "/rest/v1/larssen_produtos?select=*&ativo=eq.true&order=ordem.asc,nome.asc", { headers: { apikey: C.supa.chave, Accept: "application/json" }, signal: ctl ? ctl.signal : undefined, cache: "no-store" })
      .then(function (r) { clearTimeout(t); if (!r.ok) throw new Error("painel " + r.status); return r.json(); })
      .then(function (rows) { if (!Array.isArray(rows) || !rows.length) throw new Error("vazio"); guarda(rows); return rows; });
  }
  function destaques(lista) {
    var m = lista.filter(function (p) { return p.destaque > 0; }).sort(function (a, b) { return a.destaque - b.destaque; });
    if (m.length) return m.slice(0, 8);
    return ["dormentes-tratados", "pergolados", "decks", "assoalhos", "mouroes", "maravalha-aviario", "tesouras", "cavaco"].map(function (id) { return lista.find(function (p) { return p.id === id; }); }).filter(Boolean);
  }
  function idDaPagina() { var m = /produto-([a-z0-9-]+)\.html/.exec(location.pathname); return m ? m[1] : (new URLSearchParams(location.search).get("id") || ""); }
  function indisponivel(el, molde) {
    var t = molde ? "Produto não encontrado." : "Este produto saiu do catálogo.";
    var div = doc.createElement("div"); div.className = "ficha-produto"; div.setAttribute("data-ficha", "");
    div.innerHTML = '<section class="capa clara" style="min-height:60vh"><div class="miolo"><nav class="migalhas" aria-label="Você está em"><a href="index.html">Grupo Larssen</a><span>/</span><a href="produtos.html">Produtos</a></nav><h1>' + t + '</h1><p>Veja os outros produtos do catálogo ou fale com a gente: fazemos cortes especiais sob medida.</p><p style="display:flex;gap:12px;flex-wrap:wrap;margin-top:20px"><a class="botao" href="produtos.html">Ver o catálogo</a><a class="botao zap" href="https://wa.me/' + C.whats + '" target="_blank" rel="noopener">' + C.IC.zap + " Falar no WhatsApp</a></p></div></section>";
    el.replaceWith(div);
    var meta = doc.createElement("meta"); meta.name = "robots"; meta.content = "noindex"; doc.head.appendChild(meta);
  }
  function aplica(rows) {
    var lista = ordena(rows.map(M.normaliza).filter(function (p) { return p.nome; }));
    var linhaDe = function (id) { return C.LINHAS.find(function (l) { return l.id === id; }) || {}; };
    doc.querySelectorAll("[data-n-produtos]").forEach(function (e) { e.textContent = lista.length; });
    doc.querySelectorAll("[data-vivo=catalogo]").forEach(function (e) { e.innerHTML = M.catalogo(lista); });
    doc.querySelectorAll("[data-vivo=destaques]").forEach(function (e) { e.innerHTML = destaques(lista).map(function (p) { return M.ticket(p); }).join(""); });
    doc.querySelectorAll("[data-vivo=empresa]").forEach(function (e) {
      var d = lista.filter(function (p) { return linhaDe(p.linha).empresa === e.getAttribute("data-empresa"); });
      e.innerHTML = M.catalogo(d);
      var n = doc.querySelector('[data-n-empresa="' + e.getAttribute("data-empresa") + '"]'); if (n) n.textContent = d.length;
    });
    var f = doc.querySelector("[data-ficha]");
    if (f) {
      var molde = f.hasAttribute("data-molde"), id = f.getAttribute("data-ficha") || idDaPagina(), p = lista.find(function (x) { return x.id === id; });
      if (!p) indisponivel(f, molde);
      else {
        var tmp = doc.createElement("div"); tmp.innerHTML = M.ficha(p, lista); f.replaceWith(tmp.firstElementChild);
        doc.title = p.nome + " · " + (linhaDe(p.linha).nome || "Produtos") + " · Grupo Larssen";
        var desc = doc.querySelector('meta[name="description"]'); if (desc) desc.content = (p.nome + ": " + p.uso + ". " + p.madeira + ".").slice(0, 158);
      }
    }
    html.setAttribute("data-catalogo-vivo", "ok");
  }
  window.LARSSEN_VIVO = busca().then(aplica).catch(function () {
    html.setAttribute("data-catalogo-vivo", "estatico");
    var f = doc.querySelector("[data-ficha][data-molde]"); if (f) indisponivel(f, true);
  });
})();
