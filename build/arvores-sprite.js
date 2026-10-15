// Recorta as árvores geradas no Gemini (fundo magenta) em sprites com transparência.
// Separa cada árvore por componente conectado (não por coluna), então copas que se sobrepõem na horizontal não são cortadas.
// Uso: node build/arvores-sprite.js <entrada.png> <pasta-saida>
const Jimp = require("jimp");
const fs = require("fs"), path = require("path");
const [, , entrada, saida] = process.argv;
const NOMES = ["pinus", "eucalipto", "araucaria", "nativa"];
(async () => {
  const img = await Jimp.read(entrada);
  const { width: W, height: H, data } = img.bitmap;
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  // 1. chave magenta + remoção do reflexo (magenta = R e B altos, G baixo)
  for (let i = 0; i < W * H; i++) {
    let r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    const m = Math.min(r, b) - g;
    const a = 1 - sm(18, 95, m);
    if (r > g + 6 && b > g + 6) { const base = g; r = Math.min(r, Math.round(base * 1.12 + 6)); b = Math.min(b, Math.round(base * 0.82)); }
    data[i * 4] = r; data[i * 4 + 2] = b; data[i * 4 + 3] = Math.round(a * 255);
  }
  // 2. componentes conectados na máscara (alfa > 60), em grade reduzida (2x) para tolerar folhas soltas
  const S = 2, w = Math.ceil(W / S), h = Math.ceil(H / S), mask = new Uint8Array(w * h), lab = new Int32Array(w * h).fill(-1);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (data[(y * W + x) * 4 + 3] > 60) mask[(y / S | 0) * w + (x / S | 0)] = 1;
  const tam = []; const pilha = new Int32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    if (!mask[i] || lab[i] >= 0) continue;
    const id = tam.length; let topo = 0, n = 0; pilha[topo++] = i; lab[i] = id;
    while (topo) {
      const j = pilha[--topo]; n++; const jx = j % w, jy = j / w | 0;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const xx = jx + dx, yy = jy + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const k = yy * w + xx; if (mask[k] && lab[k] < 0) { lab[k] = id; pilha[topo++] = k; }
      }
    }
    tam.push(n);
  }
  const grandes = tam.map((n, id) => [n, id]).sort((a, b) => b[0] - a[0]).slice(0, 4).map(x => x[1]);
  // ordena da esquerda para a direita pelo centro
  const centro = id => { let s = 0, c = 0; for (let i = 0; i < w * h; i++) if (lab[i] === id) { s += i % w; c++; } return s / c; };
  grandes.sort((a, b) => centro(a) - centro(b));
  console.log("componentes:", tam.length, "maiores:", grandes.map(id => tam[id]).join(","));
  fs.mkdirSync(saida, { recursive: true });
  grandes.forEach((id, k) => {
    const c = img.clone(); const cd = c.bitmap.data;
    let x0 = W, x1 = 0, y0 = H, y1 = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const p = (y * W + x) * 4, l = lab[(y / S | 0) * w + (x / S | 0)];
      if (l !== id) { cd[p + 3] = 0; continue; }
      if (cd[p + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    const pad = 4, cx0 = Math.max(0, x0 - pad), cy0 = Math.max(0, y0 - pad);
    c.crop(cx0, cy0, Math.min(W, x1 + pad) - cx0, Math.min(H, y1 + pad) - cy0);
    c.write(path.join(saida, `${NOMES[k] || "arvore" + k}.png`));
    console.log(NOMES[k], c.bitmap.width + "x" + c.bitmap.height);
  });
})();
