#!/bin/sh
set -eu

# Rebuild the web-serving derivatives without modifying the archival originals.
# Requires cwebp, gif2webp, and ImageMagick's `magick` command.

asset_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
source_dir="$asset_dir/_source"
poster_png=$(mktemp "${TMPDIR:-/tmp}/atlas-poster.XXXXXX.png")
trap 'rm -f "$poster_png"' EXIT

cwebp -quiet -mt -m 6 -q 84 -resize 1600 0 "$source_dir/cutaway.png" -o "$asset_dir/cutaway-1600.webp"
cwebp -quiet -mt -m 6 -q 86 -resize 3200 0 "$source_dir/cutaway.png" -o "$asset_dir/cutaway-3200.webp"
cwebp -quiet -mt -m 6 -q 88 -resize 1600 0 "$source_dir/cutaway_labelled_ATLAS.png" -o "$asset_dir/cutaway-labelled-1600.webp"
cwebp -quiet -mt -m 6 -q 90 -resize 3200 0 "$source_dir/cutaway_labelled_ATLAS.png" -o "$asset_dir/cutaway-labelled-3200.webp"
cwebp -quiet -mt -m 6 -q 88 "$source_dir/calorimeter-run3-labelled.png" -o "$asset_dir/calorimeter-run3-labelled.webp"
cwebp -quiet -mt -m 6 -q 88 "$source_dir/tracking-detector-details.png" -o "$asset_dir/tracking-detector-details.webp"
cwebp -quiet -mt -m 6 -q 86 "$source_dir/slice-clean.png" -o "$asset_dir/slice-clean.webp"

gif2webp -quiet -lossy -q 70 -m 4 "$source_dir/Atlas_Simulation.gif" -o "$asset_dir/Atlas_Simulation.webp"
magick "$source_dir/Atlas_Simulation.gif[0-60]" -coalesce -delete 0-59 -strip "$poster_png"
cwebp -quiet -mt -m 6 -q 84 "$poster_png" -o "$asset_dir/atlas-simulation-poster-v2.webp"

echo "ATLAS web images rebuilt."
