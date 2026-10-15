// Baixa materiais CC0 do Poly Haven (texturas PBR, céu HDRI) para assets/3d.
// Uso: node build/baixa-polyhaven.js
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const DEST = path.join(__dirname, "../assets/3d");
fs.mkdirSync(DEST, { recursive: true });
const pegar = u => JSON.parse(execFileSync("curl", ["-sL", "--max-time", "60", u]).toString());
const baixar = (u, f) => { if (!fs.existsSync(f)) execFileSync("curl", ["-sL", "--max-time", "180", "-o", f, u]); return fs.statSync(f).size; };
const TEXTURAS = {
  grama: ["aerial_grass_rock", "2k"],
  mata: ["forest_leaves_02", "1k"],
  terra: ["red_laterite_soil_stones", "1k"],
  serragem: ["aerial_wood_snips", "1k"],
  asfalto: ["aerial_asphalt_01", "1k"],
  telhado: ["corrugated_iron", "1k"],
  parede: ["plastered_wall_02", "1k"],
  casca: ["bark_bluegum", "1k"],
  cascapinus: ["bark_brown_02", "1k"],
  tabua: ["wood_planks", "1k"],
};
const log = [];
for (const [nome, [id, res]] of Object.entries(TEXTURAS)) {
  const f = pegar("https://api.polyhaven.com/files/" + id);
  const dif = f.Diffuse || f.diffuse; const nor = f.nor_gl; const rug = f.Rough || f.rough;
  const b1 = baixar(dif[res].jpg.url, path.join(DEST, `${nome}_cor.jpg`));
  const b2 = nor ? baixar(nor[res].jpg.url, path.join(DEST, `${nome}_normal.jpg`)) : 0;
  const b3 = rug ? baixar(rug[res].jpg.url, path.join(DEST, `${nome}_rug.jpg`)) : 0;
  log.push(`${nome} <- polyhaven.com/a/${id} (${res}) ${Math.round((b1 + b2 + b3) / 1024)} KB`);
}
// céu: HDRI 1k para iluminação + imagem tonemapped para o fundo
const CEU = "kloofendal_48d_partly_cloudy_puresky";
const h = pegar("https://api.polyhaven.com/files/" + CEU);
const bh = baixar(h.hdri["1k"].hdr.url, path.join(DEST, "ceu.hdr"));
const bt = baixar(h.tonemapped.url, path.join(DEST, "ceu_fundo_orig.jpg"));
log.push(`ceu <- polyhaven.com/a/${CEU} hdr ${Math.round(bh / 1024)} KB, fundo ${Math.round(bt / 1024)} KB`);
fs.writeFileSync(path.join(DEST, "ORIGEM.txt"), "Materiais CC0 de Poly Haven (https://polyhaven.com, licença CC0, sem necessidade de crédito):\n" + log.join("\n") + "\n");
console.log(log.join("\n"));
