# LCA Dataset Fit Checker

Browser-only screening tool for assessing how well an LCA dataset represents a real process and for challenging the selected dataset against alternatives in the loaded catalogue.

## Current version

**v0.3.1**

The first version provides:

- local reading of Ecoinvent Excel/CSV exports;
- calibration for the supplied Ecoinvent 3.11 catalogue structure (Activity Name, Geography, Special Activity Type, Sector, ISIC, CPC, HS2017, Unit and Product Information);
- dataset search and manual selection;
- reproducible 0–100 fit scoring;
- process-archetype-specific weighting;
- separate assessment confidence score;
- complete-catalogue ranking to identify stronger alternatives;
- hard-fail compatibility rules that can override the qualitative verdict without hiding the numerical score;
- evidence panel showing the Ecoinvent fields and matched concepts behind each criterion;
- side-by-side comparison of the selected dataset and the strongest valid alternatives;
- missing-information analysis that suggests which input details would improve assessment reliability;
- selection-robustness indicator;
- pre-filled expert-review email through the user's local email client;
- responsive layout for desktop and mobile;
- static deployment through GitHub Pages.

## Scoring model

The tool currently evaluates six dimensions:

1. Process / technology alignment
2. Product / material alignment, using Product Information plus CPC/HS metadata
3. Sector / classification consistency, using Sector and ISIC metadata
4. Geography
5. Reference unit
6. Dataset role / intended modelling purpose

Temporal representativeness is deliberately not scored for this catalogue export because the supplied workbook does not contain temporal metadata.

## Critical compatibility layer

The fit score is not allowed to hide categorical incompatibilities. Version 0.3 introduces a separate compatibility layer.

Examples of blocking conditions include:

- a market or market-group dataset explicitly selected for a physical transforming process;
- a transforming activity explicitly selected when a market/supply mix is required;
- a production-mix request paired with another activity role;
- waste, transport or energy purpose paired with a clearly different activity family;
- an explicit reference-unit incompatibility;
- simultaneously very low process and product/material similarity.

A hard fail does not erase or artificially reduce the numerical score. Instead, the score remains visible for transparency while the qualitative verdict is changed to **Critical mismatch**.

## Progressive disclosure

The main result view remains intentionally compact. Additional analysis is available through three expandable sections:

1. **Why this score?** - evidence and matched concepts for each criterion;
2. **Compare alternatives** - selected dataset versus the strongest valid catalogue candidates;
3. **Input quality** - missing information and suggested details that would improve confidence.

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

- expand the Italian/English LCA terminology dictionary;
- improve geography hierarchy and market-region logic;
- continue refining the distinction between ordinary transforming activities, market activities, market groups and production mixes;
- validate score thresholds and hard-fail rules on expert-reviewed examples;
- add dataset-family grouping;
- separate intrinsic fit from best-available fit;
- add expert decision/override and a versioned feedback knowledge base;
- optionally persist the workbook locally in IndexedDB;
- add an auditable methodology/version panel.
