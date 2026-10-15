// Cena 3D da Rota da Madeira (Three.js r160): floresta plantada -> serraria -> autoclave -> estrada -> obra.
// Materiais CC0 do Poly Haven (assets/3d/ORIGEM.txt), árvores fotográficas geradas no Gemini (assets/3d/arvores.webp).
// Exporta iniciarCena(canvas, opcoes) -> { marcos, pronto, temDissolucao, definirProgresso, definirFim, destruir }.
import * as THREE from "three";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const ARQ = n => new URL("./3d/" + n, import.meta.url).href;

// ---------- ruído determinístico ----------
function hash(x, y) { let h = x * 374761393 + y * 668265263; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
function ruido(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const s = t => t * t * (3 - 2 * t), u = s(xf), v = s(yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y) { let t = 0, amp = 1, f = 1, n = 0; for (let i = 0; i < 4; i++) { t += ruido(x * f, y * f) * amp; n += amp; amp *= 0.5; f *= 2.03; } return t / n; }
let semente = 7; const rnd = () => { semente = (semente * 16807) % 2147483647; return (semente - 1) / 2147483646; };

// Passo final: gradação, vinheta, grão, desfoque de profundidade nas bordas (tilt-shift) e dissolução no papel.
const SHADER_FINAL = {
  uniforms: {
    tDiffuse: { value: null }, uFim: { value: 0 }, uTempo: { value: 0 }, uAspecto: { value: 1 }, uGrao: { value: 1 },
    uTexel: { value: new THREE.Vector2(1 / 1440, 1 / 900) }, uDesfoque: { value: 1 },
    uPapel: { value: new THREE.Vector3(0.953, 0.957, 0.945) }, uVerde: { value: new THREE.Vector3(0.329, 0.463, 0.227) },
  },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uFim, uTempo, uAspecto, uGrao, uDesfoque; uniform vec2 uTexel; uniform vec3 uPapel, uVerde;
    varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
      return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
    float fbm(vec2 p){ float t = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ t += n2(p) * a; p *= 2.07; a *= 0.5; } return t; }
    void main(){
      // desfoque crescente para o alto e para a base do quadro (lente de maquete)
      float d = smoothstep(0.22, 0.52, abs(vUv.y - 0.5)) * uDesfoque * 0.75;
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      if (d > 0.01) {
        vec3 s = c; float r = d * 3.2;
        for (int i = 0; i < 8; i++) { float a = float(i) * 0.7853982; s += texture2D(tDiffuse, vUv + vec2(cos(a), sin(a)) * uTexel * r).rgb; s += texture2D(tDiffuse, vUv + vec2(cos(a + 0.39), sin(a + 0.39)) * uTexel * r * 2.0).rgb; }
        c = mix(c, s / 17.0, min(1.0, d * 1.2));
      }
      c = (c - 0.5) * 1.06 + 0.5;
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(vec3(l), c, 1.07);
      c *= vec3(1.02, 1.0, 0.97);
      vec2 q = vUv - 0.5; q.x *= uAspecto;
      c *= mix(0.84, 1.0, smoothstep(0.95, 0.25, length(q)));
      c += (h(vUv * 900.0 + uTempo) - 0.5) * 0.02 * uGrao * (1.0 - uFim);
      float n = fbm(vec2(vUv.x * uAspecto, vUv.y) * 4.0 + vec2(0.0, uTempo * 0.02)) * 0.85 + (1.0 - vUv.y) * 0.25;
      float corte = uFim * 1.3 - 0.15;
      float borda = (1.0 - smoothstep(0.0, 0.045, abs(n - corte))) * step(0.001, uFim) * (1.0 - step(0.999, uFim));
      c = mix(c, uVerde, borda * 0.9);
      c = mix(c, uPapel, step(n, corte) * step(0.001, uFim));
      gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
    }`,
};

export function iniciarCena(canvas, opcoes = {}) {
  const leve = !!opcoes.leve, parado = !!opcoes.parado;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: leve, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, leve ? 1.25 : 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = !leve;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const gerente = new THREE.LoadingManager();
  const pronto = new Promise(ok => { gerente.onLoad = ok; gerente.onError = () => {}; setTimeout(ok, 9000); });
  const carregador = new THREE.TextureLoader(gerente);
  const tex = (nome, rep = 1, cor = true) => { const t = carregador.load(ARQ(nome)); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = aniso; if (cor) t.colorSpace = THREE.SRGBColorSpace; return t; };

  const NEBLINA = new THREE.Color("#d9e0e3");
  const cena = new THREE.Scene();
  cena.background = NEBLINA.clone(); cena.backgroundIntensity = 1.15;
  cena.fog = leve ? new THREE.Fog(NEBLINA, 140, 520) : new THREE.Fog(NEBLINA, 200, 700);
  // céu real: fundo em imagem equiretangular e iluminação pelo HDRI
  const fundo = carregador.load(ARQ("ceu_fundo.webp"), t => { t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace; cena.background = t; });
  const pmrem = new THREE.PMREMGenerator(renderer);
  new RGBELoader(gerente).load(ARQ("ceu.hdr"), hdr => { const env = pmrem.fromEquirectangular(hdr).texture; cena.environment = env; hdr.dispose(); });

  const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 1500);

  cena.add(new THREE.HemisphereLight("#eaf2fb", "#6f5a40", 0.55));
  const sol = new THREE.DirectionalLight("#ffe9d0", 2.6);
  const SOL_DIR = new THREE.Vector3(-0.6, 0.72, 0.36).normalize();
  sol.castShadow = !leve;
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -120, right: 120, top: 120, bottom: -120, near: 10, far: 520 });
  sol.shadow.bias = -0.0005; sol.shadow.normalBias = 0.05;
  cena.add(sol); cena.add(sol.target);

  // ---------- estrada ----------
  const estradaPts = [[-6, -262], [-12, -205], [-18, -150], [-4, -100], [18, -62], [14, -30], [-2, 0], [-8, 34], [8, 70], [40, 102], [60, 140], [70, 205], [74, 262]].map(([x, z]) => new THREE.Vector3(x, 0, z));
  const estrada = new THREE.CatmullRomCurve3(estradaPts, false, "catmullrom", 0.4);
  const amostras = estrada.getSpacedPoints(420);
  const distEstrada = (x, z) => { let m = 1e9; for (let i = 0; i < amostras.length; i += 2) { const p = amostras[i]; const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < m) m = d; } return Math.sqrt(m); };
  const PATIO = { x0: -76, x1: 10, z0: -38, z1: 42 };
  const noPatio = (x, z, folga = 0) => x > PATIO.x0 - folga && x < PATIO.x1 + folga && z > PATIO.z0 - folga && z < PATIO.z1 + folga;
  const OBRA = { x: 92, z: 150, r: 22 };
  const ACUDE = { x: -112, z: -6, r: 17 };
  const ALT_PATIO = 1.2;
  function alturaBruta(x, z) { return (fbm(x * 0.012 + 3.1, z * 0.012 + 8.7) - 0.45) * 34 + (fbm(x * 0.05, z * 0.05) - 0.5) * 3; }
  const NIVEL_ACUDE = alturaBruta(ACUDE.x, ACUDE.z) - 1.4;
  function altura(x, z) {
    let h = alturaBruta(x, z);
    const dx = Math.max(PATIO.x0 - x, 0, x - PATIO.x1), dz = Math.max(PATIO.z0 - z, 0, z - PATIO.z1);
    const kp = Math.min(Math.sqrt(dx * dx + dz * dz) / 18, 1); h = ALT_PATIO + (h - ALT_PATIO) * (kp * kp * (3 - 2 * kp));
    const dob = Math.hypot(x - OBRA.x, z - OBRA.z); if (dob < OBRA.r) h -= (1 - dob / OBRA.r) * 3.2;
    const dac = Math.hypot(x - ACUDE.x, z - ACUDE.z);
    if (dac < ACUDE.r + 10) { const k = Math.min(1, Math.max(0, (dac - ACUDE.r + 4) / 14)); const fundoA = NIVEL_ACUDE - 2.6; h = fundoA + (Math.max(h, NIVEL_ACUDE + 0.6) - fundoA) * (k * k * (3 - 2 * k)); }
    return h;
  }
  const altEstrada = amostras.map(p => altura(p.x, p.z));
  for (let k = 0; k < 6; k++) for (let i = 1; i < altEstrada.length - 1; i++) altEstrada[i] = (altEstrada[i - 1] + altEstrada[i] * 2 + altEstrada[i + 1]) / 4;
  function alturaFinal(x, z) {
    let m = 1e9, mi = 0;
    for (let i = 0; i < amostras.length; i += 2) { const p = amostras[i]; const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < m) { m = d; mi = i; } }
    const d = Math.sqrt(m), h = altura(x, z);
    if (d < 14) { const k = Math.max(0, (d - 5) / 9); const s = k * k * (3 - 2 * k); return altEstrada[mi] - 0.15 + (h - altEstrada[mi] + 0.15) * s; }
    return h;
  }

  // ---------- árvores (posições) ----------
  const TAM = 560;
  const arvores = [];
  const livre = (x, z, folga = 11) => !(distEstrada(x, z) < folga || noPatio(x, z, 12) || Math.hypot(x - OBRA.x, z - OBRA.z) < OBRA.r + 8 || Math.hypot(x - ACUDE.x, z - ACUDE.z) < ACUDE.r + 5);
  function talhao(x0, z0, x1, z1, tipo, passo, angulo) {
    const c = Math.cos(angulo), s = Math.sin(angulo), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    for (let a = x0; a < x1; a += passo) for (let b = z0; b < z1; b += passo) {
      const lx = a - cx, lz = b - cz, x = cx + lx * c - lz * s + (rnd() - 0.5) * 0.8, z = cz + lx * s + lz * c + (rnd() - 0.5) * 0.8;
      if (Math.abs(x) > TAM / 2 - 4 || Math.abs(z) > TAM / 2 - 4 || !livre(x, z) || rnd() < 0.035) continue;
      arvores.push({ x, z, tipo, h: (tipo === "pinus" ? 13 : 19) * (0.85 + rnd() * 0.3) });
    }
  }
  const P = leve ? 1.45 : 1;
  talhao(-130, -250, -24, -110, "eucalipto", 4.2 * P, 0.15);
  talhao(10, -260, 130, -130, "pinus", 4.4 * P, -0.2);
  talhao(-155, -100, -40, -40, "pinus", 4.6 * P, 0.35);
  talhao(36, -110, 145, -40, "eucalipto", 4.6 * P, -0.05);
  talhao(-180, 40, -70, 140, "eucalipto", 4.8 * P, 0.5);
  talhao(-60, 80, 10, 180, "pinus", 4.6 * P, 0.1);
  talhao(110, 10, 230, 90, "pinus", 5 * P, -0.4);
  talhao(140, 140, 260, 260, "eucalipto", 5 * P, 0.2);
  talhao(-260, -60, -180, 60, "pinus", 5.4 * P, 0);
  for (let i = 0; i < (leve ? 160 : 360); i++) { const x = 60 + (rnd() - 0.5) * 120, z = -10 + (rnd() - 0.5) * 70; if (livre(x, z, 12)) arvores.push({ x, z, tipo: rnd() < 0.18 ? "araucaria" : "nativa", h: 9 + rnd() * 8 }); }
  for (let i = 0; i < (leve ? 900 : 2400); i++) {
    const x = (rnd() - 0.5) * (TAM - 20), z = (rnd() - 0.5) * (TAM - 20);
    if (fbm(x * 0.02 + 40, z * 0.02 - 13) < 0.56 || !livre(x, z, 12)) continue;
    arvores.push({ x, z, tipo: rnd() < 0.14 ? "araucaria" : "nativa", h: 8 + rnd() * 9 });
  }
  const CEL = 6, grade = new Map();
  for (const a of arvores) { const k = Math.floor(a.x / CEL) + "," + Math.floor(a.z / CEL); grade.set(k, (grade.get(k) || 0) + 1); }
  const densidade = (x, z) => { let n = 0; const cx = Math.floor(x / CEL), cz = Math.floor(z / CEL); for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) n += grade.get((cx + i) + "," + (cz + j)) || 0; return n; };

  // ---------- terreno com mistura de texturas ----------
  const SEG = leve ? 140 : 240;
  const geoT = new THREE.PlaneGeometry(TAM, TAM, SEG, SEG); geoT.rotateX(-Math.PI / 2);
  const pos = geoT.attributes.position, uvT = geoT.attributes.uv, sombra = new Float32Array(pos.count * 3), pesos = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), y = alturaFinal(x, z);
    pos.setY(i, y); uvT.setXY(i, x / 26, z / 26);
    const dEst = distEstrada(x, z), den = densidade(x, z);
    let terra = 0, mata = Math.min(1, den * 0.09), serr = 0;
    if (noPatio(x, z, 2)) { terra = 0.75; serr = fbm(x * 0.06, z * 0.06) > 0.5 ? 0.75 : 0.25; mata = 0; }
    else if (noPatio(x, z, 8)) terra = 0.5;
    if (dEst < 9 && !noPatio(x, z)) terra = Math.max(terra, 0.85 * (1 - dEst / 9));
    if (Math.hypot(x - OBRA.x, z - OBRA.z) < OBRA.r + 2) { terra = 1; mata = 0; }
    terra = Math.max(terra, Math.max(0, fbm(x * 0.01 + 5, z * 0.01 - 9) - 0.68) * 2.2); // manchas de solo aberto
    pesos[i * 3] = terra; pesos[i * 3 + 1] = mata; pesos[i * 3 + 2] = serr;
    const s = 1 - Math.min(0.42, den * 0.028);   // sombra de copa
    sombra[i * 3] = sombra[i * 3 + 1] = sombra[i * 3 + 2] = s;
  }
  geoT.setAttribute("color", new THREE.BufferAttribute(sombra, 3));
  geoT.setAttribute("pesos", new THREE.BufferAttribute(pesos, 3));
  geoT.computeVertexNormals();
  const tGrama = tex("grama_cor.webp"), tGramaN = tex("grama_normal.webp", 1, false);
  const tTerra = tex("terra_cor.webp"), tMata = tex("mata_cor.webp"), tSerr = tex("serragem_cor.webp");
  const matTerreno = new THREE.MeshStandardMaterial({ map: tGrama, normalMap: leve ? null : tGramaN, normalScale: new THREE.Vector2(0.6, 0.6), vertexColors: true, roughness: 0.96, metalness: 0, envMapIntensity: 0.6 });
  matTerreno.onBeforeCompile = sh => {
    sh.uniforms.tTerra = { value: tTerra }; sh.uniforms.tMata = { value: tMata }; sh.uniforms.tSerr = { value: tSerr };
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute vec3 pesos; varying vec3 vPesos; varying vec2 vMundo;")
      .replace("#include <uv_vertex>", "#include <uv_vertex>\nvPesos = pesos; vMundo = uv;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nuniform sampler2D tTerra, tMata, tSerr; varying vec3 vPesos; varying vec2 vMundo;")
      .replace("#include <map_fragment>", `
        vec3 g1 = texture2D(map, vMundo).rgb, g2 = texture2D(map, vMundo * 0.27 + 0.31).rgb;
        vec3 grama = mix(g1, g2, 0.45); grama = mix(grama * vec3(0.66, 0.92, 0.5), vec3(0.16, 0.24, 0.08), 0.18);
        vec3 terra = texture2D(tTerra, vMundo * 2.6).rgb * vec3(1.05, 0.93, 0.88);
        vec3 mata = texture2D(tMata, vMundo * 3.2).rgb;
        vec3 serr = texture2D(tSerr, vMundo * 2.2).rgb;
        vec3 cor = grama;
        cor = mix(cor, mata, clamp(vPesos.y, 0.0, 1.0) * 0.85);
        cor = mix(cor, terra, smoothstep(0.05, 0.9, vPesos.x));
        cor = mix(cor, serr, smoothstep(0.1, 0.9, vPesos.z));
        diffuseColor.rgb *= cor;`);
  };
  const terreno = new THREE.Mesh(geoT, matTerreno);
  terreno.receiveShadow = true;
  cena.add(terreno);

  const agua = new THREE.Mesh(new THREE.CircleGeometry(ACUDE.r + 3, 64), new THREE.MeshStandardMaterial({ color: "#4f7682", roughness: 0.06, metalness: 0.2, envMapIntensity: 1.2, transparent: true, opacity: 0.94 }));
  agua.rotation.x = -Math.PI / 2; agua.position.set(ACUDE.x, NIVEL_ACUDE, ACUDE.z); agua.receiveShadow = true; cena.add(agua);

  // ---------- estrada: asfalto texturizado, faixa amarela central e bordas brancas ----------
  function fita(largura, y, material, tracejar, deslocamento = 0) {
    const N = 700, pts = estrada.getSpacedPoints(N), vert = [], uvs = [], idx = [], L = estrada.getLength();
    for (let i = 0; i <= N; i++) {
      const p = pts[i], t = estrada.getTangentAt(i / N), lado = new THREE.Vector3(-t.z, 0, t.x).normalize();
      const k = Math.round(i / N * (altEstrada.length - 1)), h = altEstrada[k] + y, c = deslocamento;
      vert.push(p.x + lado.x * (c + largura / 2), h, p.z + lado.z * (c + largura / 2), p.x + lado.x * (c - largura / 2), h, p.z + lado.z * (c - largura / 2));
      const v = i / N * L / 9; uvs.push(0, v, 1, v);
      if (i < N && (!tracejar || Math.floor(i / 3) % 2 === 0)) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(vert, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, material); m.receiveShadow = true; cena.add(m); return m;
  }
  const tAsf = tex("asfalto_cor.webp"); tAsf.repeat.set(1, 1);
  const matAsf = new THREE.MeshStandardMaterial({ map: tAsf, normalMap: leve ? null : tex("asfalto_normal.webp", 1, false), color: "#9a9a96", roughness: 0.88, polygonOffset: true, polygonOffsetFactor: -2 });
  fita(8, 0.12, matAsf, false);
  fita(8.9, 0.07, new THREE.MeshStandardMaterial({ color: "#b9b2a2", roughness: 1, polygonOffset: true, polygonOffsetFactor: -1 }), false);
  const matFaixa = new THREE.MeshStandardMaterial({ color: "#f2b705", roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -4 });
  fita(0.32, 0.18, matFaixa, true);
  const matBorda = new THREE.MeshStandardMaterial({ color: "#f3f1ea", roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -4 });
  fita(0.22, 0.18, matBorda, false, 3.5); fita(0.22, 0.18, matBorda, false, -3.5);

  // ---------- árvores fotográficas (billboards cilíndricos com vento e sombra) ----------
  // regiões do atlas assets/3d/arvores.webp (2048x1024, 4 colunas): u0, u1, altura útil (v1) e proporção largura/altura
  const ATLAS = {
    pinus: { u0: 0 / 4 + 8 / 2048, u1: 0 / 4 + 504 / 2048, v1: 829 / 1024, asp: 496 / 825 },
    eucalipto: { u0: 1 / 4 + 37 / 2048, u1: 1 / 4 + 475 / 2048, v1: 1004 / 1024, asp: 438 / 1000 },
    araucaria: { u0: 2 / 4 + 8 / 2048, u1: 2 / 4 + 504 / 2048, v1: 782 / 1024, asp: 496 / 778 },
    nativa: { u0: 3 / 4 + 8 / 2048, u1: 3 / 4 + 504 / 2048, v1: 594 / 1024, asp: 496 / 590 },
  };
  const tArv = carregador.load(ARQ("arvores.webp")); tArv.colorSpace = THREE.SRGBColorSpace; tArv.anisotropy = aniso;
  const tempoU = { value: 0 };
  const quad = new THREE.PlaneGeometry(1, 1); quad.translate(0, 0.5, 0);
  const nrm = quad.attributes.normal; for (let i = 0; i < nrm.count; i++) nrm.setXYZ(i, 0, 1, 0.25);
  const injetar = sh => {
    sh.uniforms.uTempo = tempoU;
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute vec4 aUV; uniform float uTempo;")
      .replace("#include <uv_vertex>", "#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv = vec2(mix(aUV.x, aUV.y, uv.x), mix(4.0/1024.0, aUV.z, uv.y));\n#endif")
      .replace("#include <begin_vertex>", `
        vec3 dirCam = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
        vec2 dir = normalize(vec2(dirCam.x, dirCam.z) + 1e-5);
        vec3 transformed = vec3(position.x * dir.x, position.y, position.x * dir.y);
        #ifdef USE_INSTANCING
        vec3 base = instanceMatrix[3].xyz;
        float balanco = sin(uTempo * 1.1 + base.x * 0.21 + base.z * 0.17) * 0.035 + sin(uTempo * 2.3 + base.x) * 0.012;
        transformed.x += balanco * position.y * position.y; transformed.z += balanco * 0.6 * position.y * position.y;
        #endif`);
  };
  const matArv = new THREE.MeshStandardMaterial({ map: tArv, alphaTest: 0.42, side: THREE.DoubleSide, roughness: 0.95, metalness: 0, envMapIntensity: 0.55 });
  matArv.onBeforeCompile = injetar;
  const depthArv = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tArv, alphaTest: 0.42, side: THREE.DoubleSide });
  depthArv.onBeforeCompile = injetar;
  const instArv = new THREE.InstancedMesh(quad, matArv, arvores.length);
  instArv.customDepthMaterial = depthArv;
  const aUV = new Float32Array(arvores.length * 4);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v3 = new THREE.Vector3(), esc = new THREE.Vector3(), cor = new THREE.Color();
  arvores.forEach((a, i) => {
    const r = ATLAS[a.tipo], y = alturaFinal(a.x, a.z) - 0.3, w = a.h * r.asp;
    m4.compose(v3.set(a.x, y, a.z), q.identity(), esc.set(w, a.h, w)); instArv.setMatrixAt(i, m4);
    aUV[i * 4] = r.u0; aUV[i * 4 + 1] = r.u1; aUV[i * 4 + 2] = r.v1; aUV[i * 4 + 3] = 0;
    instArv.setColorAt(i, cor.setHSL(0.25 + (rnd() - 0.5) * 0.04, 0.1 + rnd() * 0.15, 0.82 + rnd() * 0.18));
  });
  quad.setAttribute("aUV", new THREE.InstancedBufferAttribute(aUV, 4));
  instArv.castShadow = !leve; instArv.receiveShadow = false; instArv.frustumCulled = false;
  cena.add(instArv);

  // ---------- serraria ----------
  const tTelh = tex("telhado_cor.webp"), tTelhN = tex("telhado_normal.webp", 1, false);
  tTelh.repeat.set(10, 3); tTelhN.repeat.set(10, 3);
  const tParede = tex("parede_cor.webp"); tParede.repeat.set(5, 1);
  const matParede = new THREE.MeshStandardMaterial({ map: tParede, color: "#f1eee8", roughness: 0.9 });
  const matTelhado = new THREE.MeshStandardMaterial({ map: tTelh, normalMap: leve ? null : tTelhN, color: "#f4f4f2", roughness: 0.4, metalness: 0.55, side: THREE.DoubleSide });
  const matFriso = new THREE.MeshStandardMaterial({ color: "#bf3328", roughness: 0.55 });
  const matPorta = new THREE.MeshStandardMaterial({ color: "#2f3330", roughness: 0.8 });
  function galpao(x, z, larg, comp, alt) {
    const g = new THREE.Group();
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(larg, alt, comp), matParede); corpo.position.y = alt / 2; g.add(corpo);
    const geoArco = new THREE.CylinderGeometry(larg / 2 * 1.04, larg / 2 * 1.04, comp * 1.02, 40, 1, true, Math.PI / 2, Math.PI); geoArco.rotateX(Math.PI / 2);
    const arco = new THREE.Mesh(geoArco, matTelhado); arco.scale.set(1, 0.32, 1); arco.position.y = alt; g.add(arco);
    const friso = new THREE.Mesh(new THREE.BoxGeometry(larg * 1.05, 0.7, comp * 1.03), matFriso); friso.position.y = alt - 0.2; g.add(friso);
    for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(larg * 0.42, alt * 0.75, 0.2), matPorta); p.position.set(0, alt * 0.375, s * (comp / 2 + 0.05)); g.add(p); }
    for (let k = -comp / 2 + 4; k < comp / 2 - 2; k += 6) for (const s of [-1, 1]) { const jan = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 3), new THREE.MeshStandardMaterial({ color: "#7c8b92", roughness: 0.2, metalness: 0.6 })); jan.position.set(s * (larg / 2 + 0.03), alt - 1.6, k); g.add(jan); }
    g.traverse(o => { if (o.isMesh) { o.castShadow = !leve; o.receiveShadow = true; } });
    g.position.set(x, ALT_PATIO, z); cena.add(g); return g;
  }
  galpao(-40, -12, 20, 40, 7);
  galpao(-62, -4, 12, 26, 5.5);
  galpao(-40, 26, 18, 22, 6);

  // chaminé da caldeira (cavaco) com fumaça
  const chamine = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 20, 16), new THREE.MeshStandardMaterial({ color: "#8c8f8c", roughness: 0.5, metalness: 0.6 }));
  chamine.position.set(-54, ALT_PATIO + 10, 8); chamine.castShadow = !leve; cena.add(chamine);
  const caldeira = new THREE.Mesh(new THREE.BoxGeometry(6, 5, 5), matParede); caldeira.position.set(-54, ALT_PATIO + 2.5, 12); caldeira.castShadow = !leve; cena.add(caldeira);
  const texFumaca = (() => { const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d"); const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, "rgba(245,245,242,.9)"); gr.addColorStop(1, "rgba(245,245,242,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const fumaca = [];
  for (let i = 0; i < 14; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texFumaca, transparent: true, depthWrite: false, opacity: 0.5 })); s.userData.f = i / 14; cena.add(s); fumaca.push(s); }
  const posFumaca = f => { const s = fumaca[f]; const t = s.userData.f; s.position.set(-54 + t * 14, ALT_PATIO + 20.5 + t * 22, 8 - t * 6); const k = 2.5 + t * 9; s.scale.set(k, k, 1); s.material.opacity = 0.55 * (1 - t); };
  fumaca.forEach((_, i) => posFumaca(i));

  // autoclave + tanques
  const matAuto = new THREE.MeshStandardMaterial({ color: "#3d7a45", roughness: 0.3, metalness: 0.55 });
  const auto = new THREE.Group();
  const corpoAuto = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 22, 40), matAuto); corpoAuto.rotation.z = Math.PI / 2; auto.add(corpoAuto);
  for (const s of [-1, 1]) { const tampa = new THREE.Mesh(new THREE.SphereGeometry(2.4, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), matAuto); tampa.rotation.z = -s * Math.PI / 2; tampa.scale.y = 0.35; tampa.position.x = s * 11; auto.add(tampa); }
  for (let i = -4; i <= 4; i++) { const anel = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.08, 6, 40), matAuto); anel.rotation.y = Math.PI / 2; anel.position.x = i * 2.4; auto.add(anel); }
  for (const dx of [-6, 6]) { const pe = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.6, 4), new THREE.MeshStandardMaterial({ color: "#555", roughness: 0.7 })); pe.position.set(dx, -2.2, 0); auto.add(pe); }
  auto.traverse(o => { if (o.isMesh) { o.castShadow = !leve; o.receiveShadow = true; } });
  auto.position.set(-21, ALT_PATIO + 3.2, -14); auto.rotation.y = Math.PI / 2; cena.add(auto);
  const tanqueMat = new THREE.MeshStandardMaterial({ color: "#e3e6e2", roughness: 0.25, metalness: 0.7 });
  for (const [tx, tz] of [[-24.5, 3], [-19.5, 3]]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 7, 28), tanqueMat); t.position.set(tx, ALT_PATIO + 3.5, tz); t.castShadow = !leve; cena.add(t); }

  // pacotes de tábuas e toras com casca
  const tTab = tex("tabua_cor.webp"); tTab.repeat.set(1, 1);
  const pacotes = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) for (let n = 0; n < 2 + ((r + c) % 2); n++) pacotes.push([-67 + c * 4.2, ALT_PATIO + 0.65 + n * 1.35, 14 + r * 3.1]);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) for (let n = 0; n < 2; n++) pacotes.push([-27 + c * 4.2, ALT_PATIO + 0.65 + n * 1.35, 14 + r * 3.1]);
  const instPac = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ map: tTab, color: "#f0d2a8", roughness: 0.85 }), pacotes.length);
  pacotes.forEach((p, i) => { m4.compose(v3.set(...p), q.identity(), esc.set(3.4, 1.2, 2.4)); instPac.setMatrixAt(i, m4); instPac.setColorAt(i, cor.set(i % 3 ? "#ffffff" : "#d9cfa0")); });
  instPac.castShadow = !leve; instPac.receiveShadow = true; cena.add(instPac);
  const tCasca = tex("cascapinus_cor.webp"); tCasca.repeat.set(2, 1);
  const geoTora = new THREE.CylinderGeometry(0.45, 0.5, 7, 12); geoTora.rotateZ(Math.PI / 2);
  const toras = [];
  for (let l = 0; l < 4; l++) for (let i = 0; i < 14 - l * 2; i++) toras.push([-64, ALT_PATIO + 0.5 + l * 0.85, -34 + i * 0.95 + l * 0.48]);
  for (let l = 0; l < 3; l++) for (let i = 0; i < 10 - l * 2; i++) toras.push([-56, ALT_PATIO + 0.5 + l * 0.85, -34 + i * 0.95 + l * 0.48]);
  const instTora = new THREE.InstancedMesh(geoTora, new THREE.MeshStandardMaterial({ map: tCasca, roughness: 0.95 }), toras.length);
  toras.forEach((p, i) => { m4.compose(v3.set(...p), q.identity(), esc.set(1, 1, 1)); instTora.setMatrixAt(i, m4); });
  instTora.castShadow = !leve; instTora.receiveShadow = true; cena.add(instTora);

  // placa verde "Grupo Larssen" na entrada do pátio
  const placa = new THREE.Group();
  const cvs = document.createElement("canvas"); cvs.width = 1024; cvs.height = 512;
  const g2 = cvs.getContext("2d");
  g2.fillStyle = "#54763a"; g2.fillRect(0, 0, 1024, 512); g2.strokeStyle = "#ffffff"; g2.lineWidth = 14; g2.strokeRect(26, 26, 972, 460);
  const texPlaca = new THREE.CanvasTexture(cvs); texPlaca.colorSpace = THREE.SRGBColorSpace; texPlaca.anisotropy = aniso;
  fetch(ARQ("../logos/grupo.svg")).then(r => r.text()).then(t => {
    const vb = (t.match(/viewBox="([^"]+)"/) || [])[1].split(" ").map(Number);
    const img = new Image();
    img.onload = () => { const k = Math.min(760 / vb[2], 330 / vb[3]); g2.drawImage(img, 512 - vb[2] * k / 2, 256 - vb[3] * k / 2, vb[2] * k, vb[3] * k); texPlaca.needsUpdate = true; };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(t.replace(/currentColor/g, "#ffffff").replace(/<svg /, '<svg width="' + vb[2] + '" height="' + vb[3] + '" '));
  }).catch(() => {});
  const matPlaca = new THREE.MeshStandardMaterial({ map: texPlaca, roughness: 0.5 });
  const painel = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 0.25), [matPorta, matPorta, matPorta, matPorta, matPlaca, matPlaca]);
  painel.position.y = 8; placa.add(painel);
  for (const s of [-1, 1]) { const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 8, 10), new THREE.MeshStandardMaterial({ color: "#9aa09a", metalness: 0.7, roughness: 0.35 })); poste.position.set(s * 3.8, 4, -0.2); placa.add(poste); }
  placa.traverse(o => { if (o.isMesh) o.castShadow = !leve; });
  placa.position.set(3, ALT_PATIO, -33); placa.rotation.y = Math.PI / 2 + 0.25; cena.add(placa);

  // ---------- veículos ----------
  const matCabine = new THREE.MeshStandardMaterial({ color: "#b8231b", roughness: 0.38, metalness: 0.25 });
  const matChassi = new THREE.MeshStandardMaterial({ color: "#232523", roughness: 0.8 });
  const matVidro = new THREE.MeshStandardMaterial({ color: "#1d2a31", roughness: 0.05, metalness: 0.9 });
  const matPneu = new THREE.MeshStandardMaterial({ color: "#151515", roughness: 0.9 });
  const matCromo = new THREE.MeshStandardMaterial({ color: "#d9dcdc", roughness: 0.15, metalness: 1 });
  const matCargaT = new THREE.MeshStandardMaterial({ map: tTab, color: "#f0d2a8", roughness: 0.85 });
  const matCargaC = new THREE.MeshStandardMaterial({ map: tCasca, roughness: 0.95 });
  function caminhao(carga) {
    const g = new THREE.Group();
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.4, 2.3), matCabine); cab.position.set(0, 2.3, 5.4); g.add(cab);
    const teto = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.6, 1.8), matCabine); teto.position.set(0, 3.75, 5.2); g.add(teto);
    const capo = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 0.8), matCabine); capo.position.set(0, 1.6, 6.9); g.add(capo);
    const vidro = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.95, 0.08), matVidro); vidro.position.set(0, 2.85, 6.56); vidro.rotation.x = -0.12; g.add(vidro);
    const grade = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 0.06), matCromo); grade.position.set(0, 1.6, 7.32); g.add(grade);
    const chassi = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 13), matChassi); chassi.position.set(0, 0.95, 0); g.add(chassi);
    const roda = new THREE.CylinderGeometry(0.55, 0.55, 0.45, 16); roda.rotateZ(Math.PI / 2);
    for (const z of [6.4, 0.6, -0.6, -4.6, -5.8]) for (const x of [-1.2, 1.2]) { const r = new THREE.Mesh(roda, matPneu); r.position.set(x, 0.55, z); g.add(r); }
    if (carga === "madeira") for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.5, 3.1), matCargaT); c.position.set(0, 1.95, 2.5 - k * 3.4); g.add(c); }
    else for (let k = 0; k < 12; k++) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 9.6, 10), matCargaC); t.rotation.x = Math.PI / 2; t.position.set(-0.85 + (k % 3) * 0.85, 1.6 + Math.floor(k / 3) * 0.66, -0.4); g.add(t); }
    g.traverse(o => { if (o.isMesh) o.castShadow = !leve; });
    cena.add(g); return g;
  }
  const caminhoes = [{ obj: caminhao("madeira"), t: 0.62, vel: 0.011, lado: -1 }, { obj: caminhao("toras"), t: 0.2, vel: 0.009, lado: 1 }, { obj: caminhao("madeira"), t: 0.86, vel: 0.01, lado: -1 }, { obj: caminhao("toras"), t: 0.4, vel: 0.008, lado: -1 }];
  function posicionarCaminhoes() {
    for (const c of caminhoes) {
      const p = estrada.getPointAt(c.t), tg = estrada.getTangentAt(c.t), lado = new THREE.Vector3(-tg.z, 0, tg.x).normalize();
      const k = Math.round(c.t * (altEstrada.length - 1));
      c.obj.position.set(p.x + lado.x * 2 * c.lado, altEstrada[k] + 0.15, p.z + lado.z * 2 * c.lado);
      c.obj.rotation.y = Math.atan2(tg.x, tg.z) + (c.lado > 0 ? Math.PI : 0);
    }
  }
  posicionarCaminhoes();

  // escavadeira e casas na obra
  const matAmarelo = new THREE.MeshStandardMaterial({ color: "#e8b416", roughness: 0.4, metalness: 0.3 });
  const escav = new THREE.Group();
  const esteira = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1, 5.4), matChassi); esteira.position.y = 0.5; escav.add(esteira);
  const corpoE = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.8, 3.6), matAmarelo); corpoE.position.y = 1.9; escav.add(corpoE);
  const cabE = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.5, 1.6), matVidro); cabE.position.set(-0.9, 3.4, 0.8); escav.add(cabE);
  const lanca = new THREE.Group(); lanca.position.set(0.6, 2.6, 1.4); escav.add(lanca);
  const braco1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 5.4), matAmarelo); braco1.position.set(0, 1.2, 2.4); braco1.rotation.x = -0.5; lanca.add(braco1);
  const braco2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 4), matAmarelo); braco2.position.set(0, 1.4, 5.8); braco2.rotation.x = 0.9; lanca.add(braco2);
  escav.traverse(o => { if (o.isMesh) o.castShadow = !leve; });
  escav.position.set(OBRA.x - 6, alturaFinal(OBRA.x - 6, OBRA.z) + 0.1, OBRA.z - 4); escav.rotation.y = -0.6; cena.add(escav);
  const tTabCasa = tex("tabua_cor.webp"); tTabCasa.repeat.set(2, 1);
  const matMadeira = new THREE.MeshStandardMaterial({ map: tTabCasa, color: "#c98d58", roughness: 0.8 }), matTelhaCasa = new THREE.MeshStandardMaterial({ color: "#7b3a26", roughness: 0.7 });
  function casa(x, z, rot, pronta) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(9, 4, 7), pronta ? matMadeira : new THREE.MeshBasicMaterial({ color: "#c99a62", wireframe: true })); base.position.y = 2; g.add(base);
    if (pronta) { const tel = new THREE.Mesh(new THREE.ConeGeometry(6.6, 3.4, 4), matTelhaCasa); tel.rotation.y = Math.PI / 4; tel.scale.set(1.15, 1, 0.85); tel.position.y = 5.7; g.add(tel); const varanda = new THREE.Mesh(new THREE.BoxGeometry(9, 0.3, 2.4), matMadeira); varanda.position.set(0, 0.4, 4.6); g.add(varanda); }
    g.traverse(o => { if (o.isMesh) { o.castShadow = !leve; o.receiveShadow = true; } });
    g.position.set(x, alturaFinal(x, z), z); g.rotation.y = rot; cena.add(g);
  }
  casa(OBRA.x + 8, OBRA.z + 6, -0.5, false); casa(OBRA.x + 30, OBRA.z - 20, -0.2, true); casa(OBRA.x + 44, OBRA.z + 4, -0.9, true); casa(OBRA.x - 50, OBRA.z + 18, 0.4, true);
  const harv = new THREE.Group();
  const hc = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2, 5), matAmarelo); hc.position.y = 1.6; harv.add(hc);
  const hcab = new THREE.Mesh(new THREE.BoxGeometry(2, 1.6, 1.8), matVidro); hcab.position.set(0, 3.3, 1.2); harv.add(hcab);
  const hb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 6), matAmarelo); hb.position.set(0.6, 3.2, 4.6); hb.rotation.x = -0.25; harv.add(hb);
  harv.traverse(o => { if (o.isMesh) o.castShadow = !leve; });
  const pH = estrada.getPointAt(0.12); harv.position.set(pH.x + 16, alturaFinal(pH.x + 16, pH.z) + 0.1, pH.z); harv.rotation.y = 0.9; cena.add(harv);

  // poeira de serraria no sol
  let poeira = null;
  if (!leve && !parado) {
    const N = 420, pp = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { pp[i * 3] = -70 + rnd() * 80; pp[i * 3 + 1] = ALT_PATIO + rnd() * 14; pp[i * 3 + 2] = -40 + rnd() * 80; }
    const gp = new THREE.BufferGeometry(); gp.setAttribute("position", new THREE.BufferAttribute(pp, 3));
    poeira = new THREE.Points(gp, new THREE.PointsMaterial({ color: "#fff4dc", size: 0.3, transparent: true, opacity: 0.5, depthWrite: false }));
    cena.add(poeira);
  }

  // ---------- marcos de km ----------
  const marcos = [
    { id: "florestal", km: 0, pos: new THREE.Vector3(pH.x + 16, alturaFinal(pH.x + 16, pH.z) + 7, pH.z) },
    { id: "madeireira", km: 2, pos: new THREE.Vector3(-62, ALT_PATIO + 12, -4) },
    { id: "tratadas", km: 9, pos: new THREE.Vector3(-21, ALT_PATIO + 7, -20) },
    { id: "transportes", km: 21, pos: (() => { const p = estrada.getPointAt(0.72); return new THREE.Vector3(p.x, alturaFinal(p.x, p.z) + 7, p.z); })() },
    { id: "escavacoes", km: 25, pos: new THREE.Vector3(OBRA.x - 6, alturaFinal(OBRA.x, OBRA.z) + 9, OBRA.z - 4) },
  ];

  // ---------- câmera ----------
  const voo = new THREE.CatmullRomCurve3([new THREE.Vector3(70, 85, -270), new THREE.Vector3(75, 60, -140), new THREE.Vector3(60, 46, -58), new THREE.Vector3(62, 50, 52), new THREE.Vector3(128, 50, 66), new THREE.Vector3(150, 40, 110)]);
  const alvo = new THREE.CatmullRomCurve3([new THREE.Vector3(-10, 4, -175), new THREE.Vector3(-5, 4, -65), new THREE.Vector3(-26, 3, -2), new THREE.Vector3(-22, 3, -6), new THREE.Vector3(55, 2, 128), new THREE.Vector3(90, 0, 150)]);

  // ---------- pós-processamento ----------
  let composer = null, passoFinal = null, bloom = null;
  if (!leve) {
    const rt = new THREE.WebGLRenderTarget(2, 2, { samples: 4, type: THREE.HalfFloatType });
    composer = new EffectComposer(renderer, rt);
    composer.addPass(new RenderPass(cena, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.18, 0.5, 1.05);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    passoFinal = new ShaderPass(SHADER_FINAL);
    passoFinal.uniforms.uGrao.value = parado ? 0 : 1;
    composer.addPass(passoFinal);
  }

  let progresso = 0, alvoProg = 0, fim = 0, mouseX = 0, mouseY = 0, mx = 0, my = 0, vivo = true, visivel = true, ultimo = performance.now();
  const olhar = new THREE.Vector3(), base = new THREE.Vector3();
  function posicionarCamera() {
    const t = Math.min(Math.max(progresso, 0), 1);
    voo.getPointAt(t, base); alvo.getPointAt(t, olhar);
    camera.position.set(base.x + mx * 10, base.y + my * 5, base.z);
    camera.lookAt(olhar);
    sol.target.position.copy(olhar);
    sol.position.copy(olhar).addScaledVector(SOL_DIR, 260);
  }
  function redimensionar() {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = w < h ? 58 : 42; camera.updateProjectionMatrix();
    if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); passoFinal.uniforms.uAspecto.value = w / h; passoFinal.uniforms.uTexel.value.set(1 / w, 1 / h); }
  }
  redimensionar();
  const aoRedimensionar = () => { redimensionar(); quadro(0); };
  window.addEventListener("resize", aoRedimensionar);
  const aoMouse = e => { mouseX = e.clientX / window.innerWidth * 2 - 1; mouseY = e.clientY / window.innerHeight * 2 - 1; };
  if (!parado) window.addEventListener("pointermove", aoMouse, { passive: true });
  const io = new IntersectionObserver(es => { visivel = es[0].isIntersecting; }, { threshold: 0 });
  io.observe(canvas);
  const tela = new THREE.Vector3();
  function projetarMarcos() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    return marcos.map(m => { tela.copy(m.pos).project(camera); return { id: m.id, km: m.km, x: (tela.x * 0.5 + 0.5) * w, y: (-tela.y * 0.5 + 0.5) * h, visivel: tela.z < 1 && tela.x > -1.1 && tela.x < 1.1 && tela.y > -1.1 && tela.y < 1.1 }; });
  }

  function quadro(dt) {
    progresso += (alvoProg - progresso) * (parado ? 1 : Math.min(1, dt * 3.2));
    mx += (mouseX - mx) * Math.min(1, dt * 2); my += (mouseY - my) * Math.min(1, dt * 2);
    const s = performance.now() / 1000;
    if (!parado) {
      tempoU.value = s;
      for (const c of caminhoes) c.t = (c.t + c.vel * dt) % 1;
      posicionarCaminhoes();
      lanca.rotation.x = Math.sin(s * 0.8) * 0.18; lanca.rotation.y = Math.sin(s * 0.35) * 0.25;
      fumaca.forEach((f, i) => { f.userData.f = (f.userData.f + dt * 0.07) % 1; posFumaca(i); });
      if (poeira) { const a = poeira.geometry.attributes.position; for (let i = 0; i < a.count; i++) { let y = a.getY(i) + dt * 0.35; if (y > ALT_PATIO + 15) y = ALT_PATIO; a.setY(i, y); } a.needsUpdate = true; }
    }
    posicionarCamera();
    if (composer) { passoFinal.uniforms.uFim.value = fim; passoFinal.uniforms.uTempo.value = s; passoFinal.uniforms.uDesfoque.value = 1 - fim; composer.render(); }
    else renderer.render(cena, camera);
    if (opcoes.aoQuadro) opcoes.aoQuadro(projetarMarcos(), progresso);
  }
  function laco(agora) {
    if (!vivo) return;
    const dt = Math.min(0.05, (agora - ultimo) / 1000); ultimo = agora;
    if (visivel && !document.hidden) quadro(dt);
    requestAnimationFrame(laco);
  }
  quadro(0);
  pronto.then(() => quadro(0));
  if (!parado) requestAnimationFrame(laco);

  return {
    marcos, pronto,
    temDissolucao: !!composer,
    definirProgresso(t) { alvoProg = Math.min(Math.max(t, 0), 1); if (parado) quadro(0); },
    definirFim(f) { fim = Math.min(Math.max(f, 0), 1); if (parado) quadro(0); },
    destruir() { vivo = false; io.disconnect(); window.removeEventListener("resize", aoRedimensionar); window.removeEventListener("pointermove", aoMouse); renderer.dispose(); },
  };
}
