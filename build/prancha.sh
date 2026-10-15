#!/bin/sh
# Junta capturas em pranchas para revisão: sh build/prancha.sh <prefixo> <saida.png> [colunas] [largura]
# ex.: sh build/prancha.sh d-p-florestal pesquisa/ver/florestal.png 4 480
cd "$(dirname "$0")/.." || exit 1
pref="$1"; out="$2"; cols="${3:-4}"; larg="${4:-480}"
files=$(ls pesquisa/shots/"$pref"*.png 2>/dev/null | sort -V)
[ -z "$files" ] && { echo "nada para $pref"; exit 1; }
args=""; n=0; filt=""
for f in $files; do args="$args -i $f"; filt="$filt[$n]scale=$larg:-1,pad=$larg+6:ih+6:3:3:color=0x888888[v$n];"; n=$((n+1)); done
rows=$(( (n + cols - 1) / cols ))
tot=$((rows * cols))
k=$n
while [ $k -lt $tot ]; do args="$args -f lavfi -i color=0x888888:s=$((larg+6))x10:d=1"; filt="$filt[$k]null[v$k];"; k=$((k+1)); done
lay=""
for r in $(seq 0 $((rows-1))); do
  row=""; for c in $(seq 0 $((cols-1))); do row="$row[v$((r*cols+c))]"; done
  if [ $cols -gt 1 ]; then filt="$filt${row}xstack=inputs=$cols:layout=$(i=0; s=""; while [ $i -lt $cols ]; do [ $i -gt 0 ] && s="$s|"; x=""; j=0; while [ $j -lt $i ]; do x="${x}w$j+"; j=$((j+1)); done; [ -z "$x" ] && x="0" || x="${x%+}"; s="${s}${x}_0"; i=$((i+1)); done; echo $s):fill=0x888888[r$r];"; else filt="$filt${row}null[r$r];"; fi
  lay="$lay[r$r]"
done
if [ $rows -gt 1 ]; then filt="$filt${lay}vstack=inputs=$rows"; else filt="${filt%;}"; filt="$filt;[r0]null"; fi
ffmpeg -loglevel error -y $args -filter_complex "$filt" -frames:v 1 "$out" && echo "$out ($n capturas)"
