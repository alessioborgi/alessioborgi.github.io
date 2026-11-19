# ICLR 2027 Review Atlas (GitHub Pages)

A **standalone browser-based dashboard** for all public ICLR 2027 official review ratings and confidence scores. Available at [alessioborgi.github.io/iclr2027-atlas/](https://alessioborgi.github.io/iclr2027-atlas/).

## How it works

- The UI (`index.html`, `atlas.css`, `atlas.js`) runs as a static site on GitHub Pages, without Streamlit or a Python server.
- On opening, it first loads the complete local IndexedDB cache (when available), then the latest `snapshot.json` published by the scheduled GitHub Action.
- The `Refresh from OpenReview` button also offers a direct browser download using the **public OpenReview API v2**. This fallback requires CORS access from OpenReview. If the browser is denied, the existing snapshot is preserved.
- `collect_snapshot.py`, run by `.github/workflows/update_iclr2027_atlas.yml`, refreshes the public snapshot every 12 hours and on deployment, **only replacing the previous complete dataset** when all pages succeed. GitHub Actions and public data availability can affect this schedule.
- CSV import is available if OpenReview blocks the collection process; imported CSV rankings only cover the imported cohort, not the whole conference.

## Features

- Mean and confidence-weighted ratings, rankings with tied ranks, research-area filters, minimum review count and optional inactive submissions.
- Histograms for paper-level averages and reviewer disagreement, distributions of individual ratings and reviewer confidence.
- Enter any average between 1 and 4 to see the number of papers above, below and tied with the target; estimated rank and midrank percentile.
- Searchable, paginated paper ranking table, OpenReview links, and downloadable CSVs for scored papers and reviewers.

## Data policy

- **Only publicly accessible `Official_Review` replies** are analyzed; author responses, meta-reviews and reviewer-quality ratings are excluded.
- Withdrawn, desk-rejected and rejected submissions are excluded by default.
- Missing ratings do not affect arithmetic means; weighted averages use positive confidence values only.
- Reviews can change throughout the discussion period; the dataset timestamp is displayed, and no acceptance decisions are implied.
- This is an independent, **unofficial** statistical tool. No sample data is presented as real conference data.

## Local development

Open `index.html` through an HTTP server (e.g. `python -m http.server` from the website repository root). Do not load from `file://` if you want to fetch `snapshot.json`.

To build a complete snapshot manually:

```bash
pip install requests
python iclr2027-atlas/collect_snapshot.py
```

If OpenReview responds with a network error, no incomplete snapshot will be published.