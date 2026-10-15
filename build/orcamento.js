// Lista de orçamento do Grupo Larssen (vai para assets/orcamento.js).
// Guarda os itens no navegador (localStorage, com proteção) e monta a mensagem de WhatsApp.
(function () {
  "use strict";
  var CHAVE = "larssen-orcamento-v1";
  var WHATS = document.documentElement.getAttribute("data-whats") || "5555936197019";
  var mem = [];
  function ler() {
    try { var t = localStorage.getItem(CHAVE); mem = t ? JSON.parse(t) : mem; } catch (e) {}
    if (!Array.isArray(mem)) mem = [];
    return mem;
  }
  function gravar(lista) {
    mem = lista;
    try { localStorage.setItem(CHAVE, JSON.stringify(lista)); } catch (e) {}
    document.dispatchEvent(new CustomEvent("orcamento:mudou", { detail: lista }));
  }
  function adicionar(item) {
    var lista = ler().slice();
    var achou = lista.filter(function (x) { return x.id === item.id; })[0];
    if (achou) achou.qtd = (achou.qtd || 1) + 1;
    else lista.push({ id: item.id, nome: item.nome, empresa: item.empresa, bitola: item.bitola || "", qtd: 1 });
    gravar(lista);
  }
  function remover(id) { gravar(ler().filter(function (x) { return x.id !== id; })); }
  function quantidade(id, qtd) {
    var lista = ler().slice();
    lista.forEach(function (x) { if (x.id === id) x.qtd = Math.max(1, Math.min(999, qtd | 0 || 1)); });
    gravar(lista);
  }
  function limpar() { gravar([]); }
  function mensagem(dados) {
    var lista = ler();
    var linhas = ["Olá, Grupo Larssen! Quero um orçamento:"];
    lista.forEach(function (x, i) {
      linhas.push((i + 1) + ". " + x.nome + (x.bitola ? " (" + x.bitola + ")" : "") + " — " + x.qtd + (x.qtd > 1 ? " unidades/lotes" : " unidade/lote") + " · " + x.empresa);
    });
    if (dados && dados.nome) linhas.push("", "Nome: " + dados.nome);
    if (dados && dados.cidade) linhas.push("Cidade da entrega: " + dados.cidade);
    if (dados && dados.obs) linhas.push("Observações: " + dados.obs);
    return linhas.join("\n");
  }
  function linkWhats(texto) { return "https://wa.me/" + WHATS + "?text=" + encodeURIComponent(texto); }
  window.Orcamento = { ler: ler, adicionar: adicionar, remover: remover, quantidade: quantidade, limpar: limpar, mensagem: mensagem, linkWhats: linkWhats };
  ler();
})();
