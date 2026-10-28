# Editing the ATLAS detector page

The public page is `atlas-detector/index.qmd`. Quarto owns the scientific text,
headings, equations, citations, image captions, and page structure. Small JavaScript
modules add interaction after the readable HTML has loaded.

## Where to make a change

| Change | File |
|---|---|
| Page title, overview, resources, or section order | `atlas-detector/index.qmd` |
| Detector subsystem explanations | `atlas-detector/_sections/_explorer.qmd` |
| Calorimeter text and figures | `atlas-detector/_sections/_calorimetry.qmd` |
| Particle explanations | `atlas-detector/_sections/_particles.qmd` |
| Tracking overview and figures | `atlas-detector/_sections/_tracking.qmd` |
| Momentum derivation and fallback explanation | `atlas-detector/_sections/_momentum.qmd` |
| References | `atlas-detector/references.bib` |
| Page-specific appearance | `atlas-detector/detector.css` |
| Detector focus geometry | `atlas-detector/_scripts/detector-explorer.js` |
| Particle paths and colors | `atlas-detector/_scripts/particle-explorer.js` |
| Momentum range, step, field, and detector radii | `atlas-detector/_scripts/momentum.js` |

The leading underscore in `_sections` and `_scripts` means “supporting source, not
a public page.” It is a project convention: Quarto includes the section files in
`index.qmd`, while the browser loads the script modules. The underscore does not
make a file secret and does not have special mathematical meaning.

## Normal editing workflow

1. Edit the relevant QMD file for wording, mathematics, citations, or captions.
2. Render the page from the repository root:

   ```sh
   quarto render detectors/atlas-detector/index.qmd
   ```

3. Run the two dependency-free checks:

   ```sh
   node detectors/atlas-detector/tests/momentum.test.mjs
   node detectors/atlas-detector/tests/rendered-page.test.mjs
   ```

4. Preview the site and check the detector page at desktop and mobile widths.

All essential explanations are emitted as ordinary HTML. JavaScript hides and
switches views only after enhancement, so a failed or disabled script does not
remove the scientific content. Equations are rendered as MathML rather than by a
JavaScript math runtime.

## Adding a detector component or particle

Add its explanation as another attributed QMD heading in the appropriate section,
then add the matching geometry entry to the relevant JavaScript module. The key in
`data-detector-card` or `data-particle-card` is the stable link between content and
geometry. Do not duplicate explanatory prose in JavaScript.

## Deliberate limits

- These modules remain local to the ATLAS page until another page has a proven reuse
  case.
- There is no JSON content store, OJS runtime, framework, build package, or
  `_metadata.yml` for this one-page directory.
- The tracking-details image must not be treated as cleared for publication until
  its reuse permission is confirmed or it is replaced with an original diagram.

The full migration record, validation evidence, snapshots, and rollback commands
are stored in the separate `ATLAS_Quarto_Migration_2026-10-28` handoff package.
