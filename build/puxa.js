// Baixa do painel (Supabase) os produtos ativos e grava build/produtos.json, que o build/dados.js usa no lugar da lista fixa.
// Roda na GitHub Action antes do build.js (páginas estáticas e Google em dia). Se o painel não responder, não mexe em nada.
// Uso: node build/puxa.js
const fs = require("fs"), path = require("path");
const URL_SUPA = "https://cwsjddppdogvyitspbfr.supabase.co", CHAVE = "sb_publishable_zpNPLwlPqkOR6pnvrxRGHw_78r3siqN";
(async () => {
  try {
    const r = await fetch(URL_SUPA + "/rest/v1/larssen_produtos?select=*&ativo=eq.true&order=ordem.asc,nome.asc", { headers: { apikey: CHAVE } });
    if (!r.ok) throw new Error("painel respondeu " + r.status);
    const lista = await r.json();
    if (!Array.isArray(lista) || !lista.length) throw new Error("lista vazia (tabela ainda não criada?)");
    const destino = path.join(__dirname, "produtos.json"), novo = JSON.stringify(lista, null, 1);
    const antigo = fs.existsSync(destino) ? fs.readFileSync(destino, "utf8") : "";
    if (antigo !== novo) fs.writeFileSync(destino, novo);
    console.log("produtos do painel:", lista.length, antigo === novo ? "(sem mudança)" : "(atualizado)");
  } catch (e) { console.log("painel indisponível, mantendo a lista atual:", e.message); }
})();
