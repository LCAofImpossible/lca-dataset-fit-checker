# LCA Dataset Fit Checker

Browser-only screening tool for assessing how well an LCA dataset represents a real process and for challenging the selected dataset against alternatives in the loaded catalogue.

## Current version

**v0.1.0**

The first version provides:

- local reading of Ecoinvent Excel/CSV exports;
- automatic detection of common activity, reference-product, geography, unit, technology/comment and temporal columns;
- dataset search and manual selection;
- reproducible 0–100 fit scoring;
- process-archetype-specific weighting;
- separate assessment confidence score;
- complete-catalogue ranking to identify stronger alternatives;
- selection-robustness indicator;
- pre-filled expert-review email through the user's local email client;
- responsive layout for desktop and mobile;
- static deployment through GitHub Pages.

## Scoring model

The tool currently evaluates seven dimensions:

1. Functional / semantic alignment
2. Reference-product alignment
3. Geography
4. Technology / process alignment
5. Temporal representativeness
6. Reference unit
7. Dataset role

Weights change according to the selected process archetype (manufacturing, material production, energy, transport, waste treatment, chemical, agriculture, construction or service).

The score is a **screening indicator**, not an ISO-compliance determination and not a substitute for professional LCA judgement.

## Privacy and data handling

The application is static and performs workbook parsing and scoring in the browser.

- The selected Excel file is not uploaded by the application.
- Ecoinvent data must **not** be committed to this repository.
- The expert-review email address is stored in browser local storage only.
- Expert-review requests use a `mailto:` link. The application does not send email directly.

Users remain responsible for ensuring that their use of Ecoinvent data complies with the applicable licence and internal company policies.

## Technology

- HTML
- CSS
- Vanilla JavaScript
- SheetJS Community Edition 0.20.3 for workbook parsing
- GitHub Pages for static hosting

No backend, database or executable installation is required.

## GitHub Pages

A deployment workflow is included in `.github/workflows/pages.yml`.

After GitHub Pages is enabled for the repository with **GitHub Actions** as the publishing source, each push to `main` automatically deploys the application.

For a private repository, GitHub Pages availability depends on the GitHub plan and organisation settings.

## Next development priorities

Planned improvements after testing with the actual Ecoinvent workbook:

- calibrate column detection against the exact workbook structure;
- expand the Italian/English LCA terminology dictionary;
- improve geography hierarchy and market-region logic;
- distinguish material production, transformation and market datasets more precisely;
- introduce explicit hard-fail rules for incompatible reference products or dataset roles;
- validate score thresholds on expert-reviewed examples;
- optionally persist the workbook locally in IndexedDB;
- add an auditable methodology/version panel.
