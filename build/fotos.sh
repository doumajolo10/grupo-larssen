#!/bin/sh
# Converte as fotos ampliadas (pesquisa/up, Real-ESRGAN 4x) para o site:
#   img/g/<nome>.webp  2000 px de largura (telas grandes)
#   img/p/<nome>.webp   900 px de largura (celular, miniaturas)
# Nunca amplia além do tamanho da ampliação. Uso: sh build/fotos.sh
cd "$(dirname "$0")/.." || exit 1
mkdir -p img/g img/p
for f in pesquisa/up/*.jpg; do
  n=$(basename "$f" .jpg)
  case "$n" in *favicon*|*icon-check*|*logo*|*escavacoes*|*tratadas|*larssen) continue;; esac
  [ -f "img/g/$n.webp" ] || ffmpeg -loglevel error -y -i "$f" -vf "scale='min(2000,iw)':-2:flags=lanczos" -c:v libwebp -quality 82 "img/g/$n.webp"
  [ -f "img/p/$n.webp" ] || ffmpeg -loglevel error -y -i "$f" -vf "scale='min(900,iw)':-2:flags=lanczos" -c:v libwebp -quality 78 "img/p/$n.webp"
done
echo "g: $(ls img/g | wc -l)  p: $(ls img/p | wc -l)  tamanho: $(du -sh img | cut -f1)"
