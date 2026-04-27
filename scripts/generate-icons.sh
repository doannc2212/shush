#!/usr/bin/env bash
# Generates extension icons from a source PNG using ffmpeg.

set -e

read -rp "Source PNG path [app.png]: " SRC
SRC="${SRC:-app.png}"
OUT_DIR="public/icons"
SIZES=(16 32 48 128)

if [ ! -f "$SRC" ]; then
  echo "Source file not found: $SRC"
  exit 1
fi

mkdir -p "$OUT_DIR"

for SIZE in "${SIZES[@]}"; do
  OUT="$OUT_DIR/icon${SIZE}.png"
  ffmpeg -i "$SRC" -vf "scale=${SIZE}:${SIZE}" -frames:v 1 -update 1 "$OUT" -y 2>/dev/null
  echo "  icon${SIZE}.png"
done

echo ""
echo "Icons written to $OUT_DIR/"
