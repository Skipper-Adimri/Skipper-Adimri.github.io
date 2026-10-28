# ATLAS image originals

These are the archival source images. The public detector page uses smaller WebP
derivatives from the parent directory so visitors do not download the full-resolution
files.

From the repository root, rebuild the derivatives with:

```sh
detectors/images/atlas/optimize-images.sh
```

Do not edit the generated WebP files by hand. Replace an original here and rerun the
script instead. The Quarto page lists only the public derivatives as resources, so
this `_source` directory is retained in Git but excluded from the rendered website.

## Source provenance

- `zdc-location-run3.jpg` is `ATLAS_reference_version3.jpg`, Figure 1 of
  [*Upgrades of the ATLAS Zero Degree Calorimeter System for Run 3 at the Large
  Hadron Collider*](https://arxiv.org/abs/2509.05948).
- `zdc-module-schematic-run3.jpg` is `ZDC_schematic_compressed.jpg`, Figure 6 of
  the same paper.

Both originals were obtained from the paper's arXiv v2 source archive. The public
page credits and links the source beside each derivative image.
