// Recorta o logo vetorizado do Grupo Larssen: marca completa + os 5 símbolos das empresas (traço branco original).
const fs = require("fs"), path = require("path");
const dir = path.join(__dirname, "../assets/logos");
const svg = fs.readFileSync(path.join(dir, "grupo-bruto.svg"), "utf8");
const d = svg.match(/ d="([^"]+)"/)[1];
// subcaminhos
const subs = d.split(/(?=M )/).map(s => s.trim()).filter(Boolean).map(s => {
  const n = s.match(/-?\d+(\.\d+)?/g).map(Number); const xs = [], ys = [];
  for (let i = 0; i + 1 < n.length; i += 2) { xs.push(n[i]); ys.push(n[i + 1]); }
  return { s, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
});
const box = list => ({ x0: Math.min(...list.map(a => a.x0)), x1: Math.max(...list.map(a => a.x1)), y0: Math.min(...list.map(a => a.y0)), y1: Math.max(...list.map(a => a.y1)) });
const out = (nome, list, pad = 6) => {
  const b = box(list);
  const vb = [b.x0 - pad, b.y0 - pad, b.x1 - b.x0 + pad * 2, b.y1 - b.y0 + pad * 2].map(v => +v.toFixed(1));
  fs.writeFileSync(path.join(dir, nome), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(" ")}"><path fill="currentColor" fill-rule="evenodd" d="${list.map(a => a.s).join(" ")}"/></svg>`);
  console.log(nome, vb.join(" "));
};
out("grupo.svg", subs);
// a fileira de símbolos fica abaixo do "LARSSEN": maior y0 entre as formas grandes
const todos = box(subs);
const linhaIcones = subs.filter(a => a.y0 > todos.y0 + (todos.y1 - todos.y0) * 0.72);
const texto = subs.filter(a => !linhaIcones.includes(a));
out("grupo-texto.svg", texto);
// agrupa os ícones por colunas (separação horizontal)
const ord = linhaIcones.slice().sort((a, b) => a.x0 - b.x0);
const grupos = [];
for (const a of ord) {
  const g = grupos.find(g => a.x0 <= box(g).x1 + 4 && a.x1 >= box(g).x0 - 4);
  if (g) g.push(a); else grupos.push([a]);
}
console.log("ícones encontrados:", grupos.length);
const nomes = ["icone-transportes.svg", "icone-madeireira.svg", "icone-escavacoes.svg", "icone-tratadas.svg", "icone-florestal.svg"];
grupos.sort((a, b) => box(a).x0 - box(b).x0).forEach((g, i) => out(nomes[i] || `icone-${i}.svg`, g, 4));
