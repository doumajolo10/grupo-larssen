// Cena 3D da Rota da Madeira (Three.js r160). Floresta plantada -> serraria -> autoclave -> estrada -> obra.
// Exporta iniciarCena(canvas, opcoes) e devolve { definirProgresso(t), definirFim(f), destruir(), marcos }.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

// ---------- ruído (valor suave + fbm), determinístico ----------
function hash(x, y) { let h = x * 374761393 + y * 668265263; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
function ruido(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const s = t => t * t * (3 - 2 * t), u = s(xf), v = s(yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y) { let t = 0, amp = 1, f = 1, n = 0; for (let i = 0; i < 4; i++) { t += ruido(x * f, y * f) * amp; n += amp; amp *= 0.5; f *= 2.03; } return t / n; }
let semente = 7; const rnd = () => { semente = (semente * 16807) % 2147483647; return (semente - 1) / 2147483646; };

// Passo final: gradação de cor, vinheta, grão e dissolução da cena no papel da página.
const SHADER_FINAL = {
  uniforms: { tDiffuse: { value: null }, uFim: { value: 0 }, uTempo: { value: 0 }, uPapel: { value: new THREE.Vector3(0.953, 0.957, 0.945) }, uVerde: { value: new THREE.Vector3(0.329, 0.463, 0.227) }, uAspecto: { value: 1 }, uGrao: { value: 1 } },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uFim; uniform float uTempo; uniform vec3 uPapel; uniform vec3 uVerde; uniform float uAspecto; uniform float uGrao;
    varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
      return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
    float fbm(vec2 p){ float t = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ t += n2(p) * a; p *= 2.07; a *= 0.5; } return t; }
    void main(){
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      // gradação: um pouco mais de contraste e calor de fim de tarde
      c = (c - 0.5) * 1.07 + 0.5;
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(vec3(l), c, 1.08);
      c *= vec3(1.025, 1.0, 0.965);
      // vinheta suave
      vec2 q = vUv - 0.5; q.x *= uAspecto;
      c *= mix(0.86, 1.0, smoothstep(0.95, 0.25, length(q)));
      // grão de filme
      c += (h(vUv * 900.0 + uTempo) - 0.5) * 0.022 * uGrao * (1.0 - uFim);
      // dissolução no papel, com borda verde de placa
      float n = fbm(vec2(vUv.x * uAspecto, vUv.y) * 4.0 + vec2(0.0, uTempo * 0.02)) * 0.85 + (1.0 - vUv.y) * 0.25;
      float corte = uFim * 1.3 - 0.15;
      float borda = (1.0 - smoothstep(0.0, 0.045, abs(n - corte))) * step(0.001, uFim) * (1.0 - step(0.999, uFim));
      c = mix(c, uVerde, borda * 0.9);
      c = mix(c, uPapel, step(n, corte) * step(0.001, uFim));
      gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
    }`,
};

export function iniciarCena(canvas, opcoes = {}) {
  const leve = !!opcoes.leve;              // celular / GPU fraca: sem pós-processamento, menos árvores
  const parado = !!opcoes.parado;          // modo "menos movimento": sem animação automática
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: leve, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, leve ? 1.25 : 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = !leve;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const NEBLINA = new THREE.Color("#e2e7e1");
  const cena = new THREE.Scene();
  cena.background = NEBLINA.clone();
  cena.fog = leve ? new THREE.Fog(NEBLINA, 110, 430) : new THREE.Fog(NEBLINA, 160, 560);
  // reflexo de ambiente suave para metais e água
  const pmrem = new THREE.PMREMGenerator(renderer);
  const ambiente = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 1000);

  // céu: cúpula com degradê vertical
  const ceu = new THREE.Mesh(new THREE.SphereGeometry(760, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { topo: { value: new THREE.Color("#9fc0dc") }, horiz: { value: NEBLINA } },
    vertexShader: "varying vec3 vP; void main(){ vP = (modelMatrix*vec4(position,1.)).xyz; gl_Position = projectionMatrix*viewMatrix*vec4(vP,1.); }",
    fragmentShader: "uniform vec3 topo; uniform vec3 horiz; varying vec3 vP; void main(){ float h = clamp(normalize(vP).y*1.5, 0., 1.); gl_FragColor = vec4(mix(horiz, topo, pow(h, .65)), 1.); }",
  }));
  cena.add(ceu);

  // nuvens: sprites suaves desenhados em canvas
  const tex = (() => {
    const c = document.createElement("canvas"); c.width = 256; c.height = 128; const g = c.getContext("2d");
    for (let i = 0; i < 9; i++) {
      const x = 50 + Math.random() * 156, y = 50 + Math.random() * 30, r = 26 + Math.random() * 30;
      const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, "rgba(255,255,255,.85)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr; g.fillRect(0, 0, 256, 128);
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const nuvens = [];
  for (let i = 0; i < (leve ? 8 : 16); i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.5 + rnd() * 0.3, depthWrite: false, fog: false }));
    const a = rnd() * Math.PI * 2, r = 260 + rnd() * 260;
    s.position.set(Math.cos(a) * r, 120 + rnd() * 70, Math.sin(a) * r);
    const k = 110 + rnd() * 120; s.scale.set(k, k * 0.42, 1);
    cena.add(s); nuvens.push(s);
  }

  // luz: céu/chão e sol que acompanha a câmera (sombra sempre nítida onde se olha)
  cena.add(new THREE.HemisphereLight("#eef4fb", "#7c6548", 1.0));
  const sol = new THREE.DirectionalLight("#ffeeda", 2.3);
  const SOL_DIR = new THREE.Vector3(-0.55, 0.82, 0.35).normalize();
  sol.castShadow = !leve;
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -110, right: 110, top: 110, bottom: -110, near: 10, far: 480 });
  sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.06;
  cena.add(sol); cena.add(sol.target);

  // ---------- estrada (curva) ----------
  const estradaPts = [
    [-6, -262], [-12, -205], [-18, -150], [-4, -100], [18, -62], [14, -30], [-2, 0], [-8, 34], [8, 70], [40, 102], [60, 140], [70, 205], [74, 262],
  ].map(([x, z]) => new THREE.Vector3(x, 0, z));
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
    if (dac < ACUDE.r + 10) { const k = Math.min(1, Math.max(0, (dac - ACUDE.r + 4) / 14)); const fundo = NIVEL_ACUDE - 2.6; h = fundo + (Math.max(h, NIVEL_ACUDE + 0.6) - fundo) * (k * k * (3 - 2 * k)); }
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

  // ---------- árvores (calculadas antes do terreno, para escurecer o chão sob a mata) ----------
  const TAM = 540;
  const arvores = [];
  const livre = (x, z, folgaEstrada = 11) => !(distEstrada(x, z) < folgaEstrada || noPatio(x, z, 12) || Math.hypot(x - OBRA.x, z - OBRA.z) < OBRA.r + 8 || Math.hypot(x - ACUDE.x, z - ACUDE.z) < ACUDE.r + 5);
  function talhao(x0, z0, x1, z1, tipo, passo, angulo) {
    const c = Math.cos(angulo), s = Math.sin(angulo), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    for (let a = x0; a < x1; a += passo) for (let b = z0; b < z1; b += passo) {
      const lx = a - cx, lz = b - cz, x = cx + lx * c - lz * s + (rnd() - 0.5) * 0.9, z = cz + lx * s + lz * c + (rnd() - 0.5) * 0.9;
      if (Math.abs(x) > TAM / 2 - 4 || Math.abs(z) > TAM / 2 - 4 || !livre(x, z) || rnd() < 0.04) continue;
      arvores.push({ x, z, tipo, h: (tipo === "pinus" ? 9.5 : 16) * (0.82 + rnd() * 0.4) });
    }
  }
  const P = leve ? 1.5 : 1;
  talhao(-130, -240, -24, -110, "euca", 4.4 * P, 0.15);
  talhao(10, -250, 125, -130, "pinus", 4.2 * P, -0.2);
  talhao(-150, -100, -40, -40, "pinus", 4.6 * P, 0.35);
  talhao(36, -110, 140, -40, "euca", 4.8 * P, -0.05);
  talhao(-175, 40, -70, 140, "euca", 5 * P, 0.5);
  talhao(-60, 80, 10, 175, "pinus", 4.6 * P, 0.1);
  talhao(110, 10, 225, 90, "pinus", 5 * P, -0.4);
  talhao(140, 140, 250, 250, "euca", 5.2 * P, 0.2);
  talhao(-250, -60, -175, 60, "pinus", 5.5 * P, 0);
  for (let i = 0; i < (leve ? 140 : 320); i++) { const x = 60 + (rnd() - 0.5) * 120, z = -10 + (rnd() - 0.5) * 70; if (livre(x, z, 12)) arvores.push({ x, z, tipo: rnd() < 0.5 ? "nativa" : "pinus", h: 7 + rnd() * 9 }); }
  for (let i = 0; i < (leve ? 900 : 2200); i++) {
    const x = (rnd() - 0.5) * (TAM - 20), z = (rnd() - 0.5) * (TAM - 20);
    if (fbm(x * 0.02 + 40, z * 0.02 - 13) < 0.56 || !livre(x, z, 12)) continue;
    arvores.push({ x, z, tipo: "nativa", h: 6 + rnd() * 8 });
  }
  // grade espacial para densidade de copas
  const CEL = 6, grade = new Map();
  for (const a of arvores) { const k = Math.floor(a.x / CEL) + "," + Math.floor(a.z / CEL); grade.set(k, (grade.get(k) || 0) + 1); }
  const densidade = (x, z) => { let n = 0; const cx = Math.floor(x / CEL), cz = Math.floor(z / CEL); for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) n += grade.get((cx + i) + "," + (cz + j)) || 0; return n; };

  // ---------- terreno ----------
  const SEG = leve ? 130 : 220;
  const geoT = new THREE.PlaneGeometry(TAM, TAM, SEG, SEG); geoT.rotateX(-Math.PI / 2);
  const pos = geoT.attributes.position, cores = new Float32Array(pos.count * 3);
  const cGrama = new THREE.Color("#6a8a43"), cGrama2 = new THREE.Color("#94a85b"), cSeca = new THREE.Color("#b3ad6e"), cTerra = new THREE.Color("#a5583a"), cTerra2 = new THREE.Color("#c27a52"), cAgua = new THREE.Color("#5e7d6c"), tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), y = alturaFinal(x, z);
    pos.setY(i, y);
    const n = fbm(x * 0.03 + 11, z * 0.03 - 4), n2 = fbm(x * 0.008 - 7, z * 0.008 + 2);
    tmp.copy(cGrama).lerp(cGrama2, n).lerp(cSeca, Math.max(0, n2 - 0.55) * 1.4);
    // faixas de plantio (linhas de cultivo) nas áreas abertas
    tmp.multiplyScalar(0.97 + 0.03 * Math.sin((x * 0.8 + z * 0.35)));
    const dEst = distEstrada(x, z);
    if (noPatio(x, z, 4)) tmp.copy(cTerra).lerp(cTerra2, n * 0.8);
    else if (dEst < 9) tmp.lerp(cTerra, 0.7 * (1 - dEst / 9));
    if (Math.hypot(x - OBRA.x, z - OBRA.z) < OBRA.r) tmp.copy(cTerra).lerp(cTerra2, n);
    if (Math.hypot(x - ACUDE.x, z - ACUDE.z) < ACUDE.r + 2) tmp.lerp(cAgua, 0.6);
    // sombra de mata: chão mais escuro sob copas densas
    const den = densidade(x, z); if (den) tmp.multiplyScalar(1 - Math.min(0.32, den * 0.022));
    cores[i * 3] = tmp.r; cores[i * 3 + 1] = tmp.g; cores[i * 3 + 2] = tmp.b;
  }
  geoT.setAttribute("color", new THREE.BufferAttribute(cores, 3));
  geoT.computeVertexNormals();
  const terreno = new THREE.Mesh(geoT, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 }));
  terreno.receiveShadow = true;
  cena.add(terreno);

  // açude
  const agua = new THREE.Mesh(new THREE.CircleGeometry(ACUDE.r + 3, 48), new THREE.MeshStandardMaterial({ color: "#5d8590", roughness: 0.12, metalness: 0.15, envMap: ambiente, envMapIntensity: 0.9, transparent: true, opacity: 0.92 }));
  agua.rotation.x = -Math.PI / 2; agua.position.set(ACUDE.x, NIVEL_ACUDE, ACUDE.z); agua.receiveShadow = true; cena.add(agua);

  // ---------- fita da estrada + faixa amarela tracejada ----------
  function fita(largura, y, cor, tracejar, rug = 0.9) {
    const N = 640, pts = estrada.getSpacedPoints(N), vert = [], idx = [];
    for (let i = 0; i <= N; i++) {
      const p = pts[i], t = estrada.getTangentAt(i / N), lado = new THREE.Vector3(-t.z, 0, t.x).normalize();
      const k = Math.round(i / N * (altEstrada.length - 1)), h = altEstrada[k] + y;
      vert.push(p.x + lado.x * largura / 2, h, p.z + lado.z * largura / 2, p.x - lado.x * largura / 2, h, p.z - lado.z * largura / 2);
      if (i < N && (!tracejar || Math.floor(i / 3) % 2 === 0)) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(vert, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: cor, roughness: rug, metalness: 0, polygonOffset: true, polygonOffsetFactor: -1 - y * 10 }));
    m.receiveShadow = true; cena.add(m); return m;
  }
  fita(8, 0.12, "#45484a", false, 0.82);
  fita(8.8, 0.08, "#d6cfbf", false);
  fita(0.35, 0.18, "#f2b705", true, 0.6);

  // ---------- instâncias das árvores ----------
  const pinusGeo = mergeGeometries([0, 1, 2].map(i => { const g = new THREE.ConeGeometry(1 - i * 0.22, 0.48, 8); g.translate(0, 0.24 + i * 0.27, 0); return g; }));
  const nativaGeo = (() => { const partes = [[0, 0, 0, 1], [0.55, -0.15, 0.2, 0.7], [-0.5, -0.1, -0.25, 0.75], [0.1, 0.35, -0.1, 0.65]].map(([x, y, z, r]) => { const g = new THREE.IcosahedronGeometry(r, 1); g.translate(x, y, z); return g; }); return mergeGeometries(partes); })();
  const eucaGeo = (() => { const partes = [[0, 0, 0, 0.85], [0.2, 0.75, 0.1, 0.6], [-0.15, -0.6, -0.1, 0.65]].map(([x, y, z, r]) => { const g = new THREE.IcosahedronGeometry(r, 1); g.scale(0.85, 1.25, 0.85); g.translate(x, y, z); return g; }); return mergeGeometries(partes); })();
  const troncoGeo = new THREE.CylinderGeometry(0.16, 0.26, 1, 6); troncoGeo.translate(0, 0.5, 0);
  const matCopa = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.92, metalness: 0, flatShading: true });
  const tipos = { pinus: [], euca: [], nativa: [] };
  arvores.forEach(a => tipos[a.tipo].push(a));
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v3 = new THREE.Vector3(), esc = new THREE.Vector3(), EIXO_Y = new THREE.Vector3(0, 1, 0), cor = new THREE.Color();
  const troncoPinus = new THREE.InstancedMesh(troncoGeo, new THREE.MeshStandardMaterial({ color: "#5d4330", roughness: 1 }), tipos.pinus.length);
  const troncoClaro = new THREE.InstancedMesh(troncoGeo, new THREE.MeshStandardMaterial({ color: "#cfc6b4", roughness: 0.9 }), tipos.euca.length + tipos.nativa.length);
  const copaPinus = new THREE.InstancedMesh(pinusGeo, matCopa, tipos.pinus.length);
  const copaEuca = new THREE.InstancedMesh(eucaGeo, matCopa, tipos.euca.length);
  const copaNativa = new THREE.InstancedMesh(nativaGeo, matCopa, tipos.nativa.length);
  tipos.pinus.forEach((a, i) => {
    const y = alturaFinal(a.x, a.z);
    m4.compose(v3.set(a.x, y, a.z), q.identity(), esc.set(1, a.h * 0.3, 1)); troncoPinus.setMatrixAt(i, m4);
    m4.compose(v3.set(a.x, y + a.h * 0.18, a.z), q.setFromAxisAngle(EIXO_Y, rnd() * 6), esc.set(a.h * 0.24, a.h * 0.9, a.h * 0.24));
    copaPinus.setMatrixAt(i, m4); copaPinus.setColorAt(i, cor.set("#3c6a3e").offsetHSL((rnd() - 0.5) * 0.02, 0, (rnd() - 0.5) * 0.08));
  });
  let it = 0;
  tipos.euca.forEach((a, i) => {
    const y = alturaFinal(a.x, a.z);
    m4.compose(v3.set(a.x, y, a.z), q.identity(), esc.set(0.75, a.h * 0.72, 0.75)); troncoClaro.setMatrixAt(it++, m4);
    m4.compose(v3.set(a.x, y + a.h * 0.8, a.z), q.setFromAxisAngle(EIXO_Y, rnd() * 6), esc.set(a.h * 0.13, a.h * 0.15, a.h * 0.13));
    copaEuca.setMatrixAt(i, m4); copaEuca.setColorAt(i, cor.set("#7f9c6a").offsetHSL((rnd() - 0.5) * 0.03, 0, (rnd() - 0.5) * 0.1));
  });
  tipos.nativa.forEach((a, i) => {
    const y = alturaFinal(a.x, a.z);
    m4.compose(v3.set(a.x, y, a.z), q.identity(), esc.set(0.9, a.h * 0.5, 0.9)); troncoClaro.setMatrixAt(it++, m4);
    m4.compose(v3.set(a.x, y + a.h * 0.68, a.z), q.setFromAxisAngle(EIXO_Y, rnd() * 6), esc.set(a.h * 0.2, a.h * 0.17, a.h * 0.2));
    copaNativa.setMatrixAt(i, m4); copaNativa.setColorAt(i, cor.set(rnd() < 0.15 ? "#8a9a4a" : "#4f7a45").offsetHSL((rnd() - 0.5) * 0.04, 0, (rnd() - 0.5) * 0.1));
  });
  [troncoPinus, troncoClaro, copaPinus, copaEuca, copaNativa].forEach(m => { m.castShadow = !leve; cena.add(m); });

  // ---------- serraria: galpões com telhado em arco e friso vermelho ----------
  const matParede = new THREE.MeshStandardMaterial({ color: "#ebe8e1", roughness: 0.85 });
  const matTelhado = new THREE.MeshStandardMaterial({ color: "#f1efea", roughness: 0.45, metalness: 0.45, envMap: ambiente, envMapIntensity: 0.6, side: THREE.DoubleSide });
  const matFriso = new THREE.MeshStandardMaterial({ color: "#bf3328", roughness: 0.6 });
  const matPorta = new THREE.MeshStandardMaterial({ color: "#3b3f3c", roughness: 0.8 });
  function galpao(x, z, larg, comp, alt, rot) {
    const g = new THREE.Group();
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(larg, alt, comp), matParede); corpo.position.y = alt / 2; g.add(corpo);
    const geoArco = new THREE.CylinderGeometry(larg / 2 * 1.04, larg / 2 * 1.04, comp * 1.02, 32, 1, true, Math.PI / 2, Math.PI); geoArco.rotateX(Math.PI / 2);
    const arco = new THREE.Mesh(geoArco, matTelhado); arco.scale.set(1, 0.32, 1); arco.position.y = alt; g.add(arco);
    const friso = new THREE.Mesh(new THREE.BoxGeometry(larg * 1.05, 0.7, comp * 1.03), matFriso); friso.position.y = alt - 0.2; g.add(friso);
    for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(larg * 0.42, alt * 0.75, 0.2), matPorta); p.position.set(0, alt * 0.375, s * (comp / 2 + 0.05)); g.add(p); }
    g.traverse(o => { if (o.isMesh) { o.castShadow = !leve; o.receiveShadow = true; } });
    g.position.set(x, ALT_PATIO, z); g.rotation.y = rot; cena.add(g); return g;
  }
  galpao(-40, -12, 20, 40, 7, 0);
  galpao(-62, -4, 12, 26, 5.5, 0);
  galpao(-40, 26, 18, 22, 6, 0);

  // autoclave verde (cilindro deitado) + tanques
  const matAuto = new THREE.MeshStandardMaterial({ color: "#3d7a45", roughness: 0.35, metalness: 0.5, envMap: ambiente, envMapIntensity: 0.8 });
  const auto = new THREE.Group();
  const corpoAuto = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 22, 32), matAuto); corpoAuto.rotation.z = Math.PI / 2; auto.add(corpoAuto);
  for (const s of [-1, 1]) { const tampa = new THREE.Mesh(new THREE.SphereGeometry(2.4, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), matAuto); tampa.rotation.z = -s * Math.PI / 2; tampa.scale.y = 0.35; tampa.position.x = s * 11; auto.add(tampa); }
  for (let i = -4; i <= 4; i++) { const anel = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.08, 6, 32), matAuto); anel.rotation.y = Math.PI / 2; anel.position.x = i * 2.4; auto.add(anel); }
  for (const dx of [-6, 6]) { const pe = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.6, 4), new THREE.MeshStandardMaterial({ color: "#555", roughness: 0.7 })); pe.position.set(dx, -2.2, 0); auto.add(pe); }
  const tanqueMat = new THREE.MeshStandardMaterial({ color: "#dfe3df", roughness: 0.3, metalness: 0.6, envMap: ambiente, envMapIntensity: 0.9 });
  for (const [tx, tz] of [[-24.5, 3], [-19.5, 3]]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 7, 24), tanqueMat); t.position.set(tx, ALT_PATIO + 3.5, tz); t.castShadow = !leve; cena.add(t); }
  auto.traverse(o => { if (o.isMesh) { o.castShadow = !leve; o.receiveShadow = true; } });
  auto.position.set(-21, ALT_PATIO + 3.2, -14); auto.rotation.y = Math.PI / 2; cena.add(auto);

  // pacotes de madeira serrada e toras
  const pacotes = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) for (let n = 0; n < 2 + ((r + c) % 2); n++) pacotes.push([-67 + c * 4.2, ALT_PATIO + 0.65 + n * 1.35, 14 + r * 3.1]);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) for (let n = 0; n < 2; n++) pacotes.push([-27 + c * 4.2, ALT_PATIO + 0.65 + n * 1.35, 14 + r * 3.1]);
  const instPac = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.85 }), pacotes.length);
  pacotes.forEach((p, i) => { m4.compose(v3.set(...p), q.identity(), esc.set(3.4, 1.2, 2.4)); instPac.setMatrixAt(i, m4); instPac.setColorAt(i, cor.set(i % 3 ? "#d8a86c" : "#9a8a5a")); });
  instPac.castShadow = !leve; instPac.receiveShadow = true; cena.add(instPac);
  const geoTora = new THREE.CylinderGeometry(0.45, 0.5, 7, 10); geoTora.rotateZ(Math.PI / 2);
  const toras = [];
  for (let l = 0; l < 4; l++) for (let i = 0; i < 14 - l * 2; i++) toras.push([-64, ALT_PATIO + 0.5 + l * 0.85, -34 + i * 0.95 + l * 0.48]);
  const instTora = new THREE.InstancedMesh(geoTora, new THREE.MeshStandardMaterial({ color: "#8a6a49", roughness: 0.95 }), toras.length);
  toras.forEach((p, i) => { m4.compose(v3.set(...p), q.identity(), esc.set(1, 1, 1)); instTora.setMatrixAt(i, m4); });
  instTora.castShadow = !leve; cena.add(instTora);

  // ---------- veículos ----------
  const matCabine = new THREE.MeshStandardMaterial({ color: "#b8231b", roughness: 0.35, metalness: 0.4, envMap: ambiente, envMapIntensity: 0.7 });
  const matChassi = new THREE.MeshStandardMaterial({ color: "#262826", roughness: 0.8 });
  const matVidro = new THREE.MeshStandardMaterial({ color: "#26343d", roughness: 0.1, metalness: 0.8, envMap: ambiente, envMapIntensity: 1 });
  const matTabua = new THREE.MeshStandardMaterial({ color: "#d6a56a", roughness: 0.85 });
  const matToraC = new THREE.MeshStandardMaterial({ color: "#8a6a49", roughness: 0.95 });
  function caminhao(carga) {
    const g = new THREE.Group();
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 2.4), matCabine); cab.position.set(0, 2.1, 5.4); g.add(cab);
    const vidro = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.9, 0.1), matVidro); vidro.position.set(0, 2.7, 6.62); g.add(vidro);
    const chassi = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 13), matChassi); chassi.position.set(0, 0.9, 0); g.add(chassi);
    const roda = new THREE.CylinderGeometry(0.55, 0.55, 0.5, 14); roda.rotateZ(Math.PI / 2);
    for (const z of [5.2, 0.5, -1, -4.5, -5.6]) for (const x of [-1.2, 1.2]) { const r = new THREE.Mesh(roda, matChassi); r.position.set(x, 0.55, z); g.add(r); }
    if (carga === "madeira") for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.4, 3), matTabua); c.position.set(0, 1.85, 2.4 - k * 3.3); g.add(c); }
    else for (let k = 0; k < 9; k++) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 9, 8), matToraC); t.rotation.x = Math.PI / 2; t.position.set(-0.8 + (k % 3) * 0.8, 1.6 + Math.floor(k / 3) * 0.7, -0.5); g.add(t); }
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

  // escavadeira na obra
  const matAmarelo = new THREE.MeshStandardMaterial({ color: "#e8b416", roughness: 0.45, metalness: 0.25, envMap: ambiente, envMapIntensity: 0.6 });
  const escav = new THREE.Group();
  const esteira = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1, 5.4), matChassi); esteira.position.y = 0.5; escav.add(esteira);
  const corpoE = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.8, 3.6), matAmarelo); corpoE.position.y = 1.9; escav.add(corpoE);
  const cabE = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.5, 1.6), matVidro); cabE.position.set(-0.9, 3.4, 0.8); escav.add(cabE);
  const lanca = new THREE.Group(); lanca.position.set(0.6, 2.6, 1.4); escav.add(lanca);
  const braco1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 5.4), matAmarelo); braco1.position.set(0, 1.2, 2.4); braco1.rotation.x = -0.5; lanca.add(braco1);
  const braco2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 4), matAmarelo); braco2.position.set(0, 1.4, 5.8); braco2.rotation.x = 0.9; lanca.add(braco2);
  escav.traverse(o => { if (o.isMesh) o.castShadow = !leve; });
  escav.position.set(OBRA.x - 6, alturaFinal(OBRA.x - 6, OBRA.z) + 0.1, OBRA.z - 4); escav.rotation.y = -0.6; cena.add(escav);

  // casas de madeira perto da obra
  const matMadeira = new THREE.MeshStandardMaterial({ color: "#a8693a", roughness: 0.8 }), matTelhaCasa = new THREE.MeshStandardMaterial({ color: "#7b3a26", roughness: 0.7 });
  function casa(x, z, rot, pronta) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(9, 4, 7), pronta ? matMadeira : new THREE.MeshBasicMaterial({ color: "#c99a62", wireframe: true })); base.position.y = 2; g.add(base);
    if (pronta) {
      const tel = new THREE.Mesh(new THREE.ConeGeometry(6.6, 3.4, 4), matTelhaCasa); tel.rotation.y = Math.PI / 4; tel.scale.set(1.15, 1, 0.85); tel.position.y = 5.7; g.add(tel);
      const varanda = new THREE.Mesh(new THREE.BoxGeometry(9, 0.3, 2.4), new THREE.MeshStandardMaterial({ color: "#c28a55", roughness: 0.8 })); varanda.position.set(0, 0.4, 4.6); g.add(varanda);
    }
    g.traverse(o => { if (o.isMesh) { o.castShadow = !leve; o.receiveShadow = true; } });
    g.position.set(x, alturaFinal(x, z), z); g.rotation.y = rot; cena.add(g);
  }
  casa(OBRA.x + 8, OBRA.z + 6, -0.5, false);
  casa(OBRA.x + 30, OBRA.z - 20, -0.2, true);
  casa(OBRA.x + 44, OBRA.z + 4, -0.9, true);
  casa(OBRA.x - 50, OBRA.z + 18, 0.4, true);

  // harvester no talhão
  const harv = new THREE.Group();
  const hc = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2, 5), matAmarelo); hc.position.y = 1.6; harv.add(hc);
  const hcab = new THREE.Mesh(new THREE.BoxGeometry(2, 1.6, 1.8), matVidro); hcab.position.set(0, 3.3, 1.2); harv.add(hcab);
  const hb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 6), matAmarelo); hb.position.set(0.6, 3.2, 4.6); hb.rotation.x = -0.25; harv.add(hb);
  harv.traverse(o => { if (o.isMesh) o.castShadow = !leve; });
  const pH = estrada.getPointAt(0.12); harv.position.set(pH.x + 16, alturaFinal(pH.x + 16, pH.z) + 0.1, pH.z); harv.rotation.y = 0.9; cena.add(harv);

  // poeira de serraria no sol (partículas leves)
  let poeira = null;
  if (!leve && !parado) {
    const N = 420, pp = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { pp[i * 3] = -70 + rnd() * 80; pp[i * 3 + 1] = ALT_PATIO + rnd() * 14; pp[i * 3 + 2] = -40 + rnd() * 80; }
    const gp = new THREE.BufferGeometry(); gp.setAttribute("position", new THREE.BufferAttribute(pp, 3));
    poeira = new THREE.Points(gp, new THREE.PointsMaterial({ color: "#fff4dc", size: 0.32, transparent: true, opacity: 0.55, depthWrite: false }));
    cena.add(poeira);
  }

  // ---------- marcos (km) que viram etiquetas HTML ----------
  const marcos = [
    { id: "florestal", km: 0, pos: new THREE.Vector3(pH.x + 16, alturaFinal(pH.x + 16, pH.z) + 6, pH.z) },
    { id: "madeireira", km: 2, pos: new THREE.Vector3(-62, ALT_PATIO + 12, -4) },
    { id: "tratadas", km: 9, pos: new THREE.Vector3(-21, ALT_PATIO + 7, -20) },
    { id: "transportes", km: 21, pos: (() => { const p = estrada.getPointAt(0.72); return new THREE.Vector3(p.x, alturaFinal(p.x, p.z) + 7, p.z); })() },
    { id: "escavacoes", km: 25, pos: new THREE.Vector3(OBRA.x - 6, alturaFinal(OBRA.x, OBRA.z) + 9, OBRA.z - 4) },
  ];

  // ---------- câmera ----------
  const voo = new THREE.CatmullRomCurve3([
    new THREE.Vector3(70, 85, -270), new THREE.Vector3(75, 60, -140), new THREE.Vector3(60, 46, -58),
    new THREE.Vector3(62, 50, 52), new THREE.Vector3(128, 50, 66), new THREE.Vector3(150, 40, 110),
  ]);
  const alvo = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-10, 4, -175), new THREE.Vector3(-5, 4, -65), new THREE.Vector3(-26, 3, -2),
    new THREE.Vector3(-22, 3, -6), new THREE.Vector3(55, 2, 128), new THREE.Vector3(90, 0, 150),
  ]);

  // ---------- pós-processamento ----------
  let composer = null, passoFinal = null;
  if (!leve) {
    const rt = new THREE.WebGLRenderTarget(2, 2, { samples: 4, type: THREE.HalfFloatType });
    composer = new EffectComposer(renderer, rt);
    composer.addPass(new RenderPass(cena, camera));
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
    // sol acompanha o ponto observado
    sol.target.position.copy(olhar);
    sol.position.copy(olhar).addScaledVector(SOL_DIR, 220);
  }
  function redimensionar() {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = w < h ? 58 : 42; camera.updateProjectionMatrix();
    if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); passoFinal.uniforms.uAspecto.value = w / h; }
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
      for (const c of caminhoes) c.t = (c.t + c.vel * dt) % 1;
      posicionarCaminhoes();
      lanca.rotation.x = Math.sin(s * 0.8) * 0.18; lanca.rotation.y = Math.sin(s * 0.35) * 0.25;
      for (const n of nuvens) { n.position.x += dt * 1.6; if (n.position.x > 520) n.position.x = -520; }
      if (poeira) { const a = poeira.geometry.attributes.position; for (let i = 0; i < a.count; i++) { let y = a.getY(i) + dt * 0.35; if (y > ALT_PATIO + 15) y = ALT_PATIO; a.setY(i, y); a.setX(i, a.getX(i) + Math.sin(s + i) * dt * 0.08); } a.needsUpdate = true; }
    }
    posicionarCamera();
    if (composer) { passoFinal.uniforms.uFim.value = fim; passoFinal.uniforms.uTempo.value = s; composer.render(); }
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
  if (!parado) requestAnimationFrame(laco);

  return {
    marcos,
    temDissolucao: !!composer,
    definirProgresso(t) { alvoProg = Math.min(Math.max(t, 0), 1); if (parado) quadro(0); },
    definirFim(f) { fim = Math.min(Math.max(f, 0), 1); if (parado) quadro(0); },
    destruir() { vivo = false; io.disconnect(); window.removeEventListener("resize", aoRedimensionar); window.removeEventListener("pointermove", aoMouse); renderer.dispose(); },
  };
}
