# Editing and adding projects

Scientific content belongs in Quarto Markdown. Write descriptions, equations,
captions, tables, citations, and conclusions in each project's `index.qmd`.
Keep short pages in one file. Split into `_sections/` includes only when the
page becomes difficult to edit, as on the longer ATLAS detector page.

## Where things belong

```text
projects/
  projects.yml            # Authoritative instrumentation listing entries
  _project.ejs.md          # Shared card layout; normally leave this alone
  project-name/
    index.qmd             # Page content and page configuration
    images/               # Figures and thumbnail; related formats stay together
    files/                # Reports and downloadable documents
    project-name.css      # Optional page-specific appearance
    _scripts/             # Optional small interaction scripts
```

The existing ATLAS page remains under `detectors/atlas-detector/`, with images
under `detectors/images/atlas/`. Its listing points there. No move is necessary
to include it among instrumentation projects. Publication-summary pages also
remain in their existing `projects/` folders; publication cards are managed
separately in `publications/publications.yml`.

## Add or edit a listing card

Edit `projects/projects.yml` directly. This is the single source for project
titles, ordering, two short description lines, destination buttons, and thumbnails.
There are no per-project listing copies or installation scripts to synchronize.
Add a new entry following the existing ones:

```yaml
- title: "Descriptive project title"
  order: 40
  description-line-1: "What I built or investigated."
  description-line-2: "What I measured or learned."
  project-url: "projects/project-name/index.qmd"
  button-text: "Explore Project"
  image: "projects/project-name/images/thumbnail.webp"
  image-alt: "A useful description of what the thumbnail shows."
```

Paths in this listing are relative to `publications.qmd` at the website root.
The `listing` configuration in that page explicitly loads `projects/projects.yml`
and applies `_project.ejs.md` at the `#instrumentation-projects` placeholder.
The ID alone does not discover a YAML file.

Optional `image-credit` and `image-source-url` fields display source attribution
on hover or keyboard focus. Keep source and illustration-versus-measurement
information in figure captions or project documentation as appropriate.

## Images and filenames

Use stable, descriptive names: `thumbnail.webp`, `transverse-modes.webp`, and
`laser-output-characteristics.svg`. Overwrite the intended asset when improving
it; do not accumulate `v3`, `v4`, or preview copies in the website folder.
Git records earlier versions after they are committed. Hard refresh a local
preview if the browser displays a cached image.

Keep corresponding PDF, PNG, and SVG exports together if useful. Original photos
and source artwork can live in `images/_source/`; these are editing sources,
not automatically page content. An underscore does not make a file private.
QMD image paths are relative to that QMD file, for example:

```markdown
![A clear scientific caption.](images/figure.svg){#fig-example fig-alt="Description of the visual content."}
```

## Optional interactions

Keep essential content readable in QMD. JavaScript should enhance an ordinary
link or figure. The Nd:YAG enlargement control uses:

- `nd-yag-laser/ndyag-page.css`, declared in the page's `format.html.css`.
- `nd-yag-laser/_scripts/figure-viewer.js`, loaded as a module after the body.
- A `resources` entry in the page YAML to copy that script into the rendered site.

The image link still opens the image without JavaScript. The enhanced dialog
has a close button, Escape support, and restores focus to its opening link.
Keep controllers local until another page has a real reuse requirement.
No framework, JSON scientific-content store, or `_metadata.yml` is needed here.

## Preview and verify

From the website repository root:

```sh
quarto render publications.qmd
quarto render projects/nd-yag-laser/index.qmd
quarto render projects/scintillator-detector/index.qmd
quarto preview
```

Check the project cards, reports, images, equations, and figure-viewer controls
at desktop and narrow widths. A listing or asset rename requires updating its
references before rendering. Generated HTML belongs in `_site/`, not alongside
source pages. Review `git status` before making a local commit; remote pushes
remain Aman's responsibility.

## Wide apparatus thumbnails

For a large apparatus thumbnail beside the description and button, add
`image-layout: wide` to that entry in `projects/projects.yml`. The shared EJS
template emits `project-item--wide-image`; the shared listing CSS gives the image
35% of the body row on screens wider than 650px and crops from the right as
needed. The title stays full width. On narrow screens, the complete image stacks
below the text. Omit the field for standard thumbnails. Do not select cards by
image filename, title text, or generated Quarto listing IDs.

## Shared listing appearance

Root `listing.css` owns the common section headings, entry spacing/dividers,
metadata rows, button spacing, and responsive text/image grid for Projects &
Publications and Talks & Posters. These pages use the `catalogue-page`
body class and `catalogue-*` layout classes. Project-only image variants and
credits stay in `publications/publication-thumbnails.css`. Talk content stays in
`presentations/presentations.yml` and award wording stays in `awards.qmd`.
The former `presentations/presentation-logos.css` is no longer loaded; do not
add another competing copy of the common styles there.

### Award features and banner logos

Awards use the original `.award-feature` layout in `styles.css`: text and photo
share the top row, while the closing paragraph and buttons span the full width
below. This preserves the approved feature spacing and green heading divider.
Wide conference logos can set `logo-layout: banner` in
`presentations/presentations.yml`; the template emits `catalogue-item--banner`,
with an 18rem desktop image column and natural image height. Banners stack at
full available width on mobile. Ordinary thumbnails retain the common limits.
Avoid filename selectors or transform-based logo enlargement.

## Button icons

Global `icons.css` defines action icons using local SVGs in `images/icons/`.
Keep an icon before its visible label, using the same action class on every page:

```markdown
[View CV](../../cv.qmd){.btn .btn-outline-primary .icon-link .icon-cv}
[Related Project](../index.qmd){.btn .btn-outline-primary .icon-link .icon-project}
```

Use `icon-journal`, `icon-preprint`, `icon-talk`, `icon-slides`, `icon-poster`,
`icon-conference`, `icon-report`, and `icon-video` for their corresponding actions.
The shared listing templates already select the appropriate icons for their buttons.
Project entries can set `button-icon: "detector"` or `button-icon: "thesis"`
in their listing YAML; the default is `project`.
No JavaScript icon library is required. The Lucide license stays beside its SVGs.
