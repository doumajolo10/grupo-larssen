// Cena 3D da Rota da Madeira (Three.js). Floresta plantada -> serraria -> autoclave -> estrada -> obra.
// Exporta iniciarCena(canvas, opcoes) e devolve { definirProgresso(t), destruir(), marcos }.
import * as THREE from "three";

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

export function iniciarCena(canvas, opcoes = {}) {
  const leve = !!opcoes.leve;              // celular / GPU fraca
  const parado = !!opcoes.parado;          // prefers-reduced-motion
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !leve, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, leve ? 1.25 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !leve;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const NEBLINA = new THREE.Color("#e4e8e2");
  const cena = new THREE.Scene();
  cena.background = NEBLINA.clone();
  cena.fog = new THREE.Fog(NEBLINA, 120, 420);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 900);

  // céu: cúpula com degradê vertical suave (azul claro no alto, névoa no horizonte)
  const ceu = new THREE.Mesh(new THREE.SphereGeometry(700, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { topo: { value: new THREE.Color("#a9c6df") }, horiz: { value: NEBLINA } },
    vertexShader: "varying vec3 vP; void main(){ vP = (modelMatrix*vec4(position,1.)).xyz; gl_Position = projectionMatrix*viewMatrix*vec4(vP,1.); }",
    fragmentShader: "uniform vec3 topo; uniform vec3 horiz; varying vec3 vP; void main(){ float h = clamp(normalize(vP).y*1.6, 0., 1.); gl_FragColor = vec4(mix(horiz, topo, pow(h, .7)), 1.); }",
  }));
  cena.add(ceu);

  // luz
  cena.add(new THREE.HemisphereLight("#eef3f8", "#7a6248", 1.05));
  const sol = new THREE.DirectionalLight("#fff1dc", 2.1);
  sol.position.set(-90, 140, 60);
  sol.castShadow = !leve;
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -90, right: 90, top: 90, bottom: -90, near: 10, far: 400 });
  sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.06;
  cena.add(sol);

  // ---------- estrada (curva) ----------
  const estradaPts = [
    [-10, -205], [-18, -150], [-4, -100], [18, -62], [14, -30], [-2, 0], [-8, 34], [8, 70], [40, 102], [60, 140], [70, 205],
  ].map(([x, z]) => new THREE.Vector3(x, 0, z));
  const estrada = new THREE.CatmullRomCurve3(estradaPts, false, "catmullrom", 0.4);
  const amostras = estrada.getSpacedPoints(400);
  const distEstrada = (x, z) => { let m = 1e9; for (let i = 0; i < amostras.length; i += 2) { const p = amostras[i]; const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < m) m = d; } return Math.sqrt(m); };

  // pátio da serraria (retângulo plano de terra vermelha)
  const PATIO = { x0: -76, x1: 10, z0: -38, z1: 42 };
  const noPatio = (x, z, folga = 0) => x > PATIO.x0 - folga && x < PATIO.x1 + folga && z > PATIO.z0 - folga && z < PATIO.z1 + folga;
  // obra (fim da rota): terreno sendo escavado
  const OBRA = { x: 92, z: 150, r: 22 };

  // altura do terreno
  const ALT_PATIO = 1.2;
  function alturaBruta(x, z) { return (fbm(x * 0.012 + 3.1, z * 0.012 + 8.7) - 0.45) * 34 + (fbm(x * 0.05, z * 0.05) - 0.5) * 3; }
  function altura(x, z) {
    let h = alturaBruta(x, z);
    // achata no pátio
    const dx = Math.max(PATIO.x0 - x, 0, x - PATIO.x1), dz = Math.max(PATIO.z0 - z, 0, z - PATIO.z1);
    const dp = Math.sqrt(dx * dx + dz * dz);
    const kp = Math.min(dp / 18, 1); h = ALT_PATIO + (h - ALT_PATIO) * (kp * kp * (3 - 2 * kp));
    // obra rebaixada
    const dob = Math.hypot(x - OBRA.x, z - OBRA.z);
    if (dob < OBRA.r) h -= (1 - dob / OBRA.r) * 3.2;
    return h;
  }
  // altura da estrada = terreno suavizado ao longo da curva
  const altEstrada = amostras.map(p => altura(p.x, p.z));
  for (let k = 0; k < 6; k++) for (let i = 1; i < altEstrada.length - 1; i++) altEstrada[i] = (altEstrada[i - 1] + altEstrada[i] * 2 + altEstrada[i + 1]) / 4;
  function alturaFinal(x, z) {
    let m = 1e9, mi = 0;
    for (let i = 0; i < amostras.length; i += 2) { const p = amostras[i]; const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < m) { m = d; mi = i; } }
    const d = Math.sqrt(m), h = altura(x, z);
    if (d < 14) { const k = Math.max(0, (d - 5) / 9); const s = k * k * (3 - 2 * k); return altEstrada[mi] - 0.15 + (h - altEstrada[mi] + 0.15) * s; }
    return h;
  }

  // ---------- terreno ----------
  const TAM = 520, SEG = leve ? 120 : 200;
  const geoT = new THREE.PlaneGeometry(TAM, TAM, SEG, SEG); geoT.rotateX(-Math.PI / 2);
  const pos = geoT.attributes.position, cores = new Float32Array(pos.count * 3);
  const cGrama = new THREE.Color("#6c8c45"), cGrama2 = new THREE.Color("#93a65a"), cTerra = new THREE.Color("#a5583a"), cTerra2 = new THREE.Color("#c27a52"), tmp = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), y = alturaFinal(x, z);
    pos.setY(i, y);
    const n = fbm(x * 0.03 + 11, z * 0.03 - 4);
    tmp.copy(cGrama).lerp(cGrama2, n);
    const dEst = distEstrada(x, z);
    if (noPatio(x, z, 4)) tmp.copy(cTerra).lerp(cTerra2, n * 0.8);
    else if (dEst < 9) tmp.lerp(cTerra, 0.75 * (1 - dEst / 9));
    if (Math.hypot(x - OBRA.x, z - OBRA.z) < OBRA.r) tmp.copy(cTerra).lerp(cTerra2, n);
    cores[i * 3] = tmp.r; cores[i * 3 + 1] = tmp.g; cores[i * 3 + 2] = tmp.b;
  }
  geoT.setAttribute("color", new THREE.BufferAttribute(cores, 3));
  geoT.computeVertexNormals();
  const terreno = new THREE.Mesh(geoT, new THREE.MeshLambertMaterial({ vertexColors: true }));
  terreno.receiveShadow = true;
  cena.add(terreno);

  // ---------- fita da estrada + faixa amarela tracejada ----------
  function fita(largura, y, cor, tracejar) {
    const N = 600, pts = estrada.getSpacedPoints(N), vert = [], idx = [];
    for (let i = 0; i <= N; i++) {
      const p = pts[i], t = estrada.getTangentAt(i / N), lado = new THREE.Vector3(-t.z, 0, t.x).normalize();
      const k = Math.round(i / N * (altEstrada.length - 1)), h = altEstrada[k] + y;
      vert.push(p.x + lado.x * largura / 2, h, p.z + lado.z * largura / 2, p.x - lado.x * largura / 2, h, p.z - lado.z * largura / 2);
      if (i < N && (!tracejar || Math.floor(i / 3) % 2 === 0)) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(vert, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: cor, polygonOffset: true, polygonOffsetFactor: -1 - y * 10 }));
    m.receiveShadow = true; cena.add(m); return m;
  }
  fita(8, 0.12, "#4a4d49", false);
  fita(8.8, 0.08, "#d9d2c3", false);   // acostamento claro
  fita(0.35, 0.18, "#f2b705", true);   // faixa amarela

  // ---------- florestas plantadas (talhões em linhas) ----------
  const geoTronco = new THREE.CylinderGeometry(0.18, 0.28, 1, 5); geoTronco.translate(0, 0.5, 0);
  const geoPinus = new THREE.ConeGeometry(1, 1, 7); geoPinus.translate(0, 0.5, 0);
  const geoEuca = new THREE.IcosahedronGeometry(1, 0); geoEuca.scale(0.8, 1.6, 0.8);
  const matTronco = new THREE.MeshLambertMaterial({ color: "#6b4f35" });
  const matPinus = new THREE.MeshLambertMaterial({ color: "#ffffff", flatShading: true });
  const matEuca = new THREE.MeshLambertMaterial({ color: "#ffffff", flatShading: true });
  const arvores = [];
  function talhao(x0, z0, x1, z1, tipo, passo, angulo) {
    const c = Math.cos(angulo), s = Math.sin(angulo), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    for (let a = x0; a < x1; a += passo) for (let b = z0; b < z1; b += passo) {
      const lx = a - cx, lz = b - cz, x = cx + lx * c - lz * s + (rnd() - 0.5) * 0.9, z = cz + lx * s + lz * c + (rnd() - 0.5) * 0.9;
      if (Math.abs(x) > TAM / 2 - 4 || Math.abs(z) > TAM / 2 - 4) continue;
      if (distEstrada(x, z) < 11 || noPatio(x, z, 12) || Math.hypot(x - OBRA.x, z - OBRA.z) < OBRA.r + 8) continue;
      if (rnd() < 0.04) continue; // falhas de plantio
      arvores.push({ x, z, tipo, h: (tipo === "pinus" ? 9 : 15) * (0.8 + rnd() * 0.45) });
    }
  }
  const P = leve ? 1.5 : 1;
  // talhões ao norte (início da rota) e grupos ao redor
  talhao(-130, -230, -24, -110, "euca", 4.4 * P, 0.15);
  talhao(10, -240, 120, -130, "pinus", 4.2 * P, -0.2);
  talhao(-150, -100, -40, -40, "pinus", 4.6 * P, 0.35);
  talhao(36, -110, 140, -40, "euca", 4.8 * P, -0.05);
  talhao(-170, 40, -70, 140, "euca", 5 * P, 0.5);
  talhao(-60, 80, 10, 170, "pinus", 4.6 * P, 0.1);
  talhao(110, 10, 220, 90, "pinus", 5 * P, -0.4);
  talhao(140, 140, 240, 240, "euca", 5.2 * P, 0.2);
  talhao(-240, -60, -170, 60, "pinus", 5.5 * P, 0);
  // mata nativa (irregular)
  for (let i = 0; i < (leve ? 140 : 320); i++) {
    const x = 60 + (rnd() - 0.5) * 120, z = -10 + (rnd() - 0.5) * 70;
    if (distEstrada(x, z) > 12 && !noPatio(x, z, 10)) arvores.push({ x, z, tipo: rnd() < 0.5 ? "euca" : "pinus", h: 7 + rnd() * 9 });
  }
  for (let i = 0; i < (leve ? 900 : 2200); i++) {
    const x = (rnd() - 0.5) * (TAM - 20), z = (rnd() - 0.5) * (TAM - 20);
    if (fbm(x * 0.02 + 40, z * 0.02 - 13) < 0.56) continue;
    if (distEstrada(x, z) < 12 || noPatio(x, z, 14) || Math.hypot(x - OBRA.x, z - OBRA.z) < OBRA.r + 14) continue;
    arvores.push({ x, z, tipo: "euca", h: 6 + rnd() * 8 });
  }
  const nP = arvores.filter(a => a.tipo === "pinus").length, nE = arvores.length - nP;
  const instTronco = new THREE.InstancedMesh(geoTronco, matTronco, arvores.length);
  const instPinus = new THREE.InstancedMesh(geoPinus, matPinus, nP);
  const instEuca = new THREE.InstancedMesh(geoEuca, matEuca, nE);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v3 = new THREE.Vector3(), esc = new THREE.Vector3(), EIXO_Y = new THREE.Vector3(0, 1, 0);
  let ip = 0, ie = 0;
  const cor = new THREE.Color();
  arvores.forEach((a, i) => {
    const y = alturaFinal(a.x, a.z);
    if (a.tipo === "pinus") {
      m4.compose(v3.set(a.x, y, a.z), q.identity(), esc.set(1, a.h * 0.35, 1)); instTronco.setMatrixAt(i, m4);
      m4.compose(v3.set(a.x, y + a.h * 0.2, a.z), q.setFromAxisAngle(EIXO_Y, rnd() * 6), esc.set(a.h * 0.22, a.h * 0.85, a.h * 0.22));
      instPinus.setMatrixAt(ip, m4); instPinus.setColorAt(ip, cor.set("#3f6b40").offsetHSL(0, 0, (rnd() - 0.5) * 0.08)); ip++;
    } else {
      m4.compose(v3.set(a.x, y, a.z), q.identity(), esc.set(0.8, a.h * 0.75, 0.8)); instTronco.setMatrixAt(i, m4);
      m4.compose(v3.set(a.x, y + a.h * 0.8, a.z), q.setFromAxisAngle(EIXO_Y, rnd() * 6), esc.set(a.h * 0.13, a.h * 0.17, a.h * 0.13));
      instEuca.setMatrixAt(ie, m4); instEuca.setColorAt(ie, cor.set("#7d9a68").offsetHSL((rnd() - 0.5) * 0.03, 0, (rnd() - 0.5) * 0.1)); ie++;
    }
  });
  [instTronco, instPinus, instEuca].forEach(m => { m.castShadow = !leve; m.receiveShadow = false; cena.add(m); });

  // ---------- serraria: galpões com telhado em arco e friso vermelho ----------
  const matParede = new THREE.MeshLambertMaterial({ color: "#e9e6df" });
  const matTelhado = new THREE.MeshLambertMaterial({ color: "#f3f1ec", side: THREE.DoubleSide });
  const matFriso = new THREE.MeshLambertMaterial({ color: "#c0392b" });
  function galpao(x, z, larg, comp, alt, rot) {
    const g = new THREE.Group();
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(larg, alt, comp), matParede); corpo.position.y = alt / 2; g.add(corpo);
    const geoArco = new THREE.CylinderGeometry(larg / 2 * 1.04, larg / 2 * 1.04, comp * 1.02, 28, 1, true, Math.PI / 2, Math.PI); geoArco.rotateX(Math.PI / 2);
    const arco = new THREE.Mesh(geoArco, matTelhado); arco.scale.set(1, 0.32, 1); arco.position.y = alt; g.add(arco);
    const friso = new THREE.Mesh(new THREE.BoxGeometry(larg * 1.05, 0.7, comp * 1.03), matFriso); friso.position.y = alt - 0.2; g.add(friso);
    g.traverse(o => { if (o.isMesh) { o.castShadow = !leve; o.receiveShadow = true; } });
    g.position.set(x, ALT_PATIO, z); g.rotation.y = rot; cena.add(g); return g;
  }
  galpao(-40, -12, 20, 40, 7, 0);
  galpao(-62, -4, 12, 26, 5.5, 0);
  galpao(-40, 26, 18, 22, 6, 0);

  // autoclave verde (cilindro deitado) + tanques
  const matAuto = new THREE.MeshStandardMaterial({ color: "#3d7a45", roughness: 0.45, metalness: 0.35 });
  const auto = new THREE.Group();
  const corpoAuto = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 22, 28), matAuto); corpoAuto.rotation.z = Math.PI / 2; auto.add(corpoAuto);
  for (const s of [-1, 1]) { const tampa = new THREE.Mesh(new THREE.SphereGeometry(2.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), matAuto); tampa.rotation.z = -s * Math.PI / 2; tampa.scale.y = 0.35; tampa.position.x = s * 11; auto.add(tampa); }
  for (let i = -4; i <= 4; i++) { const anel = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.08, 6, 28), matAuto); anel.rotation.y = Math.PI / 2; anel.position.x = i * 2.4; auto.add(anel); }
  for (const dx of [-6, 6]) { const pe = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.6, 4), new THREE.MeshLambertMaterial({ color: "#555" })); pe.position.set(dx, -2.2, 0); auto.add(pe); }
  const tanqueMat = new THREE.MeshStandardMaterial({ color: "#dfe3df", roughness: 0.4, metalness: 0.4 });
  for (const [tx, tz] of [[-24.5, 3], [-19.5, 3]]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 7, 20), tanqueMat); t.position.set(tx, ALT_PATIO + 3.5, tz); t.castShadow = !leve; cena.add(t); }
  auto.traverse(o => { if (o.isMesh) { o.castShadow = !leve; o.receiveShadow = true; } });
  auto.position.set(-21, ALT_PATIO + 3.2, -14); auto.rotation.y = Math.PI / 2; cena.add(auto);

  // pilhas de madeira serrada (pacotes) e toras
  const geoTabua = new THREE.BoxGeometry(1, 1, 1);
  const matTabua = new THREE.MeshLambertMaterial({ color: "#d6a56a" });
  const pacotes = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) for (let n = 0; n < 2 + ((r + c) % 2); n++) pacotes.push([-67 + c * 4.2, ALT_PATIO + 0.65 + n * 1.35, 14 + r * 3.1]);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) for (let n = 0; n < 2; n++) pacotes.push([-27 + c * 4.2, ALT_PATIO + 0.65 + n * 1.35, 14 + r * 3.1]);
  const instPac = new THREE.InstancedMesh(geoTabua, new THREE.MeshLambertMaterial({ color: "#ffffff" }), pacotes.length);
  pacotes.forEach((p, i) => { m4.compose(v3.set(...p), q.identity(), esc.set(3.4, 1.2, 2.4)); instPac.setMatrixAt(i, m4); instPac.setColorAt(i, cor.set(i % 3 ? "#d6a56a" : "#9c7a4a")); });
  instPac.castShadow = !leve; instPac.receiveShadow = true; cena.add(instPac);
  const geoTora = new THREE.CylinderGeometry(0.45, 0.5, 7, 8); geoTora.rotateZ(Math.PI / 2);
  const toras = [];
  for (let l = 0; l < 4; l++) for (let i = 0; i < 14 - l * 2; i++) toras.push([-64, ALT_PATIO + 0.5 + l * 0.85, -34 + i * 0.95 + l * 0.48]);
  const instTora = new THREE.InstancedMesh(geoTora, new THREE.MeshLambertMaterial({ color: "#8a6a49" }), toras.length);
  toras.forEach((p, i) => { m4.compose(v3.set(...p), q.identity(), esc.set(1, 1, 1)); instTora.setMatrixAt(i, m4); });
  instTora.castShadow = !leve; cena.add(instTora);

  // ---------- veículos ----------
  const matCabine = new THREE.MeshStandardMaterial({ color: "#b8231b", roughness: 0.5, metalness: 0.3 });
  const matChassi = new THREE.MeshLambertMaterial({ color: "#2a2a2a" });
  const matVidro = new THREE.MeshStandardMaterial({ color: "#26343d", roughness: 0.15, metalness: 0.6 });
  function caminhao(carga) {
    const g = new THREE.Group();
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 2.4), matCabine); cab.position.set(0, 2.1, 5.4); g.add(cab);
    const vidro = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.9, 0.1), matVidro); vidro.position.set(0, 2.7, 6.62); g.add(vidro);
    const chassi = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 13), matChassi); chassi.position.set(0, 0.9, 0); g.add(chassi);
    const roda = new THREE.CylinderGeometry(0.55, 0.55, 0.5, 12); roda.rotateZ(Math.PI / 2);
    for (const z of [5.2, 0.5, -1, -4.5, -5.6]) for (const x of [-1.2, 1.2]) { const r = new THREE.Mesh(roda, matChassi); r.position.set(x, 0.55, z); g.add(r); }
    if (carga === "madeira") for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.4, 3), matTabua); c.position.set(0, 1.85, 2.4 - k * 3.3); g.add(c); }
    else for (let k = 0; k < 9; k++) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 9, 7), new THREE.MeshLambertMaterial({ color: "#8a6a49" })); t.rotation.x = Math.PI / 2; t.position.set(-0.8 + (k % 3) * 0.8, 1.6 + Math.floor(k / 3) * 0.7, -0.5); g.add(t); }
    g.traverse(o => { if (o.isMesh) o.castShadow = !leve; });
    cena.add(g); return g;
  }
  const caminhoes = [{ obj: caminhao("madeira"), t: 0.62, vel: 0.012, lado: -1 }, { obj: caminhao("toras"), t: 0.2, vel: 0.009, lado: 1 }, { obj: caminhao("madeira"), t: 0.86, vel: 0.011, lado: -1 }];

  // escavadeira amarela na obra
  const matAmarelo = new THREE.MeshStandardMaterial({ color: "#e8b416", roughness: 0.5, metalness: 0.2 });
  const escav = new THREE.Group();
  const esteira = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1, 5.4), matChassi); esteira.position.y = 0.5; escav.add(esteira);
  const corpoE = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.8, 3.6), matAmarelo); corpoE.position.y = 1.9; escav.add(corpoE);
  const cabE = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.5, 1.6), matVidro); cabE.position.set(-0.9, 3.4, 0.8); escav.add(cabE);
  const lanca = new THREE.Group(); lanca.position.set(0.6, 2.6, 1.4); escav.add(lanca);
  const braco1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 5.4), matAmarelo); braco1.position.set(0, 1.2, 2.4); braco1.rotation.x = -0.5; lanca.add(braco1);
  const braco2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 4), matAmarelo); braco2.position.set(0, 1.4, 5.8); braco2.rotation.x = 0.9; lanca.add(braco2);
  escav.traverse(o => { if (o.isMesh) o.castShadow = !leve; });
  escav.position.set(OBRA.x - 6, alturaFinal(OBRA.x - 6, OBRA.z) + 0.1, OBRA.z - 4); escav.rotation.y = -0.6; cena.add(escav);

  // casas de madeira perto da obra (uma pronta, uma em montagem)
  const matMadeira = new THREE.MeshLambertMaterial({ color: "#a8693a" }), matTelhaCasa = new THREE.MeshLambertMaterial({ color: "#7b3a26" });
  function casa(x, z, rot, pronta) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(9, 4, 7), pronta ? matMadeira : new THREE.MeshLambertMaterial({ color: "#d9b07c", wireframe: true })); base.position.y = 2; g.add(base);
    if (pronta) { const tel = new THREE.Mesh(new THREE.ConeGeometry(6.6, 3.4, 4), matTelhaCasa); tel.rotation.y = Math.PI / 4; tel.scale.set(1.15, 1, 0.85); tel.position.y = 5.7; g.add(tel);
      const varanda = new THREE.Mesh(new THREE.BoxGeometry(9, 0.3, 2.4), new THREE.MeshLambertMaterial({ color: "#c28a55" })); varanda.position.set(0, 0.4, 4.6); g.add(varanda); }
    g.traverse(o => { if (o.isMesh) { o.castShadow = !leve; o.receiveShadow = true; } });
    g.position.set(x, alturaFinal(x, z), z); g.rotation.y = rot; cena.add(g);
  }
  casa(OBRA.x + 8, OBRA.z + 6, -0.5, false);
  casa(OBRA.x + 30, OBRA.z - 20, -0.2, true);
  casa(OBRA.x + 44, OBRA.z + 4, -0.9, true);
  casa(OBRA.x - 30, OBRA.z + 26, 0.4, true);

  // harvester no talhão (início da rota)
  const harv = new THREE.Group();
  const hc = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2, 5), matAmarelo); hc.position.y = 1.6; harv.add(hc);
  const hcab = new THREE.Mesh(new THREE.BoxGeometry(2, 1.6, 1.8), matVidro); hcab.position.set(0, 3.3, 1.2); harv.add(hcab);
  const hb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 6), matAmarelo); hb.position.set(0.6, 3.2, 4.6); hb.rotation.x = -0.25; harv.add(hb);
  harv.traverse(o => { if (o.isMesh) o.castShadow = !leve; });
  const pH = estrada.getPointAt(0.12); harv.position.set(pH.x + 16, alturaFinal(pH.x + 16, pH.z) + 0.1, pH.z); harv.rotation.y = 0.9; cena.add(harv);

  // ---------- marcos (km) que viram etiquetas HTML ----------
  const marcos = [
    { id: "florestal", km: 0, pos: new THREE.Vector3(pH.x + 16, alturaFinal(pH.x + 16, pH.z) + 6, pH.z) },
    { id: "madeireira", km: 2, pos: new THREE.Vector3(-46, ALT_PATIO + 15, -26) },
    { id: "tratadas", km: 9, pos: new THREE.Vector3(-21, ALT_PATIO + 9, -14) },
    { id: "transportes", km: 21, pos: (() => { const p = estrada.getPointAt(0.72); return new THREE.Vector3(p.x, alturaFinal(p.x, p.z) + 7, p.z); })() },
    { id: "escavacoes", km: 25, pos: new THREE.Vector3(OBRA.x - 6, alturaFinal(OBRA.x, OBRA.z) + 9, OBRA.z - 4) },
  ];

  // ---------- câmera: trajeto do voo ----------
  const voo = new THREE.CatmullRomCurve3([
    new THREE.Vector3(70, 85, -270), new THREE.Vector3(75, 60, -140), new THREE.Vector3(60, 46, -58),
    new THREE.Vector3(62, 50, 52), new THREE.Vector3(128, 50, 66), new THREE.Vector3(150, 40, 110),
  ]);
  const alvo = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-10, 4, -175), new THREE.Vector3(-5, 4, -65), new THREE.Vector3(-26, 3, -2),
    new THREE.Vector3(-22, 3, -6), new THREE.Vector3(55, 2, 128), new THREE.Vector3(90, 0, 150),
  ]);

  let progresso = 0, alvoProg = 0, mouseX = 0, mouseY = 0, mx = 0, my = 0, vivo = true, visivel = true, ultimo = performance.now();
  const olhar = new THREE.Vector3(), base = new THREE.Vector3();
  function posicionarCamera() {
    const t = Math.min(Math.max(progresso, 0), 1);
    voo.getPointAt(t, base); alvo.getPointAt(t, olhar);
    camera.position.set(base.x + mx * 10, base.y + my * 5, base.z);
    camera.lookAt(olhar);
  }
  function redimensionar() {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = w < h ? 58 : 42; camera.updateProjectionMatrix();
  }
  redimensionar();
  const aoRedimensionar = () => { redimensionar(); if (parado) quadro(0); };
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
    progresso += (alvoProg - progresso) * Math.min(1, dt * 3.2);
    mx += (mouseX - mx) * Math.min(1, dt * 2); my += (mouseY - my) * Math.min(1, dt * 2);
    if (!parado) for (const c of caminhoes) {
      c.t = (c.t + c.vel * dt) % 1;
      const p = estrada.getPointAt(c.t), tg = estrada.getTangentAt(c.t), lado = new THREE.Vector3(-tg.z, 0, tg.x).normalize();
      const k = Math.round(c.t * (altEstrada.length - 1));
      c.obj.position.set(p.x + lado.x * 2 * c.lado, altEstrada[k] + 0.15, p.z + lado.z * 2 * c.lado);
      c.obj.rotation.y = Math.atan2(tg.x, tg.z) + (c.lado > 0 ? Math.PI : 0);
    }
    if (!parado) { const s = performance.now() / 1000; lanca.rotation.x = Math.sin(s * 0.8) * 0.18; lanca.rotation.y = Math.sin(s * 0.35) * 0.25; }
    posicionarCamera();
    renderer.render(cena, camera);
    if (opcoes.aoQuadro) opcoes.aoQuadro(projetarMarcos(), progresso);
  }
  function laco(agora) {
    if (!vivo) return;
    const dt = Math.min(0.05, (agora - ultimo) / 1000); ultimo = agora;
    if (visivel && !document.hidden) quadro(dt);
    requestAnimationFrame(laco);
  }
  // primeiro quadro já posicionado
  quadro(0);
  if (!parado) requestAnimationFrame(laco);

  return {
    marcos,
    definirProgresso(t) { alvoProg = Math.min(Math.max(t, 0), 1); if (parado) { progresso = alvoProg; quadro(0); } },
    destruir() { vivo = false; io.disconnect(); window.removeEventListener("resize", aoRedimensionar); window.removeEventListener("pointermove", aoMouse); renderer.dispose(); },
  };
}
