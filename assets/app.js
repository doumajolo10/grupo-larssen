// Grupo Larssen · comportamento do site (sem dependência obrigatória: GSAP/Lenis entram como melhoria).
(function () {
  "use strict";
  var doc = document, html = doc.documentElement, body = doc.body;
  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var desktop = window.matchMedia("(min-width: 1100px)").matches;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var temGsap = !!(window.gsap && window.ScrollTrigger);
  if (temGsap) gsap.registerPlugin(ScrollTrigger);
  html.classList.add("anima"); if (reduz) html.classList.add("calmo");

  // ---------- rolagem suave ----------
  var lenis = null;
  if (!reduz && window.Lenis && desktop) {
    lenis = new Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    if (temGsap) { lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0); }
    else { var rafL = function (t) { lenis.raf(t); requestAnimationFrame(rafL); }; requestAnimationFrame(rafL); }
  }
  window.LarssenLenis = lenis;

  // ---------- cabeçalho ----------
  var topo = $(".topo"), ultimoY = 0;
  function aoRolar() {
    var y = window.scrollY || html.scrollTop;
    if (topo) {
      topo.classList.toggle("cheio", y > 30);
      var menuAberto = $(".menu-movel.aberto") || $(".gaveta.aberta");
      topo.classList.toggle("some", !menuAberto && y > 500 && y > ultimoY + 4 && !topo.matches(":hover"));
      if (y < ultimoY - 4) topo.classList.remove("some");
    }
    ultimoY = y;
    trilho();
  }
  window.addEventListener("scroll", aoRolar, { passive: true });

  // ---------- trilho da rota: caminhão + km ----------
  var tr = $(".trilho"), trM = $(".trilho-movel");
  var KM_FIM = +(body.getAttribute("data-km-fim") || 25), KM_INI = +(body.getAttribute("data-km-ini") || 0);
  function trilho() {
    var max = Math.max(1, html.scrollHeight - window.innerHeight);
    var p = Math.min(1, Math.max(0, (window.scrollY || 0) / max));
    if (trM) trM.style.setProperty("--feito", (p * 100).toFixed(2) + "%");
    if (!tr) return;
    var h = tr.clientHeight - 46;
    tr.style.setProperty("--y", (p * h).toFixed(1) + "px");
    tr.style.setProperty("--feito", (p * 100).toFixed(2) + "%");
    tr.style.setProperty("--andar", (-(window.scrollY || 0) * 0.25).toFixed(1) + "px");
    var km = KM_INI + p * (KM_FIM - KM_INI), kmEl = $(".km b", tr);
    if (kmEl) kmEl.textContent = km.toFixed(1).replace(".", ",");
    var atual = ""; $$(".saida-t", tr).forEach(function (s) { var sp = +s.getAttribute("data-p"); if (sp <= p + 0.02) atual = s.getAttribute("data-nome"); s.classList.toggle("ativa", Math.abs(sp - p) < 0.04); });
    var nm = $(".km small", tr); if (nm && nm.textContent !== atual) nm.textContent = atual;
  }
  if (tr) {
    // posiciona as saídas do trilho conforme as seções marcadas
    var marcas = $$("[data-saida]");
    var posicionar = function () {
      var max = Math.max(1, html.scrollHeight - window.innerHeight);
      $$(".saida-t", tr).forEach(function (e) { e.remove(); });
      marcas.forEach(function (m) {
        var p = Math.min(1, Math.max(0, (m.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.4) / max));
        var s = doc.createElement("i"); s.className = "saida-t"; s.setAttribute("data-nome", m.getAttribute("data-saida")); s.setAttribute("data-p", p);
        s.style.top = (8 + p * (tr.clientHeight - 16)) + "px"; tr.appendChild(s);
      });
    };
    window.addEventListener("load", posicionar); window.addEventListener("resize", posicionar); setTimeout(posicionar, 1200);
  }
  aoRolar();

  // ---------- cortina entre páginas ----------
  var cortina = $(".cortina");
  if (cortina) {
    if (sessionStorageGet("larssen-cortina")) { cortina.classList.add("entra"); requestAnimationFrame(function () { requestAnimationFrame(function () { cortina.classList.remove("entra"); cortina.classList.add("sai"); setTimeout(function () { cortina.classList.remove("sai"); }, 900); }); }); sessionStorageSet("larssen-cortina", ""); }
    doc.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || a.target === "_blank" || /^(https?:|mailto:|tel:|whatsapp:)/.test(href) || a.hasAttribute("download")) return;
      e.preventDefault();
      cortina.classList.remove("sai"); cortina.classList.add("entra");
      sessionStorageSet("larssen-cortina", "1");
      setTimeout(function () { window.location.href = a.href; }, 520);
    });
    window.addEventListener("pageshow", function (e) { if (e.persisted) cortina.classList.remove("entra"); });
  }
  function sessionStorageGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sessionStorageSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  // ---------- menu móvel e submenu ----------
  var menuM = $(".menu-movel");
  $$("[data-abre-menu]").forEach(function (b) { b.addEventListener("click", function () { menuM.classList.add("aberto"); b.setAttribute("aria-expanded", "true"); var f = $(".fechar", menuM); if (f) f.focus(); }); });
  $$("[data-fecha-menu]").forEach(function (b) { b.addEventListener("click", function () { menuM.classList.remove("aberto"); $$("[data-abre-menu]").forEach(function (x) { x.setAttribute("aria-expanded", "false"); }); }); });
  $$(".sub > button").forEach(function (b) {
    b.addEventListener("click", function () { var s = b.parentNode; var ab = s.getAttribute("aria-expanded") === "true"; s.setAttribute("aria-expanded", ab ? "false" : "true"); b.setAttribute("aria-expanded", ab ? "false" : "true"); });
  });
  doc.addEventListener("click", function (e) { $$(".sub[aria-expanded='true']").forEach(function (s) { if (!s.contains(e.target)) { s.setAttribute("aria-expanded", "false"); $("button", s).setAttribute("aria-expanded", "false"); } }); });
  doc.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (menuM) menuM.classList.remove("aberto");
    fecharGaveta(); fecharLuz();
    $$(".sub").forEach(function (s) { s.setAttribute("aria-expanded", "false"); });
  });

  // ---------- romaneio (orçamento) ----------
  var gaveta = $(".gaveta"), fundoG = $(".gaveta-fundo"), toast = $(".aviso-toast");
  var ICO_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  function contar() {
    var n = window.Orcamento ? Orcamento.ler().reduce(function (s, x) { return s + 1; }, 0) : 0;
    $$(".bt-romaneio .conta").forEach(function (c) { c.textContent = n; c.classList.remove("pulo"); void c.offsetWidth; c.classList.add("pulo"); setTimeout(function () { c.classList.remove("pulo"); }, 380); });
    $$("[data-add]").forEach(function (b) {
      var tem = window.Orcamento && Orcamento.ler().some(function (x) { return x.id === b.getAttribute("data-add"); });
      b.classList.toggle("no", tem);
      var t = $(".t", b); if (t) t.textContent = tem ? "No romaneio" : (b.getAttribute("data-rotulo") || "Romaneio");
    });
  }
  function desenharItens() {
    var alvo = $$("[data-itens-romaneio]"); if (!alvo.length || !window.Orcamento) return;
    var lista = Orcamento.ler();
    alvo.forEach(function (el) {
      if (!lista.length) {
        el.innerHTML = '<div class="vazio-g"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="6" width="30" height="36" rx="3"/><path d="M15 16h18M15 23h18M15 30h11"/></svg><p><b>O romaneio está vazio.</b><br>Adicione produtos pelo catálogo, com o botão amarelo.</p><a class="link-seta" href="produtos.html">Ver o catálogo <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10h13M11 5l5 5-5 5"/></svg></a></div>';
        return;
      }
      el.innerHTML = lista.map(function (x) {
        return '<div class="item-r" data-id="' + x.id + '"><div><b>' + esc(x.nome) + '</b><small>' + esc(x.empresa) + (x.bitola ? " · " + esc(x.bitola) : "") + '</small></div>' +
          '<div class="qtd"><button type="button" data-q="-1" aria-label="Diminuir quantidade de ' + esc(x.nome) + '">−</button><input type="number" min="1" max="999" value="' + x.qtd + '" aria-label="Quantidade de ' + esc(x.nome) + '"><button type="button" data-q="1" aria-label="Aumentar quantidade de ' + esc(x.nome) + '">+</button></div>' +
          '<button type="button" class="remover" aria-label="Tirar ' + esc(x.nome) + ' do romaneio">' + ICO_X + '</button></div>';
      }).join("");
    });
    $$("[data-enviar-romaneio]").forEach(function (b) { b.disabled = !lista.length; });
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  doc.addEventListener("click", function (e) {
    var add = e.target.closest && e.target.closest("[data-add]");
    if (add && window.Orcamento) {
      e.preventDefault(); e.stopPropagation();
      var ja = Orcamento.ler().some(function (x) { return x.id === add.getAttribute("data-add"); });
      if (ja) { abrirGaveta(); return; }
      Orcamento.adicionar({ id: add.getAttribute("data-add"), nome: add.getAttribute("data-nome"), empresa: add.getAttribute("data-empresa"), bitola: add.getAttribute("data-bitola") || "" });
      avisar(add.getAttribute("data-nome") + " entrou no romaneio");
      return;
    }
    var q = e.target.closest && e.target.closest(".qtd button");
    if (q) { var it = q.closest(".item-r"), inp = $("input", it); Orcamento.quantidade(it.getAttribute("data-id"), (+inp.value || 1) + (+q.getAttribute("data-q"))); return; }
    var rm = e.target.closest && e.target.closest(".remover");
    if (rm) { Orcamento.remover(rm.closest(".item-r").getAttribute("data-id")); return; }
    if (e.target.closest && e.target.closest("[data-abre-romaneio]")) { e.preventDefault(); abrirGaveta(); }
    if (e.target.closest && e.target.closest("[data-fecha-romaneio]")) fecharGaveta();
  });
  doc.addEventListener("change", function (e) { if (e.target.matches(".item-r .qtd input")) Orcamento.quantidade(e.target.closest(".item-r").getAttribute("data-id"), +e.target.value); });
  doc.addEventListener("orcamento:mudou", function () { contar(); desenharItens(); });
  var focoAntes = null;
  function abrirGaveta() {
    if (!gaveta) return; focoAntes = doc.activeElement;
    gaveta.classList.add("aberta"); fundoG.classList.add("aberta"); gaveta.setAttribute("aria-hidden", "false"); gaveta.inert = false;
    if (lenis) lenis.stop();
    setTimeout(function () { var f = $(".fechar", gaveta); if (f) f.focus(); }, 60);
  }
  function fecharGaveta() {
    if (!gaveta || !gaveta.classList.contains("aberta")) return;
    gaveta.classList.remove("aberta"); fundoG.classList.remove("aberta"); gaveta.setAttribute("aria-hidden", "true"); gaveta.inert = true;
    if (lenis) lenis.start();
    if (focoAntes && focoAntes.focus) focoAntes.focus();
  }
  // envio pelo WhatsApp
  $$("[data-form-romaneio]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!Orcamento.ler().length) return;
      var nome = f.querySelector("[name=nome]"), cidade = f.querySelector("[name=cidade]");
      var ok = true;
      [nome, cidade].forEach(function (c) { if (c && !c.value.trim()) { c.setAttribute("aria-invalid", "true"); ok = false; } else if (c) c.removeAttribute("aria-invalid"); });
      var er = f.querySelector(".erro"); if (er) er.textContent = ok ? "" : "Preencha seu nome e a cidade da entrega para o vendedor calcular o frete.";
      if (!ok) { (nome.value.trim() ? cidade : nome).focus(); return; }
      var msg = Orcamento.mensagem({ nome: nome.value.trim(), cidade: cidade.value.trim(), obs: (f.querySelector("[name=obs]") || {}).value || "" });
      window.open(Orcamento.linkWhats(msg), "_blank", "noopener");
    });
  });
  function avisar(t) {
    if (!toast) return;
    $("span", toast).textContent = t; toast.classList.add("on");
    clearTimeout(avisar._t); avisar._t = setTimeout(function () { toast.classList.remove("on"); }, 2600);
  }
  contar(); desenharItens();

  // ---------- catálogo: vista romaneio / fotos ----------
  var cats = $$("[data-vistas]");
  if (cats.length) {
    var vista = "lista"; try { vista = localStorage.getItem("larssen-vista") || "lista"; } catch (e) {}
    var aplicarVista = function (v) {
      cats.forEach(function (c) { c.classList.toggle("vista-lista", v === "lista"); c.classList.toggle("vista-grade", v === "grade"); });
      $$("[data-vista]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-vista") === v ? "true" : "false"); });
      if (temGsap) ScrollTrigger.refresh();
    };
    $$("[data-vista]").forEach(function (b) { b.addEventListener("click", function () { var v = b.getAttribute("data-vista"); try { localStorage.setItem("larssen-vista", v); } catch (e) {} aplicarVista(v); }); });
    aplicarVista(vista);
  }

  // ---------- catálogo: filtros ----------
  var cat = $("[data-catalogo]");
  if (cat) {
    var cards = $$(".ticket", cat), chips = $$("[data-filtro]"), busca = $("[data-busca]"), cont = $("[data-contagem]"), vazio = $("[data-vazio]");
    var filtro = "todos";
    var norm = function (s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); };
    var aplicar = function () {
      var q = norm(busca && busca.value), n = 0;
      cards.forEach(function (c) {
        var ok = (filtro === "todos" || c.getAttribute("data-linha") === filtro || c.getAttribute("data-empresa-id") === filtro) && (!q || norm(c.textContent).indexOf(q) >= 0);
        c.hidden = !ok; if (ok) n++;
      });
      $$(".grupo-cat", cat).forEach(function (g) { g.hidden = !$$(".ticket", g).some(function (t) { return !t.hidden; }); });
      if (cont) cont.textContent = n + (n === 1 ? " produto" : " produtos");
      if (vazio) vazio.hidden = n > 0;
      if (temGsap) ScrollTrigger.refresh();
    };
    chips.forEach(function (ch) { ch.addEventListener("click", function () { filtro = ch.getAttribute("data-filtro"); chips.forEach(function (x) { x.setAttribute("aria-pressed", x === ch ? "true" : "false"); }); aplicar(); history.replaceState(null, "", filtro === "todos" ? location.pathname : "#" + filtro); }); });
    if (busca) busca.addEventListener("input", aplicar);
    var porHash = function () { var h = location.hash.slice(1); if (!h) return; var alvoC = chips.filter(function (c) { return c.getAttribute("data-filtro") === h; })[0]; if (alvoC) alvoC.click(); };
    porHash(); window.addEventListener("hashchange", porHash);
    aplicar();
  }

  // ---------- revelações ----------
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("on"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
    $$(".revela, .mascara").forEach(function (el) { io.observe(el); });
  }

  // ---------- frase que acende ----------
  $$("[data-acende]").forEach(function (fr) {
    var partes = $$(".p", fr);
    if (!temGsap) { partes.forEach(function (p) { p.classList.add("on"); }); return; }
    ScrollTrigger.create({ trigger: fr, start: "top 78%", end: "bottom 42%", onUpdate: function (st) { var n = Math.round(st.progress * partes.length); partes.forEach(function (p, i) { p.classList.toggle("on", i < n); }); } });
  });

  // ---------- contadores ----------
  $$("[data-conta]").forEach(function (el) {
    var fim = +el.getAttribute("data-conta"), suf = el.getAttribute("data-suf") || "", milhar = fim >= 1000;
    var fmt = function (v) { var s = Math.round(v).toString(); return milhar ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : s; };
    el.textContent = fmt(fim) + suf; // valor final já visível sem animação
    if (!("IntersectionObserver" in window)) return;
    var o = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; o.disconnect();
      var t0 = performance.now(), d = 1600;
      (function passo(t) { var k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 4); el.textContent = fmt(fim * e) + suf; if (k < 1) requestAnimationFrame(passo); })(t0);
    }, { threshold: 0.4 });
    o.observe(el);
  });

  // ---------- parallax leve ----------
  if (temGsap && !reduz) {
    $$("[data-parallax]").forEach(function (el) {
      var f = +el.getAttribute("data-parallax") || 12;
      gsap.fromTo(el, { yPercent: -f / 2 }, { yPercent: f / 2, ease: "none", scrollTrigger: { trigger: el.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
    });
  }

  // ---------- rota horizontal ----------
  var rotaH = $("[data-rota-h]");
  if (rotaH && temGsap && window.innerWidth > 760) {
    var pista = $(".pista", rotaH), cam = $(".caminhao-h", rotaH), estradaH = $(".estrada-h", rotaH);
    var dist = function () { return Math.max(0, pista.scrollWidth - window.innerWidth); };
    var tl = gsap.to(pista, { x: function () { return -dist(); }, ease: "none", scrollTrigger: { trigger: rotaH, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
      onUpdate: function (st) { if (cam) cam.style.setProperty("--x", (st.progress * (estradaH.clientWidth - 90)).toFixed(1) + "px"); } } });
    if (!reduz) $$(".parada .foto img", rotaH).forEach(function (img) { gsap.fromTo(img, { xPercent: 6 }, { xPercent: -6, ease: "none", scrollTrigger: { trigger: img, containerAnimation: tl, start: "left right", end: "right left", scrub: true } }); });
  }

  // ---------- autoclave: estações ----------
  var auto = $("[data-autoclave]");
  if (auto) {
    var est = $$(".estacao", auto), svgA = $(".auto-palco svg", auto);
    var nivel = $("#nivel-cca", auto), ponteiro = $("#ponteiro", auto), seta = $("#seta-tanque", auto), madeiraA = $$(".pecaA", auto), rotulo = $("#rotulo-est", auto), bolhas = $("#bolhas", auto);
    var estado = function (i) {
      est.forEach(function (e, k) { e.classList.toggle("on", k === i); });
      // 0 carga, 1 vácuo, 2 enchimento, 3 pressão, 4 alívio, 5 vácuo final
      var cheio = [0, 0, 1, 1, 0.15, 0][i], pressao = [0.5, 0.05, 0.08, 1, 0.45, 0.05][i], cor = [0, 0, 0.2, 1, 1, 1][i];
      if (nivel) nivel.style.transform = "scaleY(" + cheio + ")";
      if (ponteiro) ponteiro.style.transform = "rotate(" + (-120 + pressao * 240) + "deg)";
      if (seta) seta.style.opacity = (i === 2 || i === 4) ? 1 : 0, seta && seta.setAttribute("transform", i === 4 ? "rotate(180 0 0)" : "");
      madeiraA.forEach(function (m) { m.style.fill = cor > 0.5 ? "#8fa86f" : "#d9a76a"; });
      if (bolhas) bolhas.style.opacity = i === 1 || i === 5 ? 1 : 0;
      if (rotulo) rotulo.textContent = (i + 1) + " · " + $("h3", est[i]).textContent;
    };
    estado(0);
    if ("IntersectionObserver" in window) {
      var oa = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) estado(est.indexOf(en.target)); }); }, { rootMargin: "-45% 0px -45% 0px" });
      est.forEach(function (e) { oa.observe(e); });
    }
  }

  // ---------- mapa: estados acendendo ----------
  var mapa = $("[data-mapa]");
  if (mapa) {
    var ufs = $$(".uf.atende", mapa), rotas = $$(".rota", mapa);
    rotas.forEach(function (r) { var L = r.getTotalLength(); r.style.strokeDasharray = "6 6"; r.style.strokeDashoffset = L; r.dataset.l = L; });
    var acender = function () {
      ufs.forEach(function (u, i) { setTimeout(function () { u.classList.add("on"); }, 160 * i); });
      rotas.forEach(function (r, i) { r.animate([{ strokeDashoffset: r.dataset.l }, { strokeDashoffset: 0 }], { duration: 1400, delay: 160 * i, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" }); });
    };
    if ("IntersectionObserver" in window) { var om = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { om.disconnect(); acender(); } }, { threshold: 0.3 }); om.observe(mapa); } else acender();
  }

  // ---------- galeria (luz) ----------
  var luz = $(".lightbox"), fotosLuz = [], idxLuz = 0;
  function abrirLuz(lista, i) { if (!luz) return; if (!$("img", luz)) luz.insertBefore(doc.createElement("img"), luz.firstChild); fotosLuz = lista; idxLuz = i; $("img", luz).src = lista[i].href; $("img", luz).alt = $("img", lista[i]).alt; luz.classList.add("on"); $(".fx", luz).focus(); if (lenis) lenis.stop(); }
  function fecharLuz() { if (luz && luz.classList.contains("on")) { luz.classList.remove("on"); if (lenis) lenis.start(); } }
  $$(".galeria").forEach(function (g) { var ls = $$("a", g); ls.forEach(function (a, i) { a.addEventListener("click", function (e) { e.preventDefault(); abrirLuz(ls, i); }); }); });
  if (luz) {
    $(".fx", luz).addEventListener("click", fecharLuz);
    $(".ant", luz).addEventListener("click", function () { abrirLuz(fotosLuz, (idxLuz - 1 + fotosLuz.length) % fotosLuz.length); });
    $(".prox", luz).addEventListener("click", function () { abrirLuz(fotosLuz, (idxLuz + 1) % fotosLuz.length); });
    luz.addEventListener("click", function (e) { if (e.target === luz) fecharLuz(); });
    doc.addEventListener("keydown", function (e) { if (!luz.classList.contains("on")) return; if (e.key === "ArrowLeft") $(".ant", luz).click(); if (e.key === "ArrowRight") $(".prox", luz).click(); });
  }

  // ---------- formulário de contato -> WhatsApp ----------
  var fc = $("[data-form-contato]");
  if (fc) fc.addEventListener("submit", function (e) {
    e.preventDefault();
    var campos = ["nome", "telefone", "mensagem"].map(function (n) { return fc.querySelector("[name=" + n + "]"); });
    var falta = campos.filter(function (c) { var v = !c.value.trim(); c.setAttribute("aria-invalid", v ? "true" : "false"); return v; });
    var er = fc.querySelector(".erro");
    if (falta.length) { er.textContent = "Preencha nome, telefone e mensagem para a gente responder."; falta[0].focus(); return; }
    er.textContent = "";
    var emp = fc.querySelector("[name=empresa]").value;
    var msg = "Olá, Grupo Larssen!" + (emp ? " Assunto: " + emp + "." : "") + "\n" + campos[2].value.trim() + "\n\nNome: " + campos[0].value.trim() + "\nTelefone: " + campos[1].value.trim();
    window.open("https://wa.me/" + (html.getAttribute("data-whats") || "5555936197019") + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
  });

  // ---------- HERO 3D (home) ----------
  var hero = $("[data-hero3d]");
  if (hero) {
    var canvas = $("canvas", hero), legenda = $(".legenda3d", hero), pinos = $(".pinos", hero), carregador = $(".carregador");
    var CAPS = JSON.parse(hero.getAttribute("data-caps") || "[]");
    var progressoHero = function () { var r = hero.getBoundingClientRect(); var tot = hero.offsetHeight - window.innerHeight; return Math.min(1, Math.max(0, -r.top / Math.max(1, tot))); };
    // carregador: km 0 -> 25
    var kmC = carregador && $(".km-c b", carregador), pC = 0, pronto = false;
    var fechado = false;
    var fecharCarregador = function () {
      if (fechado || !carregador) return; fechado = true;
      carregador.style.setProperty("--p", 1); if (kmC) kmC.textContent = 25;
      setTimeout(function () { carregador.classList.add("foi"); revelarHero(); setTimeout(function () { carregador.remove(); }, 1000); }, 260);
    };
    if (carregador) {
      var tick = setInterval(function () {
        if (fechado) { clearInterval(tick); return; }
        pC = Math.min(pronto ? 1 : 0.9, pC + (pronto ? 0.25 : 0.045));
        carregador.style.setProperty("--p", pC.toFixed(3)); if (kmC) kmC.textContent = Math.round(pC * 25);
        if (pronto && pC >= 1) fecharCarregador();
      }, 50);
      setTimeout(fecharCarregador, 5000); // nunca segura a página mais que isso
    }
    setTimeout(function () { pronto = true; }, 4500);
    var revelarHero = function () {
      if (!temGsap) return;
      gsap.from(".hero3d h1 .l > span", { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.09 });
      gsap.from(".hero3d .texto p, .hero3d .acoes", { y: 24, opacity: 0, duration: 1, ease: "expo.out", delay: 0.35, stagger: 0.08 });
      gsap.from(".placa-saidas", { x: 40, opacity: 0, duration: 1.1, ease: "expo.out", delay: 0.4 });
      gsap.from(".placa-saidas a", { x: 20, opacity: 0, duration: 0.8, ease: "expo.out", delay: 0.6, stagger: 0.06 });
    };
    var legendaAtual = -1;
    var atualizarLegenda = function (p) {
      if (!legenda || !CAPS.length) return;
      var i = 0; for (var k = 0; k < CAPS.length; k++) if (p >= CAPS[k].p) i = k;
      if (i === legendaAtual) return; legendaAtual = i;
      var c = CAPS[i];
      legenda.innerHTML = '<span class="marco">KM<b>' + c.km + '</b></span><h3>' + c.t + '</h3><p>' + c.d + '</p>';
      if (temGsap) gsap.fromTo(legenda.children, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "expo.out", stagger: 0.05 });
      $$(".placa-saidas a").forEach(function (a) { a.classList.toggle("ativa", a.getAttribute("data-id") === c.id); });
    };
    var mapaPinos = {};
    $$(".pino", pinos).forEach(function (p) { mapaPinos[p.getAttribute("data-id")] = p; });
    var leve = window.innerWidth < 900 || (navigator.hardwareConcurrency || 8) <= 4;
    var webglOk = (function () { try { var c = doc.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); } catch (e) { return false; } })();
    if (!webglOk) { hero.classList.add("sem3d"); pronto = true; atualizarLegenda(0); }
    else {
      import("./cena3d.js").then(function (m) {
        var cena = m.iniciarCena(canvas, {
          leve: leve, parado: reduz,
          aoQuadro: function (lista) {
            lista.forEach(function (it) { var p = mapaPinos[it.id]; if (!p) return; p.style.transform = "translate(" + it.x.toFixed(1) + "px," + it.y.toFixed(1) + "px) translate(-50%,-100%)"; p.classList.toggle("on", it.visivel && it.y > 120 && it.y < window.innerHeight - 40 && it.x > 30 && it.x < window.innerWidth - 30); });
          },
        });
        window.LarssenCena = cena;
        var sync = function () { var p = progressoHero(); cena.definirProgresso(p); atualizarLegenda(p); hero.classList.toggle("viajando", p > 0.07);
          var f = Math.min(1, Math.max(0, (p - 0.86) / 0.14)); f = f * f * (3 - 2 * f); cena.definirFim(f); hero.classList.toggle("dissolvendo", f > 0.35);
          if (!cena.temDissolucao) canvas.style.opacity = (1 - f).toFixed(3); };
        window.addEventListener("scroll", sync, { passive: true }); sync();
        if (cena.pronto) cena.pronto.then(function () { pronto = true; }); else pronto = true;
      }).catch(function (err) { console.warn("3D indisponível", err); hero.classList.add("sem3d"); pronto = true; });
    }
    atualizarLegenda(0);
  }

  // ---------- ano no rodapé ----------
  $$("[data-ano]").forEach(function (e) { e.textContent = new Date().getFullYear(); });
  window.addEventListener("load", function () { if (temGsap) ScrollTrigger.refresh(); trilho(); });
})();
