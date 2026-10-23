/* Grupo Larssen · Painel de produtos.
   Fala direto com o Supabase (Auth, REST e Storage) por fetch, sem biblioteca. Base: painéis da Kiesel e da Khaus.
   Com ?demo na URL roda sem banco (com os produtos atuais do site, guardados só neste navegador). */
(function () {
  "use strict";
  const S = { url: "https://cwsjddppdogvyitspbfr.supabase.co", chave: "sb_publishable_zpNPLwlPqkOR6pnvrxRGHw_78r3siqN", tabela: "larssen_produtos", balde: "larssen-fotos" };
  const DEMO = /[?&]demo\b/.test(location.search);
  const SITE_PUB = /grupolarssen\.com\.br|grupo-larssen\.vercel\.app|localhost|127\.0\.0\.1/.test(location.host) ? location.origin : "https://grupo-larssen.vercel.app";
  // no endereço próprio do painel (painel.dominio) a barra mostra só a raiz
  if (/^painel\./.test(location.hostname) && location.pathname !== "/") history.replaceState(null, "", "/" + location.search + location.hash);
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const app = $("#app");
  const sem = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const FOTO_OK = S.url + "/storage/v1/object/public/" + S.balde + "/";
  const ehUrl = f => /^(https?:|blob:)/.test(f || "");
  const fotoUrl = (f, t) => !f ? "/assets/sem-foto.svg" : ehUrl(f) ? (t === "p" && !/^blob:/.test(f) ? f.replace(/-g\.(webp|jpg)$/, "-p.$1") : f) : "/img/" + (t === "p" ? "m" : "p") + "/" + String(f).replace(/\.(jpe?g|png|webp)$/i, "") + ".webp";
  const linkSite = id => SITE_PUB + "/produto-" + encodeURIComponent(id) + ".html?fresco=1";
  const slug = s => sem(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  const LOGO = '<svg class="logo-svg" viewBox="0 0 943.3 410.3" aria-hidden="true" focusable="false"><use href="#lg-grupo"/></svg>';
  const ETAPAS = [["floresta", "Floresta"], ["serraria", "Serrado"], ["beneficiamento", "Aplainado"], ["autoclave", "Autoclavado"]];

  const I = {
    mais: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    busca: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    editar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/></svg>',
    olho: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    olhoNao: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 3l18 18M10.6 5.1A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a10 10 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',
    lista: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    estrela: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>',
    estrelaCheia: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>',
    lixo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    sair: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/></svg>',
    chave: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M14 9l2 2"/></svg>',
    externo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/></svg>',
    envia: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M7 18a5 5 0 0 1-.6-10A6 6 0 0 1 18 8.5a4.5 4.5 0 0 1-.5 9.5"/><path d="M12 12v9M8.5 15.5L12 12l3.5 3.5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    seta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
    alerta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 8v5M12 16.5v.5M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
    tora: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><ellipse cx="6" cy="12" rx="3" ry="5"/><path d="M6 7h13a3 5 0 0 1 0 10H6"/><path d="M6 10.5a1.5 1.5 0 0 1 0 3"/></svg>',
    regua: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/></svg>'
  };

  // =====================================================================
  // sessão e acesso ao banco
  // =====================================================================
  const SES = DEMO ? "larssen-painel-sessao-demo" : "larssen-painel-sessao";
  const guarda = { get: k => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }, set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
  let sessao = guarda.get(SES);
  function salvaSessao(d) {
    sessao = { access_token: d.access_token, refresh_token: d.refresh_token, expires_at: d.expires_at || Math.floor(Date.now() / 1000) + (Number(d.expires_in) || 3600), email: (d.user && d.user.email) || (sessao && sessao.email) || "" };
    guarda.set(SES, sessao);
  }
  function erro(msg, extra) { const e = new Error(msg); Object.assign(e, extra || {}); return e; }
  const SEM_REDE = "Sem conexão com a internet agora. Nada foi perdido: confira a conexão e tente de novo.";
  async function chama(url, op) { try { return await fetch(url, op); } catch (e) { throw erro(SEM_REDE, { rede: true }); } }
  function traduzAuth(j, st) {
    const m = sem(j.error_description || j.msg || j.message || j.error || j.error_code || "");
    if (st === 429 || m.includes("rate limit")) return "Muitas tentativas seguidas. Espere um minuto e tente de novo.";
    if (m.includes("invalid login") || m.includes("invalid_credentials") || m.includes("invalid grant")) return "E-mail ou senha incorretos.";
    if (m.includes("not confirmed")) return "Este e-mail ainda não foi confirmado. Abra o convite que chegou por e-mail.";
    if (m.includes("same") && m.includes("password")) return "A nova senha precisa ser diferente da atual.";
    if (m.includes("weak") || m.includes("at least") || m.includes("should be")) return "Senha fraca: use pelo menos 8 caracteres, misturando letras e números.";
    if (m.includes("expired") || m.includes("invalid") && m.includes("token")) return "O link expirou ou já foi usado. Peça um novo em \"Esqueci minha senha\".";
    return "Não foi possível concluir agora. Tente de novo em instantes.";
  }
  async function auth(caminho, corpo, metodo, tk) {
    const r = await chama(S.url + "/auth/v1/" + caminho, { method: metodo || "POST", headers: Object.assign({ apikey: S.chave, "Content-Type": "application/json" }, tk ? { Authorization: "Bearer " + tk } : {}), body: corpo ? JSON.stringify(corpo) : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw erro(traduzAuth(j, r.status), { status: r.status });
    return j;
  }
  let renovando = null;
  async function renova() {
    if (!sessao || !sessao.refresh_token) throw erro("Sua sessão terminou. Entre de novo.", { sessao: true });
    if (!renovando) renovando = auth("token?grant_type=refresh_token", { refresh_token: sessao.refresh_token }).then(salvaSessao).catch(e => { if (!e.rede) { sessao = null; guarda.set(SES, null); } throw e.rede ? e : erro("Sua sessão terminou. Entre de novo.", { sessao: true }); }).finally(() => { renovando = null; });
    return renovando;
  }
  async function token() {
    if (!sessao) throw erro("Sua sessão terminou. Entre de novo.", { sessao: true });
    if (sessao.expires_at - 90 < Date.now() / 1000) await renova();
    return sessao.access_token;
  }
  const SEM_PERMISSAO = "Seu usuário não tem permissão para alterar produtos. Peça para incluírem o seu e-mail na equipe do painel.";
  function traduzRest(j, st, ctx) {
    const c = j.code || "", m = sem(j.message || "");
    if (c === "23505") return ctx && ctx.id ? `Já existe um produto com o código ${ctx.id}. Mude o nome ou o código.` : "Esse registro já existe.";
    if (c === "42501" || st === 403) return SEM_PERMISSAO;
    if (c === "23514" || c === "22P02") return "Algum campo está com um valor inválido. Confira nome, linha, bitolas e etapas.";
    if (c === "42P01" || c === "PGRST205" || m.includes("does not exist") || m.includes("could not find the table")) return "O banco do painel ainda não foi preparado (falta rodar o arquivo larssen.sql no Supabase).";
    if (st >= 500) return "O banco de dados não respondeu. Tente de novo em instantes.";
    return "Não foi possível salvar: " + (j.message || "erro " + st) + ".";
  }
  async function rest(caminho, o) {
    o = o || {};
    const faz = async () => chama(S.url + "/rest/v1/" + caminho, { method: o.metodo || "GET", headers: Object.assign({ apikey: S.chave, Authorization: "Bearer " + (await token()), "Content-Type": "application/json", Accept: "application/json" }, o.prefer ? { Prefer: o.prefer } : {}), body: o.corpo ? JSON.stringify(o.corpo) : undefined });
    let r = await faz();
    if (r.status === 401) { await renova(); r = await faz(); }
    if (r.status === 401) throw erro("Sua sessão terminou. Entre de novo.", { sessao: true });
    if (!r.ok) { const j = await r.json().catch(() => ({})); throw erro(traduzRest(j, r.status, o.ctx), { status: r.status }); }
    if (r.status === 204) return null;
    const t = await r.text(); return t ? JSON.parse(t) : null;
  }
  const caminhoBalde = url => { const m = String(url).split(FOTO_OK)[1]; return m ? decodeURIComponent(m.split("?")[0]) : null; };

  const nuvem = {
    async entrar(email, senha) { salvaSessao(await auth("token?grant_type=password", { email, password: senha })); },
    async recuperar(email) { await auth("recover?redirect_to=" + encodeURIComponent(location.origin + location.pathname), { email }); },
    async novaSenha(senha) { await auth("user", { password: senha }, "PUT", await token()); },
    async sair() { const tk = sessao && sessao.access_token; sessao = null; guarda.set(SES, null); if (tk) { try { await fetch(S.url + "/auth/v1/logout", { method: "POST", headers: { apikey: S.chave, Authorization: "Bearer " + tk } }); } catch (e) { } } },
    async equipe() { return rest("larssen_equipe?select=email,nome"); },
    async listar() { return rest(S.tabela + "?select=*&order=ordem.asc,nome.asc"); },
    async criar(d) { const r = await rest(S.tabela, { metodo: "POST", corpo: d, prefer: "return=representation", ctx: { id: d.id } }); if (!r || !r.length) throw erro(SEM_PERMISSAO); return r[0]; },
    async alterar(id, d) { const r = await rest(S.tabela + "?id=eq." + encodeURIComponent(id), { metodo: "PATCH", corpo: d, prefer: "return=representation" }); if (!r || !r.length) throw erro(SEM_PERMISSAO); return r[0]; },
    async excluir(id) { const r = await rest(S.tabela + "?id=eq." + encodeURIComponent(id), { metodo: "DELETE", prefer: "return=representation" }); if (!r || !r.length) throw erro(SEM_PERMISSAO); },
    async enviarFoto(caminho, blob) {
      const faz = async () => chama(S.url + "/storage/v1/object/" + S.balde + "/" + caminho, { method: "POST", headers: { apikey: S.chave, Authorization: "Bearer " + (await token()), "Content-Type": blob.type, "Cache-Control": "31536000", "x-upsert": "false" }, body: blob });
      let r = await faz(); if (r.status === 401) { await renova(); r = await faz(); }
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw erro(r.status === 403 || /policy|unauthorized/i.test(j.message || j.error || "") ? SEM_PERMISSAO : r.status === 413 ? "Foto grande demais." : "A foto não subiu (" + (j.message || r.status) + ")."); }
      return FOTO_OK + caminho;
    },
    async apagarFotos(urls) {
      const prefixes = urls.map(caminhoBalde).filter(Boolean).flatMap(c => [c, c.replace(/-g\.(webp|jpg)$/, "-p.$1")]); if (!prefixes.length) return;
      await chama(S.url + "/storage/v1/object/" + S.balde, { method: "DELETE", headers: { apikey: S.chave, Authorization: "Bearer " + (await token()), "Content-Type": "application/json" }, body: JSON.stringify({ prefixes }) });
    }
  };

  // modo demonstração: mesma interface, dados só neste navegador
  const DEMO_K = "larssen-painel-demo-v1";
  const demo = {
    lista: null,
    async carrega() {
      if (this.lista) return;
      const g = guarda.get(DEMO_K); if (g) { this.lista = g; return; }
      const c = await catalogo();
      this.lista = c.produtos.map(p => Object.assign({}, p, { alterado_em: c.gerado + "T12:00:00Z", alterado_por: null }));
    },
    grava() { guarda.set(DEMO_K, this.lista.map(x => Object.assign({}, x, { foto: /^blob:/.test(x.foto || "") ? "" : x.foto, fotos: (x.fotos || []).filter(f => !/^blob:/.test(f)) }))); },
    espera: () => new Promise(r => setTimeout(r, 220)),
    async entrar(email) { await this.espera(); salvaSessao({ access_token: "demo", refresh_token: "demo", expires_in: 86400, user: { email: email || "demo@larssen" } }); },
    async recuperar() { await this.espera(); },
    async novaSenha() { await this.espera(); },
    async sair() { sessao = null; guarda.set(SES, null); },
    async equipe() { return [{ email: sessao.email, nome: "Demonstração" }]; },
    async listar() { await this.carrega(); return this.lista.map(x => JSON.parse(JSON.stringify(x))); },
    async criar(d) { await this.carrega(); await this.espera(); if (this.lista.some(x => x.id === d.id)) throw erro(`Já existe um produto com o código ${d.id}. Mude o nome ou o código.`); const r = Object.assign({}, d, { alterado_em: new Date().toISOString(), alterado_por: sessao.email }); this.lista.push(r); this.grava(); return JSON.parse(JSON.stringify(r)); },
    async alterar(id, d) { await this.carrega(); await this.espera(); const x = this.lista.find(y => y.id === id); Object.assign(x, d, { alterado_em: new Date().toISOString(), alterado_por: sessao.email }); this.grava(); return JSON.parse(JSON.stringify(x)); },
    async excluir(id) { await this.carrega(); await this.espera(); this.lista = this.lista.filter(y => y.id !== id); this.grava(); },
    async enviarFoto(caminho, blob) { await this.espera(); return URL.createObjectURL(blob); },
    async apagarFotos() { }
  };
  const api = DEMO ? demo : nuvem;

  // linhas, empresas e produtos atuais (painel/catalogo.json, gerado por build/gera-sql.js)
  let CAT_PROMESSA = null;
  function catalogo() { if (!CAT_PROMESSA) CAT_PROMESSA = fetch("/painel/catalogo.json", { cache: "no-cache" }).then(r => { if (!r.ok) throw 0; return r.json(); }).catch(() => ({ linhas: [], empresas: [], produtos: [] })); return CAT_PROMESSA; }

  // =====================================================================
  // utilidades de tela
  // =====================================================================
  function aviso(texto, o) {
    o = o || {};
    const box = $("#avisos"), el = document.createElement("div");
    $$(".aviso" + (o.erro ? ".erro" : ":not(.erro)"), box).forEach(a => a.remove());
    while (box.children.length > 1) box.firstChild.remove();
    el.className = "aviso" + (o.erro ? " erro" : "");
    el.innerHTML = (o.erro ? I.alerta : I.ok) + "<span>" + esc(texto) + "</span>" + (o.acao ? `<a href="#" role="button">${esc(o.acao)}</a>` : "") + (o.link ? `<a href="${esc(o.link[1])}" target="_blank" rel="noopener">${esc(o.link[0])}</a>` : "");
    if (o.acao) $("a[role=button]", el).addEventListener("click", e => { e.preventDefault(); el.remove(); o.fn(); });
    box.appendChild(el);
    setTimeout(() => el.remove(), o.tempo || (o.erro ? 7000 : 5200));
  }
  function dialogo({ titulo, texto, foto, corpo, botoes }) {
    return new Promise(resolve => {
      const veu = document.createElement("div"); veu.className = "veu";
      veu.innerHTML = `<div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="dlg-t">${foto ? `<div class="dfoto"><img src="${esc(foto)}" alt=""></div>` : ""}<div class="dcorpo"><h2 id="dlg-t">${esc(titulo)}</h2>${texto ? `<p>${texto}</p>` : ""}${corpo || ""}</div><div class="dacoes">${botoes.map((b, i) => `<button type="button" class="btn ${b.classe || "btn-linha"}${b.esq ? " esq" : ""}" data-i="${i}">${b.texto}</button>`).join("")}</div></div>`;
      const anterior = document.activeElement;
      const fecha = v => { veu.remove(); document.body.classList.remove("travada"); document.removeEventListener("keydown", tecla); if (anterior && anterior.focus) anterior.focus(); resolve(v); };
      const tecla = e => { if (e.key === "Escape") fecha(null); if (e.key === "Tab") { const f = $$("button,input,a[href]", veu); const p = f[0], u = f[f.length - 1]; if (e.shiftKey && document.activeElement === p) { e.preventDefault(); u.focus(); } else if (!e.shiftKey && document.activeElement === u) { e.preventDefault(); p.focus(); } } };
      veu.addEventListener("click", async e => {
        if (e.target === veu) return fecha(null);
        const b = e.target.closest("button[data-i]"); if (!b) return;
        const def = botoes[+b.dataset.i];
        if (def.antes) { b.classList.add("carregando"); const ok = await def.antes(veu).catch(er => { mostraErroDialogo(veu, er.message); return false; }); b.classList.remove("carregando"); if (!ok) return; }
        fecha(def.valor);
      });
      document.addEventListener("keydown", tecla);
      document.body.appendChild(veu); document.body.classList.add("travada");
      const foco = $("input", veu) || $$("button[data-i]", veu).slice(-1)[0]; if (foco) foco.focus();
    });
  }
  function mostraErroDialogo(veu, msg) { let m = $(".msg-erro", veu); if (!m) { m = document.createElement("div"); m.className = "msg msg-erro"; m.style.marginTop = "14px"; $(".dcorpo", veu).appendChild(m); } m.textContent = msg; }
  const dataBR = s => { if (!s) return ""; const d = new Date(s.length <= 10 ? s + "T12:00:00" : s); return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined }); };
  const inicial = s => (s || "?").trim().charAt(0);
  const senhaBoa = s => s.length >= 8 && /[A-Za-zÀ-ÿ]/.test(s) && /\d/.test(s);
  function trataErro(er) {
    if (er.sessao) { aviso(er.message, { erro: true }); E.ed = null; return telaEntrada(er.message); }
    aviso(er.message || "Algo deu errado. Tente de novo.", { erro: true });
  }

  // =====================================================================
  // estado
  // =====================================================================
  const E = { lista: [], linhas: [], empresas: [], equipe: null, filtro: { vis: "ativo", linha: "", busca: "" }, ed: null, carregou: false };
  try { const f = JSON.parse(sessionStorage.getItem("larssen-painel-filtro") || "null"); if (f) Object.assign(E.filtro, f); } catch (e) { }
  const guardaFiltro = () => { try { sessionStorage.setItem("larssen-painel-filtro", JSON.stringify(E.filtro)); } catch (e) { } };
  const linhaDe = id => E.linhas.find(l => l.id === id) || { id, nome: id, empresa: "" };
  const empresaDe = id => E.empresas.find(e => e.id === id) || { id, nome: "", curto: "" };
  const arr = a => Array.isArray(a) ? a.map(x => String(x)).filter(x => x.trim()) : [];
  function registro(r) {
    return { id: r.id, linha: r.linha || "", nome: r.nome || "", uso: r.uso || "", madeira: r.madeira || "", bitolas: arr(r.bitolas), carimbos: arr(r.carimbos), foto: r.foto || "", fotos: arr(r.fotos), descricao: r.descricao || "", destaque: +r.destaque || 0, ativo: r.ativo !== false, ordem: +r.ordem || 0, alterado_em: r.alterado_em || null, alterado_por: r.alterado_por || null };
  }

  // =====================================================================
  // entrada, senha nova e sem acesso
  // =====================================================================
  function ladoMarca(frase) {
    const itens = [[I.mais, "Cadastre produtos com fotos, bitolas e etapas"], [I.editar, "Edite qualquer informação quando quiser"], [I.olhoNao, "Tire do site o que não está vendendo"], [I.estrela, "Escolha os destaques da página inicial"]];
    return `<div class="entrada-marca">
    <div class="placa-logo">${LOGO}</div>
    <div class="miolo-marca"><span class="rotulo-marca">Painel de produtos</span><b>${esc(frase)}</b>
      <ul>${itens.map(([i, t]) => `<li><span class="ic">${i}</span>${t}</li>`).join("")}</ul></div>
    <p class="pe-marca">O site muda na hora em que você salva.<br>Grupo Larssen · Três Passos/RS</p>
  </div>`;
  }
  function telaEntrada(msg, tipoMsg) {
    document.title = "Entrar · Painel Grupo Larssen";
    app.innerHTML = `${DEMO ? '<div class="demo-faixa">Modo demonstração: nada aqui vai para o site. Use qualquer e-mail e senha.</div>' : ""}
<main class="entrada">
  ${ladoMarca("O catálogo do Grupo Larssen, atualizado por quem conhece cada peça.")}
  <div class="entrada-miolo">
    <div class="entrada-cartao">
      ${LOGO.replace('class="logo-svg"', 'class="logo-svg logo"')}
      <h1>Painel de produtos</h1>
      <p class="sub">Entre com o e-mail e a senha da sua conta.</p>
      <form id="f-entrar" novalidate>
        ${msg ? `<div class="msg msg-${tipoMsg || "erro"}" role="alert">${esc(msg)}</div>` : ""}
        <div class="campo"><label for="e-email">E-mail</label><input class="ent" id="e-email" type="email" autocomplete="username" inputmode="email" required></div>
        <div class="campo"><label for="e-senha">Senha</label><div class="senha-caixa"><input class="ent" id="e-senha" type="password" autocomplete="current-password" required><button class="ico-btn" type="button" id="ver-senha" aria-label="Mostrar senha" aria-pressed="false">${I.olho}</button></div></div>
        <button class="btn btn-azul" type="submit" id="b-entrar">Entrar</button>
        <div class="linha-fim"><a class="link" href="#" id="esqueci">Esqueci minha senha</a></div>
      </form>
      <p class="entrada-rodape">Grupo Larssen · Três Passos/RS</p>
    </div>
  </div>
</main>`;
    const f = $("#f-entrar"), em = $("#e-email"), se = $("#e-senha");
    const ultimo = guarda.get("larssen-painel-email"); if (ultimo) { em.value = ultimo; } (ultimo ? se : em).focus();
    $("#ver-senha").addEventListener("click", e => { const b = e.currentTarget, v = se.type === "password"; se.type = v ? "text" : "password"; b.setAttribute("aria-pressed", v); b.setAttribute("aria-label", v ? "Esconder senha" : "Mostrar senha"); b.innerHTML = v ? I.olhoNao : I.olho; });
    f.addEventListener("submit", async e => {
      e.preventDefault();
      const email = em.value.trim(), senha = se.value;
      if (!/^\S+@\S+\.\S+$/.test(email)) return mensagemEntrada("Digite o seu e-mail completo.", em);
      if (!senha) return mensagemEntrada("Digite a sua senha.", se);
      const b = $("#b-entrar"); b.classList.add("carregando"); b.disabled = true;
      try { await api.entrar(email, senha); guarda.set("larssen-painel-email", email); await iniciaSessao(); }
      catch (er) { b.classList.remove("carregando"); b.disabled = false; mensagemEntrada(er.message, se); }
    });
    $("#esqueci").addEventListener("click", async e => {
      e.preventDefault();
      const r = await dialogo({ titulo: "Criar uma senha nova", texto: "Enviamos um link para o seu e-mail. Pelo link você escolhe a senha nova.", corpo: `<div class="campo"><label for="d-email">E-mail</label><input class="ent" id="d-email" type="email" autocomplete="username" value="${esc(em.value.trim())}"></div>`, botoes: [{ texto: "Cancelar", valor: null }, { texto: "Enviar link", classe: "btn-azul", valor: "ok", antes: async veu => { const v = $("#d-email", veu).value.trim(); if (!/^\S+@\S+\.\S+$/.test(v)) { mostraErroDialogo(veu, "Digite o seu e-mail completo."); return false; } await api.recuperar(v); return true; } }] });
      if (r) telaEntrada("Pronto. Se o e-mail estiver cadastrado, o link chega em alguns minutos (confira também o spam).", "ok");
    });
  }
  function mensagemEntrada(t, campo) {
    let m = $("#f-entrar .msg"); if (!m) { m = document.createElement("div"); m.setAttribute("role", "alert"); $("#f-entrar").prepend(m); }
    m.className = "msg msg-erro"; m.textContent = t; if (campo) campo.focus();
  }
  function telaNovaSenha(tipo) {
    document.title = "Nova senha · Painel Grupo Larssen";
    app.innerHTML = `<main class="entrada">${ladoMarca(tipo === "invite" ? "Boas-vindas ao painel do Grupo Larssen." : "Vamos criar uma senha nova.")}
  <div class="entrada-miolo"><div class="entrada-cartao">
    ${LOGO.replace('class="logo-svg"', 'class="logo-svg logo"')}
    <h1>${tipo === "invite" ? "Crie a sua senha" : "Senha nova"}</h1>
    <p class="sub">${esc(sessao && sessao.email || "")}</p>
    <form id="f-senha" novalidate>
      <div class="campo"><label for="s1">Senha nova</label><input class="ent" id="s1" type="password" autocomplete="new-password" minlength="8" required><span class="dica">Pelo menos 8 caracteres, com letras e números.</span></div>
      <div class="campo"><label for="s2">Repita a senha</label><input class="ent" id="s2" type="password" autocomplete="new-password" required></div>
      <button class="btn btn-azul" type="submit" id="b-senha">Salvar e entrar</button>
    </form></div></div></main>`;
    $("#s1").focus();
    $("#f-senha").addEventListener("submit", async e => {
      e.preventDefault();
      const a = $("#s1").value, b = $("#s2").value, msg = t => { let m = $("#f-senha .msg"); if (!m) { m = document.createElement("div"); m.className = "msg msg-erro"; m.setAttribute("role", "alert"); $("#f-senha").prepend(m); } m.textContent = t; };
      if (!senhaBoa(a)) return msg("A senha precisa ter pelo menos 8 caracteres, com letras e números.");
      if (a !== b) return msg("As duas senhas não estão iguais.");
      const bt = $("#b-senha"); bt.classList.add("carregando"); bt.disabled = true;
      try { await api.novaSenha(a); aviso("Senha salva."); await iniciaSessao(); }
      catch (er) { bt.classList.remove("carregando"); bt.disabled = false; if (er.sessao) return telaEntrada(er.message); msg(er.message); }
    });
  }
  function telaSemAcesso() {
    app.innerHTML = `<main class="entrada" style="grid-template-columns:1fr"><div class="entrada-miolo" style="align-items:center"><div class="entrada-cartao">
      ${LOGO.replace('class="logo-svg"', 'class="logo-svg logo"')}
      <h1>Acesso ainda não liberado</h1>
      <p class="sub" style="margin-top:12px">Você entrou como <b>${esc(sessao && sessao.email)}</b>, mas este e-mail ainda não está na equipe do painel. Peça para o responsável pelo site incluir o seu e-mail e entre de novo.</p>
      <form style="margin-top:24px"><button class="btn btn-linha" type="button" id="b-sair">Sair e entrar com outro e-mail</button></form>
    </div></div></main>`;
    $("#b-sair").addEventListener("click", async () => { await api.sair(); telaEntrada(); });
  }

  // =====================================================================
  // casca (topo) e rotas
  // =====================================================================
  function casca(conteudo) {
    const nome = (E.equipe && E.equipe.nome) || (sessao && sessao.email) || "";
    return `${DEMO ? '<div class="demo-faixa">Modo demonstração: as alterações ficam só neste navegador e não vão para o site.</div>' : ""}
<header class="topo">
  <a class="marca" href="#" data-ir="">${LOGO}<span>Painel de produtos</span></a>
  <div class="espaco"></div>
  <a class="btn btn-fantasma ver-site" href="${SITE_PUB}/produtos.html?fresco=1" target="_blank" rel="noopener">${I.externo}<span>Ver o site</span></a>
  <div class="usuario"><button type="button" id="b-usuario" aria-haspopup="menu" aria-expanded="false"><span class="avatar">${esc(inicial(nome))}</span><span class="nome">${esc(nome)}</span></button></div>
</header>
<main class="pagina" id="pagina">${conteudo}</main>`;
  }
  function ligaCasca() {
    $$("[data-ir]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); vai(a.dataset.ir); }));
    const b = $("#b-usuario");
    b.addEventListener("click", e => {
      e.stopPropagation();
      const aberto = $(".usuario .menu"); if (aberto) { aberto.remove(); b.setAttribute("aria-expanded", "false"); return; }
      const m = document.createElement("div"); m.className = "menu"; m.setAttribute("role", "menu");
      m.innerHTML = `<div class="cab"><b>${esc((E.equipe && E.equipe.nome) || "Conta")}</b>${esc(sessao && sessao.email)}</div><button type="button" role="menuitem" data-a="senha">${I.chave}Trocar minha senha</button><a role="menuitem" href="${SITE_PUB}/produtos.html?fresco=1" target="_blank" rel="noopener">${I.externo}Abrir o site</a><hr><button type="button" role="menuitem" data-a="sair" class="perigo">${I.sair}Sair</button>`;
      b.parentNode.appendChild(m); b.setAttribute("aria-expanded", "true");
      m.addEventListener("click", async ev => {
        const a = ev.target.closest("[data-a]"); if (!a) return; m.remove(); b.setAttribute("aria-expanded", "false");
        if (a.dataset.a === "sair") { if (sujo() && !(await confirmaDescartar())) return; await api.sair(); E.ed = null; history.replaceState(null, "", location.pathname + location.search); telaEntrada("Você saiu do painel.", "info"); }
        if (a.dataset.a === "senha") trocaSenha();
      });
    });
  }
  document.addEventListener("click", e => { if (!e.target.closest(".usuario")) { const m = $(".usuario .menu"); if (m) { m.remove(); const b = $("#b-usuario"); if (b) b.setAttribute("aria-expanded", "false"); } } });
  async function trocaSenha() {
    const r = await dialogo({ titulo: "Trocar minha senha", corpo: `<div class="campo"><label for="t1">Senha nova</label><input class="ent" id="t1" type="password" autocomplete="new-password"><span class="dica">Pelo menos 8 caracteres, com letras e números.</span></div><div class="campo"><label for="t2">Repita a senha nova</label><input class="ent" id="t2" type="password" autocomplete="new-password"></div>`, botoes: [{ texto: "Cancelar", valor: null }, { texto: "Salvar senha", classe: "btn-azul", valor: "ok", antes: async veu => { const a = $("#t1", veu).value, b = $("#t2", veu).value; if (!senhaBoa(a)) { mostraErroDialogo(veu, "A senha precisa ter pelo menos 8 caracteres, com letras e números."); return false; } if (a !== b) { mostraErroDialogo(veu, "As duas senhas não estão iguais."); return false; } await api.novaSenha(a); return true; } }] });
    if (r) aviso("Senha trocada.");
  }
  const sujo = () => !!(E.ed && E.ed.sujo);
  async function vai(h) {
    const atual = location.hash.slice(1);
    if (sujo() && h !== atual) { if (!(await confirmaDescartar())) return; if (E.ed) E.ed.sujo = false; }
    if (atual === h) return rota();
    location.hash = h;
  }
  async function confirmaDescartar() {
    const r = await dialogo({ titulo: "Sair sem salvar?", texto: "As alterações ainda não foram salvas.", botoes: [{ texto: "Continuar editando", valor: null }, { texto: "Descartar alterações", classe: "btn-perigo", valor: "sim" }] });
    if (r && E.ed) descartaEnvio(E.ed);
    return !!r;
  }
  let hashAnterior = location.hash;
  window.addEventListener("hashchange", async () => {
    if (/access_token=|error_description=/.test(location.hash)) return inicio();
    if (sujo() && location.hash !== hashAnterior) {
      const destino = location.hash;
      history.replaceState(null, "", hashAnterior || location.pathname + location.search);
      if (!(await confirmaDescartar())) return;
      if (E.ed) E.ed.sujo = false; history.replaceState(null, "", destino || location.pathname + location.search);
    }
    hashAnterior = location.hash; rota();
  });
  window.addEventListener("beforeunload", e => { if (sujo()) { e.preventDefault(); e.returnValue = ""; } });
  function rota() {
    if (!sessao) return telaEntrada();
    const h = location.hash.slice(1);
    E.ed = null;
    if (h === "novo") return editor(null);
    const m = /^editar\/([a-z0-9-]+)$/.exec(h);
    if (m) { const x = E.lista.find(y => y.id === m[1]); if (x) return editor(x); aviso("Produto não encontrado.", { erro: true }); history.replaceState(null, "", location.pathname + location.search); }
    telaLista();
  }

  // =====================================================================
  // lista de produtos
  // =====================================================================
  function filtrados() {
    const f = E.filtro, q = sem(f.busca).trim();
    return E.lista.filter(p => (f.vis === "todos" || (f.vis === "ativo" ? p.ativo : f.vis === "destaque" ? p.destaque > 0 : !p.ativo)) && (!f.linha || p.linha === f.linha) && (!q || sem([p.id, p.nome, p.uso, p.madeira, p.bitolas.join(" "), linhaDe(p.linha).nome].join(" ")).includes(q)))
      .sort((a, b) => f.vis === "destaque" ? a.destaque - b.destaque : (a.ordem - b.ordem) || a.nome.localeCompare(b.nome, "pt-BR"));
  }
  function contagem() {
    const c = { ativo: 0, oculto: 0, destaque: 0, todos: E.lista.length, semFoto: 0 };
    E.lista.forEach(p => { c[p.ativo ? "ativo" : "oculto"]++; if (p.destaque > 0) c.destaque++; if (!p.foto) c.semFoto++; });
    return c;
  }
  function telaLista() {
    document.title = "Produtos · Painel Grupo Larssen";
    const c = contagem();
    app.innerHTML = casca(`
<div class="cab-lista">
  <div><h1>Produtos</h1><div class="resumo-n"><span><b class="num">${c.ativo}</b> no site</span><span><b class="num">${c.oculto}</b> ocultos</span><span><b class="num">${c.destaque}</b> em destaque na página inicial</span>${c.semFoto ? `<span><b class="num">${c.semFoto}</b> sem foto</span>` : ""}</div></div>
  <a class="btn btn-azul" href="#novo" data-ir="novo">${I.mais}Novo produto</a>
</div>
<div class="barra" role="search">
  <label class="busca"><span class="so-leitor">Buscar produto</span>${I.busca}<input class="ent" id="l-busca" type="search" placeholder="Buscar por nome, madeira, bitola ou código" value="${esc(E.filtro.busca)}" autocomplete="off"></label>
  <div class="seg" role="group" aria-label="Visibilidade">${[["ativo", "No site"], ["oculto", "Ocultos"], ["destaque", "Destaques"], ["todos", "Todos"]].map(([v, t]) => `<button type="button" data-vis="${v}" aria-pressed="${E.filtro.vis === v}">${t}<span class="n num">${c[v]}</span></button>`).join("")}</div>
  <select class="ent" id="l-linha" aria-label="Linha de produto"><option value="">Todas as linhas</option>${E.linhas.map(l => `<option value="${esc(l.id)}"${E.filtro.linha === l.id ? " selected" : ""}>${esc(l.nome)}</option>`).join("")}</select>
</div>
<div class="grade" id="grade"></div>`);
    ligaCasca(); pintaGrade();
    $("#l-busca").addEventListener("input", e => { E.filtro.busca = e.target.value; guardaFiltro(); pintaGrade(); });
    $$(".barra .seg button").forEach(b => b.addEventListener("click", () => { E.filtro.vis = b.dataset.vis; guardaFiltro(); $$(".barra .seg button").forEach(x => x.setAttribute("aria-pressed", x === b)); pintaGrade(); }));
    $("#l-linha").addEventListener("change", e => { E.filtro.linha = e.target.value; guardaFiltro(); pintaGrade(); });
    $("#grade").addEventListener("click", cliqueGrade);
  }
  function cartao(p) {
    const l = linhaDe(p.linha);
    return `<article class="cartao${p.ativo ? "" : " esmaecido"}" data-id="${esc(p.id)}">
  <div class="foto" data-editar><img src="${esc(fotoUrl(p.foto, "p"))}" alt="" loading="lazy" decoding="async"><span class="ref">${esc(l.nome)}</span></div>
  <div class="corpo">
    <div class="linha1">${p.ativo ? '<span class="etiqueta et-ok">No site</span>' : '<span class="etiqueta et-oculto">Oculto</span>'}${p.destaque > 0 ? `<span class="etiqueta et-destaque">Destaque ${p.destaque}</span>` : ""}</div>
    <h3 data-editar>${esc(p.nome)}</h3>
    <div class="alterado">${esc(p.madeira)}${p.uso ? " · " + esc(p.uso) : ""}</div>
    <div class="alterado">${p.bitolas.length} ${p.bitolas.length === 1 ? "bitola" : "bitolas"}${p.alterado_em ? " · alterado em " + dataBR(p.alterado_em) + (p.alterado_por ? " por " + esc(p.alterado_por.split("@")[0]) : "") : ""}</div>
  </div>
  <div class="acoes"><a class="btn btn-linha" href="#editar/${esc(p.id)}" data-editar-link>${I.editar}Editar</a><button type="button" class="btn btn-linha mais" data-dest-toggle aria-label="${p.destaque > 0 ? "Tirar dos destaques" : "Colocar em destaque"}" title="${p.destaque > 0 ? "Tirar dos destaques da página inicial" : "Colocar em destaque na página inicial"}" aria-pressed="${p.destaque > 0}">${p.destaque > 0 ? I.estrelaCheia : I.estrela}</button><button type="button" class="btn btn-linha mais" data-vis-toggle aria-label="${p.ativo ? "Ocultar do site" : "Mostrar no site"}" title="${p.ativo ? "Ocultar do site" : "Mostrar no site"}">${p.ativo ? I.olhoNao : I.olho}</button></div>
</article>`;
  }
  function pintaGrade() {
    const g = $("#grade"); if (!g) return;
    const l = filtrados();
    g.innerHTML = l.length ? l.map(cartao).join("") : `<div class="vazio">${I.busca}<h3>Nenhum produto com esses filtros.</h3><p>Tente outra busca ou veja <button type="button" class="link" data-limpa>todos os produtos</button>.</p></div>`;
  }
  async function cliqueGrade(e) {
    if (e.target.closest("[data-limpa]")) { E.filtro = { vis: "todos", linha: "", busca: "" }; guardaFiltro(); return telaLista(); }
    const c = e.target.closest(".cartao"); if (!c) return;
    const p = E.lista.find(y => y.id === c.dataset.id); if (!p) return;
    if (e.target.closest("[data-editar-link]")) { e.preventDefault(); return vai("editar/" + p.id); }
    if (e.target.closest("[data-vis-toggle]")) return alternaVisivel(p);
    if (e.target.closest("[data-dest-toggle]")) return alternaDestaque(p);
    if (e.target.closest("[data-editar]")) return vai("editar/" + p.id);
  }
  async function alternaVisivel(p, semDesfazer) {
    const antes = p.ativo;
    try {
      const novo = await api.alterar(p.id, { ativo: !antes }); Object.assign(p, registro(novo));
      if ($("#grade")) telaLista();
      aviso(antes ? `${p.nome} saiu do site.` : `${p.nome} voltou para o site.`, semDesfazer ? {} : { acao: "Desfazer", fn: () => alternaVisivel(p, true) });
    } catch (er) { trataErro(er); }
  }
  const MAX_DEST = 8;
  async function alternaDestaque(p) {
    try {
      if (p.destaque > 0) {
        const novo = await api.alterar(p.id, { destaque: 0 }); Object.assign(p, registro(novo));
        aviso(`${p.nome} saiu dos destaques da página inicial.`);
      } else {
        const marcados = E.lista.filter(x => x.destaque > 0);
        if (marcados.length >= MAX_DEST) { aviso(`A página inicial mostra até ${MAX_DEST} destaques. Tire um antes de colocar outro.`, { erro: true }); return; }
        const pos = marcados.reduce((m, x) => Math.max(m, x.destaque), 0) + 1;
        const novo = await api.alterar(p.id, { destaque: pos, ativo: true }); Object.assign(p, registro(novo));
        aviso(`${p.nome} entrou nos destaques da página inicial.`);
      }
      if ($("#grade")) telaLista();
    } catch (er) { trataErro(er); }
  }

  // =====================================================================
  // editor
  // =====================================================================
  function editor(p) {
    const novo = !p;
    const d = novo ? { id: "", linha: E.filtro.linha || (E.linhas[0] || {}).id || "", nome: "", uso: "", madeira: "", bitolas: [""], carimbos: [], foto: "", fotos: [], descricao: "", destaque: 0, ativo: true, ordem: E.lista.reduce((m, x) => Math.max(m, x.ordem), 0) + 10 }
      : JSON.parse(JSON.stringify(p));
    if (!d.bitolas.length) d.bitolas = [""];
    E.ed = { novo, orig: p, d, idManual: false, fotoNova: null, extrasNovas: [], enviadas: [], removidas: [], sujo: false };
    desenhaEditor();
  }
  function desenhaEditor() {
    const ed = E.ed, d = ed.d;
    document.title = (ed.novo ? "Novo produto" : d.nome) + " · Painel Grupo Larssen";
    const fotoPrev = ed.fotoNova ? ed.fotoNova.prev : fotoUrl(d.foto, "g");
    app.innerHTML = casca(`
<div class="ed-cab">
  <a class="btn btn-fantasma voltar" href="#" data-ir="">${I.seta}Produtos</a>
  <h1>${ed.novo ? "Novo produto" : esc(d.nome)}</h1>
  <div class="espaco"></div>
  ${!ed.novo && ed.orig.ativo ? `<a class="btn btn-linha ver" href="${esc(linkSite(d.id))}" target="_blank" rel="noopener">${I.externo}Ver no site</a>` : ""}
</div>
<form id="f-ed" novalidate>
<div class="ed-grade">
  <div class="blocos">
    <section class="bloco"><h2><span class="n">1</span>Fotos</h2><p class="sub">A primeira foto é a capa do produto no catálogo. Fotos na horizontal, com boa luz, mostram melhor a madeira.</p>
      <div class="conteudo"><div class="foto-ed"><div class="foto-prev" id="foto-prev"><img src="${esc(fotoPrev)}" alt="">${ed.fotoNova && ed.fotoNova.estado === "enviando" ? '<div class="progresso">Enviando…</div>' : ed.fotoNova && ed.fotoNova.estado === "erro" ? '<div class="progresso erro">' + esc(ed.fotoNova.erro) + '</div>' : ""}</div>
        <div class="foto-acoes"><label class="solta" id="solta">${I.envia}<b>${d.foto || ed.fotoNova ? "Trocar a foto de capa" : "Escolher a foto de capa"}</b><span>ou arraste o arquivo · JPG, PNG ou WEBP</span><input type="file" id="arq" accept="image/*"></label></div></div>
        <div class="campo"><label>Outras fotos <span class="dica" style="display:inline">(aparecem embaixo da capa, na ficha do produto)</span></label>
          <div class="extras-ed" id="extras">${d.fotos.map((f, i) => `<div class="extra"><img src="${esc(fotoUrl(f, "p"))}" alt=""><button type="button" data-tira-extra="${i}" aria-label="Tirar a foto ${i + 1}">${I.x}</button></div>`).join("")}${ed.extrasNovas.filter(x => x.estado !== "ok").map(x => `<div class="extra"><img src="${esc(x.prev)}" alt=""><div class="progresso${x.estado === "erro" ? " erro" : ""}">${x.estado === "erro" ? esc(x.erro) : "Enviando…"}</div></div>`).join("")}${d.fotos.length < 12 ? `<label class="solta-mini">${I.mais}<span>Incluir fotos</span><input type="file" id="arq-extra" accept="image/*" multiple></label>` : ""}</div></div>
      </div>
    </section>
    <section class="bloco"><h2><span class="n">2</span>Produto</h2>
      <div class="conteudo">
        <div class="campo"><label for="c-nome">Nome</label><input class="ent" id="c-nome" value="${esc(d.nome)}" maxlength="120" placeholder="Ex.: Mourões tratados"></div>
        <div class="linha"><div class="campo"><label for="c-linha">Linha</label><select class="ent" id="c-linha">${E.linhas.map(l => `<option value="${esc(l.id)}"${d.linha === l.id ? " selected" : ""}>${esc(l.nome)} · ${esc(empresaDe(l.empresa).curto)}</option>`).join("")}</select></div>
          <div class="campo"><label for="c-id">Código</label><input class="ent" id="c-id" value="${esc(d.id)}" maxlength="60" spellcheck="false"${ed.novo ? "" : " readonly aria-readonly=\"true\""}><span class="dica">${ed.novo ? "Montado sozinho pelo nome. É o endereço do produto no site." : "O código não muda depois de criado."}</span></div></div>
        <div class="linha"><div class="campo"><label for="c-uso">Uso</label><input class="ent" id="c-uso" value="${esc(d.uso)}" maxlength="200" placeholder="Ex.: Cercas, currais e parreirais"></div>
          <div class="campo"><label for="c-madeira">Madeira</label><input class="ent" id="c-madeira" value="${esc(d.madeira)}" maxlength="120" placeholder="Ex.: Eucalipto tratado em autoclave" list="madeiras"><datalist id="madeiras">${[...new Set(E.lista.map(x => x.madeira).filter(Boolean))].map(m => `<option value="${esc(m)}">`).join("")}</datalist></div></div>
        <div class="campo"><label for="c-desc">Descrição <span class="dica" style="display:inline">(opcional)</span></label><textarea class="ent" id="c-desc" rows="4" maxlength="3000" placeholder="Detalhes que ajudam o cliente: acabamento, aplicação, cuidados…">${esc(d.descricao)}</textarea></div>
      </div></section>
    <section class="bloco"><h2><span class="n">3</span>Bitolas e medidas</h2><p class="sub">Uma medida por linha, como aparece na ficha. As três primeiras aparecem no cartão do catálogo.</p>
      <div class="conteudo">
        <div class="bitolas-ed" id="bitolas">${d.bitolas.map((b, i) => linhaBitola(b, i)).join("")}</div>
        <button type="button" class="btn btn-linha" id="b-bitola" style="align-self:flex-start">${I.mais}Incluir medida</button>
      </div></section>
    <section class="bloco"><h2><span class="n">4</span>Etapas da rota</h2><p class="sub">Por onde o produto passa. Vira os carimbos do cartão e a linha do tempo da ficha.</p>
      <div class="conteudo"><div class="etapas-ed" id="etapas">${ETAPAS.map(([k, n]) => `<button type="button" class="etapa" data-etapa="${k}" aria-pressed="${d.carimbos.includes(k)}">${n}</button>`).join("")}</div></div></section>
    <section class="bloco"><h2><span class="n">5</span>No site</h2>
      <div class="conteudo">
        <label class="interruptor"><input type="checkbox" id="c-ativo"${d.ativo ? " checked" : ""}><span>Mostrar este produto no site</span></label>
        <label class="interruptor"><input type="checkbox" id="c-dest"${d.destaque > 0 ? " checked" : ""}><span>Destaque na página inicial</span></label>
        <div class="campo" style="max-width:220px"><label for="c-ordem">Posição no catálogo</label><input class="ent num" id="c-ordem" type="number" min="0" value="${d.ordem}"><span class="dica">Menor número aparece primeiro na linha.</span></div>
      </div></section>
  </div>
  <aside class="lateral" aria-label="Prévia"><div class="previa" id="previa"></div><div class="lista-ok" id="lista-ok"></div></aside>
</div>
<div class="rodape-ed">
  ${ed.novo ? "" : `<button type="button" class="btn btn-perigo-texto" id="b-excluir">${I.lixo}<span>Excluir</span></button>`}
  <div class="estado" id="estado" aria-live="polite">${ed.novo ? "Preencha e publique." : "Tudo salvo."}</div>
  <a class="btn btn-linha" href="#" data-ir="">Cancelar</a>
  <button type="submit" class="btn btn-azul" id="b-salvar">${ed.novo ? "Publicar produto" : "Salvar alterações"}</button>
</div>
</form>`);
    ligaCasca(); ligaEditor(); pintaPrevia(); if (ed.sujo) marcaSujo(true);
  }
  function linhaBitola(b, i) { return `<div class="bitola" data-i="${i}"><input class="ent" data-bit value="${esc(b)}" maxlength="160" placeholder="Ex.: 0,10 a 0,12 × 2,20 m" aria-label="Medida ${i + 1}"><button type="button" class="ico-btn" data-tira-bit="${i}" aria-label="Tirar a medida ${i + 1}">${I.x}</button></div>`; }
  function marcaSujo(v) { if (!E.ed) return; if (v !== undefined) E.ed.sujo = v; const e = $("#estado"); if (!e) return; const env = (E.ed.fotoNova && E.ed.fotoNova.estado === "enviando") || E.ed.extrasNovas.some(x => x.estado === "enviando"); e.className = "estado" + (E.ed.sujo ? " sujo" : ""); e.textContent = env ? "Enviando foto…" : E.ed.sujo ? "Alterações não salvas" : (E.ed.novo ? "Preencha e publique." : "Tudo salvo."); }
  function ligaEditor() {
    const ed = E.ed, d = ed.d, f = $("#f-ed");
    const muda = () => { marcaSujo(true); pintaPrevia(); };
    $("#c-nome").addEventListener("input", e => { d.nome = e.target.value; if (ed.novo && !ed.idManual) { d.id = idLivre(slug(d.nome)); $("#c-id").value = d.id; } muda(); });
    $("#c-id").addEventListener("input", e => { if (!ed.novo) return; e.target.value = slug(e.target.value); d.id = e.target.value; ed.idManual = true; muda(); });
    [["c-uso", "uso"], ["c-madeira", "madeira"], ["c-desc", "descricao"]].forEach(([id, k]) => $("#" + id).addEventListener("input", e => { d[k] = e.target.value; muda(); }));
    $("#c-linha").addEventListener("change", e => { d.linha = e.target.value; muda(); });
    $("#c-ordem").addEventListener("input", e => { d.ordem = parseInt(e.target.value, 10) || 0; muda(); });
    $("#c-ativo").addEventListener("change", e => { d.ativo = e.target.checked; muda(); });
    $("#c-dest").addEventListener("change", e => {
      if (e.target.checked) { const m = E.lista.filter(x => x.destaque > 0 && x.id !== d.id); if (m.length >= MAX_DEST) { e.target.checked = false; return aviso(`A página inicial mostra até ${MAX_DEST} destaques. Tire um antes de colocar outro.`, { erro: true }); } d.destaque = m.reduce((mx, x) => Math.max(mx, x.destaque), 0) + 1; }
      else d.destaque = 0; muda();
    });
    const bt = $("#bitolas");
    bt.addEventListener("input", e => { const l = e.target.closest(".bitola"); if (!l) return; d.bitolas[+l.dataset.i] = e.target.value; muda(); });
    bt.addEventListener("click", e => { const b = e.target.closest("[data-tira-bit]"); if (!b) return; d.bitolas.splice(+b.dataset.tiraBit, 1); if (!d.bitolas.length) d.bitolas.push(""); bt.innerHTML = d.bitolas.map(linhaBitola).join(""); muda(); });
    bt.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.matches("[data-bit]")) { e.preventDefault(); $("#b-bitola").click(); } });
    $("#b-bitola").addEventListener("click", () => { if (d.bitolas.length >= 30) return; d.bitolas.push(""); bt.innerHTML = d.bitolas.map(linhaBitola).join(""); const l = $$("#bitolas [data-bit]"); l[l.length - 1].focus(); muda(); });
    $("#etapas").addEventListener("click", e => { const b = e.target.closest("[data-etapa]"); if (!b) return; const k = b.dataset.etapa, i = d.carimbos.indexOf(k); if (i >= 0) d.carimbos.splice(i, 1); else d.carimbos.push(k); d.carimbos.sort((a, c) => ETAPAS.findIndex(x => x[0] === a) - ETAPAS.findIndex(x => x[0] === c)); b.setAttribute("aria-pressed", i < 0); muda(); });
    const arq = $("#arq"), solta = $("#solta");
    arq.addEventListener("change", () => { if (arq.files[0]) recebeFoto(arq.files[0]); arq.value = ""; });
    ["dragenter", "dragover"].forEach(t => solta.addEventListener(t, e => { e.preventDefault(); solta.classList.add("sobre"); }));
    ["dragleave", "drop"].forEach(t => solta.addEventListener(t, e => { e.preventDefault(); solta.classList.remove("sobre"); }));
    solta.addEventListener("drop", e => { if (e.dataTransfer && e.dataTransfer.files[0]) recebeFoto(e.dataTransfer.files[0]); });
    const ax = $("#arq-extra"); if (ax) ax.addEventListener("change", () => { Array.from(ax.files).slice(0, 12 - d.fotos.length).forEach(recebeExtra); ax.value = ""; });
    $("#extras").addEventListener("click", e => { const b = e.target.closest("[data-tira-extra]"); if (!b) return; const u = d.fotos.splice(+b.dataset.tiraExtra, 1)[0]; if (u) ed.removidas.push(u); muda(); desenhaEditor(); });
    const bx = $("#b-excluir"); if (bx) bx.addEventListener("click", () => excluir(ed.orig));
    f.addEventListener("submit", e => { e.preventDefault(); salva(); });
    f.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); salva(); } });
  }
  function idLivre(base) { if (!base) return ""; let id = base, n = 2; while (E.lista.some(p => p.id === id)) id = base + "-" + n++; return id; }
  function pintaPrevia() {
    const ed = E.ed; if (!ed) return; const d = ed.d, pv = $("#previa"), ok = $("#lista-ok"); if (!pv) return;
    const l = linhaDe(d.linha), e = empresaDe(l.empresa), bit = d.bitolas.filter(b => b.trim());
    const src = ed.fotoNova ? ed.fotoNova.prev : fotoUrl(d.foto, "p");
    pv.innerHTML = `<div class="rot">Como aparece no catálogo</div><div class="pfoto"><img src="${esc(src)}" alt=""><span class="tipo">${esc(l.nome)}</span></div><div class="pcorpo"><h3>${esc(d.nome || "Nome do produto")}</h3><div class="uso">${esc(d.uso || "Uso do produto")}</div>${bit.length ? `<ul class="bit">${bit.slice(0, 3).map(b => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}${d.carimbos.length ? `<div class="carimbos">${d.carimbos.map(c => `<span>${(ETAPAS.find(x => x[0] === c) || [c, c])[1]}</span>`).join("")}</div>` : ""}<div class="specs"><span>${esc(d.madeira || "Madeira")}</span><span>${esc(e.curto)}</span></div></div>`;
    const itens = [[!!(d.foto || ed.fotoNova), "Foto de capa"], [d.nome.trim().length >= 2, "Nome"], [d.uso.trim().length >= 3, "Uso"], [d.madeira.trim().length >= 3, "Madeira"], [bit.length > 0, "Bitolas"], [d.carimbos.length > 0, "Etapas"]];
    ok.innerHTML = `<h3>Produto completo</h3><ul>${itens.map(([v, t]) => `<li class="${v ? "ok" : ""}"><i></i>${t}</li>`).join("")}</ul>`;
  }

  // ---------- fotos: reduz e envia ----------
  async function abreImagem(file) {
    if (window.createImageBitmap) { try { return await createImageBitmap(file, { imageOrientation: "from-image" }); } catch (e) { } }
    return new Promise((ok, falha) => { const u = URL.createObjectURL(file), i = new Image(); i.onload = () => ok(i); i.onerror = () => falha(new Error("formato")); i.src = u; });
  }
  function desenhaFoto(img, lado) {
    const k = Math.min(1, lado / Math.max(img.width, img.height)), w = Math.max(1, Math.round(img.width * k)), h = Math.max(1, Math.round(img.height * k));
    const cv = document.createElement("canvas"); cv.width = w; cv.height = h; const cx = cv.getContext("2d"); cx.imageSmoothingQuality = "high"; cx.drawImage(img, 0, 0, w, h); return cv;
  }
  const paraBlob = (cv, tipo, q) => new Promise(ok => cv.toBlob(ok, tipo, q));
  async function preparaFoto(file) {
    const img = await abreImagem(file); if (!img.width || !img.height) throw new Error("formato");
    let g = await paraBlob(desenhaFoto(img, 1600), "image/webp", 0.84), ext = "webp";
    if (!g || g.type !== "image/webp") { g = await paraBlob(desenhaFoto(img, 1600), "image/jpeg", 0.86); ext = "jpg"; }
    const p = await paraBlob(desenhaFoto(img, 640), ext === "webp" ? "image/webp" : "image/jpeg", 0.8);
    if (img.close) img.close(); return { g, p, ext };
  }
  const tipoOk = file => /^image\//.test(file.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);
  const msgFoto = (er, file) => er.message === "formato" ? (/hei[cf]$/i.test(file.name) ? "HEIC: no iPhone, envie como JPG" : "Arquivo não é uma foto válida") : er.message || "Não subiu";
  async function sobe(ed, file) {
    const { g, p, ext } = await preparaFoto(file);
    const id = ed.d.id || slug(ed.d.nome) || "novo";
    const nome = id + "/" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const urlG = await api.enviarFoto(nome + "-g." + ext, g); await api.enviarFoto(nome + "-p." + ext, p);
    ed.enviadas.push(urlG); return urlG;
  }
  function recebeFoto(file) {
    const ed = E.ed; if (!ed) return;
    if (!tipoOk(file)) return aviso("Escolha um arquivo de foto (JPG, PNG ou WEBP).", { erro: true });
    const item = { prev: URL.createObjectURL(file), estado: "enviando", url: null }; ed.fotoNova = item; marcaSujo(true); desenhaEditor();
    (async () => {
      try { item.url = await sobe(ed, file); item.estado = "ok"; } catch (er) { item.estado = "erro"; item.erro = msgFoto(er, file); }
      if (E.ed === ed) desenhaEditor();
    })();
  }
  function recebeExtra(file) {
    const ed = E.ed; if (!ed || !tipoOk(file)) return;
    const item = { prev: URL.createObjectURL(file), estado: "enviando" }; ed.extrasNovas.push(item); marcaSujo(true); desenhaEditor();
    (async () => {
      try { const u = await sobe(ed, file); item.estado = "ok"; ed.d.fotos.push(u); } catch (er) { item.estado = "erro"; item.erro = msgFoto(er, file); }
      if (E.ed === ed) desenhaEditor();
    })();
  }
  function descartaEnvio(ed) { const sobra = ed.enviadas.filter(u => u !== ed.d.foto && !ed.d.fotos.includes(u)); const todas = ed.salvo ? sobra : ed.enviadas; if (todas.length) api.apagarFotos(todas).catch(() => { }); ed.enviadas = []; }

  // ---------- salvar e excluir ----------
  let salvando = false;
  async function salva() {
    const ed = E.ed; if (!ed || salvando) return; const d = ed.d;
    const problema = (id, t) => { const el = $("#" + id); if (el) { el.classList.add("invalido"); el.focus(); el.scrollIntoView({ block: "center", behavior: "smooth" }); } aviso(t, { erro: true }); return false; };
    if (ed.fotoNova && ed.fotoNova.estado === "erro") return aviso("A foto de capa não subiu. Escolha outra.", { erro: true });
    if (d.nome.trim().length < 2) return problema("c-nome", "Informe o nome do produto.");
    if (ed.novo) { if (!/^[a-z0-9][a-z0-9-]{1,60}$/.test(d.id)) return problema("c-id", "Código inválido: use letras minúsculas, números e hífen."); if (E.lista.some(p => p.id === d.id)) return problema("c-id", "Já existe um produto com esse código."); }
    if (!d.linha) return problema("c-linha", "Escolha a linha do produto.");
    const bit = d.bitolas.map(b => b.trim()).filter(Boolean);
    if (!bit.length) { const el = $("#bitolas [data-bit]"); if (el) { el.classList.add("invalido"); el.focus(); } return aviso("Informe pelo menos uma bitola ou medida.", { erro: true }); }
    if (ed.novo && !d.foto && !ed.fotoNova) { const r = await dialogo({ titulo: "Publicar sem foto?", texto: "O produto aparece no catálogo com um quadro cinza no lugar da foto. Você pode incluir a foto depois.", botoes: [{ texto: "Voltar e incluir foto", valor: null }, { texto: "Publicar assim", classe: "btn-azul", valor: "sim" }] }); if (!r) return; }
    const b = $("#b-salvar"); salvando = true; b.classList.add("carregando"); b.disabled = true;
    try {
      const espera = () => new Promise(ok => { const t = setInterval(() => { if ((!ed.fotoNova || ed.fotoNova.estado !== "enviando") && !ed.extrasNovas.some(x => x.estado === "enviando")) { clearInterval(t); ok(); } }, 200); });
      if ((ed.fotoNova && ed.fotoNova.estado === "enviando") || ed.extrasNovas.some(x => x.estado === "enviando")) { $("#estado").textContent = "Terminando de enviar as fotos…"; await espera(); if (ed.fotoNova && ed.fotoNova.estado === "erro") throw new Error("A foto de capa não subiu. Escolha outra."); }
      const foto = ed.fotoNova && ed.fotoNova.url ? ed.fotoNova.url : d.foto;
      const reg = { linha: d.linha, nome: d.nome.trim(), uso: d.uso.trim(), madeira: d.madeira.trim(), bitolas: bit, carimbos: d.carimbos, foto: foto || "", fotos: d.fotos.filter(Boolean), descricao: d.descricao.trim(), destaque: d.destaque, ativo: d.ativo || d.destaque > 0, ordem: d.ordem };
      const r = ed.novo ? await api.criar(Object.assign({ id: d.id }, reg)) : await api.alterar(d.id, reg);
      const x = registro(r); const i = E.lista.findIndex(y => y.id === x.id); if (i >= 0) E.lista[i] = x; else E.lista.push(x);
      const velhas = ed.removidas.filter(u => u !== reg.foto && !reg.fotos.includes(u)); if (ed.orig && ed.orig.foto && ed.orig.foto !== reg.foto) velhas.push(ed.orig.foto); if (velhas.length) api.apagarFotos(velhas).catch(() => { });
      ed.d.foto = reg.foto; ed.salvo = true; descartaEnvio(ed);
      ed.sujo = false; salvando = false;
      aviso(x.ativo ? `${x.nome} ${ed.novo ? "publicado" : "salvo"}. O site já mostra a versão nova.` : `${x.nome} salvo (oculto do site).`, x.ativo ? { link: ["Ver no site", linkSite(x.id)], tempo: 7000 } : {});
      E.ed = null; vai("");
    } catch (er) {
      salvando = false; if (b) { b.classList.remove("carregando"); b.disabled = false; } marcaSujo();
      if (er.sessao) { aviso(er.message + " As alterações deste produto não foram salvas.", { erro: true }); return telaEntrada(er.message); }
      aviso(er.message, { erro: true, tempo: 9000 });
    }
  }
  async function excluir(p) {
    const r = await dialogo({ titulo: `Excluir ${p.nome}?`, foto: fotoUrl(p.foto, "p"), texto: `O produto some do site e do painel. Não dá para desfazer pelo painel.<br><br>Se for só por um tempo, prefira <b>ocultar do site</b>: ele sai do catálogo e continua guardado aqui.`, botoes: [{ texto: "Cancelar", valor: null, esq: true }, ...(p.ativo ? [{ texto: "Ocultar do site", valor: "ocultar" }] : []), { texto: "Excluir de vez", classe: "btn-perigo", valor: "excluir" }] });
    if (r === "ocultar") { if (E.ed) E.ed.sujo = false; await alternaVisivel(p, false); E.ed = null; vai(""); return; }
    if (r !== "excluir") return;
    try {
      await api.excluir(p.id); api.apagarFotos([p.foto].concat(p.fotos).filter(ehUrl)).catch(() => { });
      E.lista = E.lista.filter(y => y.id !== p.id); aviso(`${p.nome} excluído.`);
      if (E.ed) E.ed.sujo = false; E.ed = null; vai("");
    } catch (er) { trataErro(er); }
  }

  // =====================================================================
  // início
  // =====================================================================
  async function iniciaSessao() {
    app.innerHTML = casca('<div class="carregando-tela" role="status" aria-label="Carregando os produtos"></div>'); ligaCasca();
    try {
      const eq = await api.equipe();
      if (!eq || !eq.length) return telaSemAcesso();
      E.equipe = eq[0];
      const [cat, lista] = await Promise.all([catalogo(), api.listar()]);
      E.linhas = cat.linhas || []; E.empresas = cat.empresas || [];
      E.lista = (lista || []).map(registro); E.carregou = true;
      rota();
    } catch (er) {
      if (er.sessao || er.status === 401) return telaEntrada(er.sessao ? er.message : "Sua sessão terminou. Entre de novo.");
      app.innerHTML = casca(`<div class="vazio">${I.alerta}<h3>Não foi possível carregar os produtos.</h3><p>${esc(er.message)}</p><p><button class="btn btn-azul" type="button" id="b-tenta">Tentar de novo</button></p></div>`); ligaCasca();
      $("#b-tenta").addEventListener("click", iniciaSessao);
    }
  }
  function inicio() {
    const h = new URLSearchParams(location.hash.slice(1));
    if (h.get("error") || h.get("error_description")) {
      history.replaceState(null, "", location.pathname + location.search);
      return telaEntrada(/expired|invalid/i.test(h.get("error_description") || h.get("error_code") || "") ? "O link expirou ou já foi usado. Peça um novo em \"Esqueci minha senha\"." : "Não foi possível abrir o link do e-mail. Peça um novo em \"Esqueci minha senha\".");
    }
    if (h.get("access_token")) {
      let email = ""; try { email = JSON.parse(atob(h.get("access_token").split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).email || ""; } catch (e) { }
      salvaSessao({ access_token: h.get("access_token"), refresh_token: h.get("refresh_token"), expires_in: h.get("expires_in"), expires_at: Number(h.get("expires_at")) || 0, user: { email } });
      const tipo = h.get("type"); history.replaceState(null, "", location.pathname + location.search);
      if (tipo === "recovery" || tipo === "invite") return telaNovaSenha(tipo);
      return iniciaSessao();
    }
    if (!sessao) return telaEntrada();
    iniciaSessao();
  }
  window.LarssenPainel = { E, api, versao: 1 };
  inicio();
})();
