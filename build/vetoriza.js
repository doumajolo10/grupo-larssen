// Vetoriza os logos ORIGINAIS (ampliados 4x) separando por cor e traçando cada camada com potrace.
// Uso: node vetoriza.js <entrada.png> <saida.svg> <k cores>
const fs = require("fs"), path = require("path");
const Jimp = require("jimp");
const potrace = require("potrace");

const [, , entrada, saida, kArg, palArg, regArg] = process.argv;
// regiões forçadas: "x0,y0,x1,y1:i;..." em frações, i = índice da cor na paleta
const REG = regArg ? regArg.split(";").map(r => { const [b, i] = r.split(":"); const [x0, y0, x1, y1] = b.split(",").map(Number); const [ii, ff] = i.split("@"); return { x0, y0, x1, y1, i: +ii, f: ff ? +ff : 0.5 }; }) : [];
const PAL = palArg ? palArg.split(",").map(h => [1, 3, 5].map(i => parseInt(h.replace("#", "").slice(i - 1, i + 1), 16))) : null;
const K = Number(kArg || 3);

const dist = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
const hex = c => "#" + c.map(v => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();

(async () => {
  const img = await Jimp.read(entrada);
  const { width: W, height: H, data } = img.bitmap;
  // pixels "de tinta": longe do branco
  const tinta = [];
  for (let i = 0; i < W * H; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2], a = data[i * 4 + 3];
    if (a < 128) continue;
    if (Math.min(r, g, b) > 225) continue;
    // pixels de borda (misturados com branco) não entram no agrupamento
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    if (Math.min(r, g, b) > 150 && sat < 40) continue;
    tinta.push([r, g, b]);
  }
  // k-means simples com sementes espalhadas por luminância
  if (!tinta.length) tinta.push([0, 0, 0]);
  tinta.sort((p, q) => (p[0] + p[1] + p[2]) - (q[0] + q[1] + q[2]));
  let cent = PAL ? PAL : Array.from({ length: K }, (_, j) => tinta[Math.floor((j + 0.5) * tinta.length / K)].slice());
  for (let it = 0; it < (PAL ? 0 : 25); it++) {
    const soma = cent.map(() => [0, 0, 0, 0]);
    for (let n = 0; n < tinta.length; n += 3) {
      const p = tinta[n]; let m = 0, md = 1e12;
      cent.forEach((c, j) => { const d = dist(p, c); if (d < md) { md = d; m = j; } });
      soma[m][0] += p[0]; soma[m][1] += p[1]; soma[m][2] += p[2]; soma[m][3]++;
    }
    cent = soma.map((s, j) => s[3] ? [s[0] / s[3], s[1] / s[3], s[2] / s[3]] : cent[j]);
  }
  const branco = [255, 255, 255];
  const todos = [...cent, branco];
  // máscara por camada (com dilatação de 2 px para não sobrar fresta entre cores vizinhas)
  const rotulo = new Int8Array(W * H).fill(-1);
  for (let i = 0; i < W * H; i++) {
    const a = data[i * 4 + 3]; if (a < 128) continue;
    const p = [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];
    let m = -1, md = 1e12;
    todos.forEach((c, j) => { const d = dist(p, c); if (d < md) { md = d; m = j; } });
    rotulo[i] = m === K ? -1 : m;
    const px = (i % W) / W, py = Math.floor(i / W) / H, lum = (p[0] + p[1] + p[2]) / 3;
    for (const r of REG) if (px >= r.x0 && px < r.x1 && py >= r.y0 && py < r.y1) { const lc = (cent[r.i][0] + cent[r.i][1] + cent[r.i][2]) / 3; rotulo[i] = lum < lc + (255 - lc) * (r.f || 0.5) ? r.i : -1; }
  }
  // ordem: camada com mais área primeiro (fica embaixo)
  const area = cent.map((_, j) => rotulo.reduce((s, v) => s + (v === j), 0));
  const ordem = cent.map((_, j) => j).sort((a, b) => area[b] - area[a]);
  const caminhos = [];
  for (const [pos, j] of ordem.entries()) {
    const masc = new Jimp(W, H, 0xffffffff);
    const dil = pos === ordem.length - 1 ? 0 : 2;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let on = rotulo[y * W + x] === j;
      if (!on && dil && rotulo[y * W + x] !== -1) {
        for (let dy = -dil; dy <= dil && !on; dy++) for (let dx = -dil; dx <= dil && !on; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx >= 0 && yy >= 0 && xx < W && yy < H && rotulo[yy * W + xx] === j) on = true;
        }
      }
      if (on) masc.setPixelColor(0x000000ff, x, y);
    }
    const tmp = path.join(__dirname, "_camada.png");
    await masc.writeAsync(tmp);
    const tag = await new Promise((ok, erro) => {
      const t = new potrace.Potrace();
      t.setParameters({ turdSize: 40, optTolerance: 0.4, alphaMax: 1, threshold: 128 });
      t.loadImage(tmp, e => e ? erro(e) : ok(t.getPathTag(hex(cent[j]))));
    });
    caminhos.push(tag);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${caminhos.join("")}</svg>`;
  fs.writeFileSync(saida, svg);
  console.log(path.basename(saida), W + "x" + H, "cores:", ordem.map(j => hex(cent[j]) + "(" + area[j] + ")").join(" "));
})();
