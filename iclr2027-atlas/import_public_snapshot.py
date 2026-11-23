#!/usr/bin/env python3
"""Build a verified post-rebuttal ICLR 2027 snapshot from public numeric data.

The official OpenReview bulk endpoint can block unauthenticated GitHub Actions
with HTTP 403. This fallback uses Aymen Mir's publicly published Nov 20, 2026
OpenReview-derived snapshot, retaining rating:confidence pairs. It preserves
the research area from the existing historical dataset when available.

A historical source must NEVER overwrite a newer complete OpenReview snapshot.
"""
from __future__ import annotations

import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent
DEST = ROOT / "snapshot.json"
SOURCE_REPO = "https://github.com/miraymen/iclr27_analysis"
SOURCE_URL = "https://raw.githubusercontent.com/miraymen/iclr27_analysis/main/static/data.json"
POST_REBUTTAL_FLOOR = datetime(2026, 11, 20, tzinfo=timezone.utc)
MIN_PUBLIC_SUBMISSIONS = 40_000
STATUS = {0: "Active", 1: "Withdrawn", 2: "Desk rejected"}
VALID_SCORES = set("1234")
ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]+$")


def parse_timestamp(raw: str) -> datetime:
    if not isinstance(raw, str):
        raise ValueError("Missing source collection timestamp")
    try:
        parsed = datetime.strptime(raw, "%Y-%m-%d %H:%M GMT")
        return parsed.replace(tzinfo=timezone.utc)
    except ValueError as exc:
        raise ValueError(f"Unrecognised source timestamp: {raw!r}") from exc


def read_existing() -> dict | None:
    if not DEST.exists():
        return None
    try:
        data = json.loads(DEST.read_text(encoding="utf-8"))
        if data.get("complete") and isinstance(data.get("papers"), list):
            return data
    except (OSError, json.JSONDecodeError):
        pass
    return None


def timestamp_of(data: dict | None) -> datetime | None:
    if not data:
        return None
    raw = data.get("generated_utc")
    if not isinstance(raw, str):
        return None
    try:
        result = datetime.fromisoformat(raw.replace("Z", "+00:00"))
        return result.astimezone(timezone.utc) if result.tzinfo else None
    except ValueError:
        return None


def convert(raw: dict, older: dict | None = None) -> dict:
    source_time = parse_timestamp(raw.get("downloaded"))
    if source_time < POST_REBUTTAL_FLOOR:
        raise ValueError("Refusing pre-rebuttal data: source is older than Nov 20, 2026")
    source_rows = raw.get("papers")
    if not isinstance(source_rows, list) or len(source_rows) < MIN_PUBLIC_SUBMISSIONS:
        raise ValueError("Public source is incomplete or missing the submission list")

    # Reuse initial areas as metadata only; never reuse the old scores or statuses.
    old_areas = {p["id"]: p.get("area", "Unspecified")
                 for p in (older or {}).get("papers", [])
                 if isinstance(p, dict) and isinstance(p.get("id"), str)}
    seen, papers, total_reviews = set(), [], 0
    for row in source_rows:
        if not isinstance(row, list) or len(row) != 5:
            raise ValueError("Malformed public source paper row")
        paper_id, title, raw_ratings, raw_confidences, raw_status = row
        if (not isinstance(paper_id, str) or not ID_PATTERN.fullmatch(paper_id)
                or paper_id in seen or not isinstance(title, str)
                or not isinstance(raw_ratings, str)
                or not isinstance(raw_confidences, str)
                or len(raw_ratings) != len(raw_confidences)
                or set(raw_ratings) - VALID_SCORES
                or set(raw_confidences) - VALID_SCORES
                or type(raw_status) is not int or raw_status not in STATUS):
            raise ValueError(f"Invalid paper or review record: {paper_id!r}")
        seen.add(paper_id)
        reviews = [
            {"id": f"{paper_id}_post_rebuttal_{i}",
             "rating": int(r), "confidence": int(c), "reviewer": "Anonymous"}
            for i, (r, c) in enumerate(zip(raw_ratings, raw_confidences))
        ]
        papers.append({
            "id": paper_id,
            "number": None,
            "title": title,
            "area": old_areas.get(paper_id, "Unspecified"),
            "status": STATUS[raw_status],
            "url": "https://openreview.net/forum?id=" + paper_id,
            "reviews": reviews,
        })
        total_reviews += len(reviews)
    if len(papers) != len(source_rows):
        raise ValueError("Some public source submissions were omitted")
    return {
        "complete": True,
        "generated_utc": source_time.isoformat(timespec="seconds").replace("+00:00", "Z"),
        "total_submissions": len(papers),
        "total_reviews": total_reviews,
        "venue": "ICLR.cc/2027/Conference",
        "source": "Independent public OpenReview-derived post-rebuttal snapshot (Nov 20, 2026)",
        "source_url": SOURCE_REPO,
        "papers": papers,
    }


def main() -> None:
    existing = read_existing()
    print("Checking complete post-rebuttal public review snapshot:", SOURCE_REPO, flush=True)
    response = requests.get(
        SOURCE_URL, timeout=(20, 180),
        headers={"User-Agent": "ICLR2027ReviewAtlas/3.0 (academic statistics)"},
    )
    response.raise_for_status()
    incoming = convert(response.json(), existing)
    prior_time = timestamp_of(existing)
    new_time = timestamp_of(incoming)
    if prior_time and new_time and prior_time >= new_time:
        print("Existing complete dataset is at least as recent; keeping it.", flush=True)
        return

    output_tmp = DEST.with_suffix(".post_rebuttal.tmp")
    try:
        with output_tmp.open("w", encoding="utf-8") as fp:
            json.dump(incoming, fp, separators=(",", ":"), ensure_ascii=False,
                      allow_nan=False)
            fp.write("\n")
        if output_tmp.stat().st_size > 90_000_000:
            raise ValueError("Generated public snapshot is unreasonably large")
        os.replace(output_tmp, DEST)
    finally:
        output_tmp.unlink(missing_ok=True)
    active = sum(p["status"] == "Active" for p in incoming["papers"])
    active_reviews = sum(len(p["reviews"]) for p in incoming["papers"]
                         if p["status"] == "Active")
    print(f"Imported {len(incoming['papers']):,} submissions, "
          f"{active:,} active papers, {active_reviews:,} active review scores",
          flush=True)
    print("Source timestamp:", incoming["generated_utc"], flush=True)


if __name__ == "__main__":
    main()
