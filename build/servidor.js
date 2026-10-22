// Servidor estático local para testar o site (porta 4040).
const http = require("http"), fs = require("fs"), path = require("path");
const RAIZ = path.join(__dirname, ".."), PORTA = +(process.env.PORT || 4040);
// mesmos cabeçalhos de segurança do vercel.json (sem HSTS e upgrade-insecure-requests, que não cabem em http://localhost)
const SEG = {}; for (const h of JSON.parse(fs.readFileSync(path.join(RAIZ, "vercel.json"), "utf8")).headers[0].headers) if (h.key !== "Strict-Transport-Security") SEG[h.key] = h.value.replace("; upgrade-insecure-requests", "");
const TIPOS = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".webp": "image/webp", ".woff2": "font/woff2", ".json": "application/json", ".xml": "application/xml", ".txt": "text/plain", ".png": "image/png", ".jpg": "image/jpeg" };
http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split("?")[0]);
  if (u.endsWith("/")) u += "index.html";
  if (u === "/painel") u = "/painel/index.html"; // mesmo rewrite do vercel.json
  if (/^\/produto-[a-z0-9-]+\.html$/.test(u) && !fs.existsSync(path.join(RAIZ, u))) u = "/produto.html"; // produto novo do painel antes do build
  const f = path.join(RAIZ, path.normalize(u).replace(/^([/\\])+/, ""));
  if (!f.startsWith(RAIZ)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => {
    if (e) { fs.readFile(path.join(RAIZ, "404.html"), (e2, d2) => { res.writeHead(404, { "Content-Type": TIPOS[".html"] }); res.end(d2 || "404"); }); return; }
    res.writeHead(200, { ...SEG, "Content-Type": TIPOS[path.extname(f).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(d);
  });
}).listen(PORTA, () => console.log("Grupo Larssen em http://localhost:" + PORTA));
