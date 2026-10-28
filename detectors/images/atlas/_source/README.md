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
