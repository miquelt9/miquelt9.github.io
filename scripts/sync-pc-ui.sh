#!/bin/sh
set -e

root="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
src="${PC_UI_CSS:-$root/../pc-ui/src/pc-ui.css}"
dest="$root/css/pc-ui.css"

if [ ! -f "$src" ]; then
  echo "pc-ui stylesheet not found at $src" >&2
  echo "Clone github.com/miquelt9/pc-ui as a sibling of this repo, or set PC_UI_CSS." >&2
  exit 1
fi

cp "$src" "$dest"
echo "copied $src -> $dest"
