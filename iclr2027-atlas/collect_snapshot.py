#!/usr/bin/env python3
"""Collect a complete public ICLR 2027 review snapshot for the GitHub Pages viewer.

Run by GitHub Actions. A partially downloaded response never replaces snapshot.json.
Only Official_Review notes with public readers are included.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

VENUE = "ICLR.cc/2027/Conference"
API = "https://api2.openreview.net"
HERE = Path(__file__).parent
SNAPSHOT = HERE / "snapshot.json"


def field(note: dict, name: str, default=None):
    value = note.get("content", {}).get(name, default)
    while isinstance(value, dict):
        value = value.get("value", default)
    return default if value is None else value


def score(raw) -> float | None:
    while isinstance(raw, dict):
        raw = raw.get("value")
    if isinstance(raw, bool) or raw is None:
        return None
    if isinstance(raw, (float, int)):
        return float(raw)
    match = re.match(r"^\s*([+-]?(?:\d+\.?\d*|\.\d+))(?=\s|:|$)", str(raw))
    return float(match.group(1)) if match else None


def session() -> requests.Session:
    s = requests.Session()
    retry = Retry(
        total=6,
        connect=5,
        read=4,
        status=6,
        backoff_factor=1.4,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=frozenset(["GET"]),
        respect_retry_after_header=True,
    )
    s.mount("https://", HTTPAdapter(max_retries=retry, pool_connections=2, pool_maxsize=2))
    s.headers.update({"Accept": "application/json", "User-Agent": "ICLR2027ReviewAtlas/2.0 (public academic statistics)"})
    return s


def fetch(s: requests.Session, resource: str, params: dict) -> dict:
    r = s.get(API + resource, params=params, timeout=(20, 120))
    r.raise_for_status()
    payload = r.json()
    if not isinstance(payload, dict):
        raise RuntimeError("Unexpected OpenReview response type")
    return payload


def setting(group: dict, name: str, default: str) -> str:
    result = field(group, name, default)
    return str(result or default)


def classify(note: dict, cfg: dict) -> str:
    venueid = str(field(note, "venueid", "") or "").lower()
    venue = str(field(note, "venue", "") or "").lower()
    if venueid == cfg["withdrawn"].lower() or "withdraw" in venueid or "withdraw" in venue:
        return "Withdrawn"
    if venueid == cfg["desk"].lower() or "desk_reject" in venueid or "desk reject" in venue or "desk-reject" in venue:
        return "Desk rejected"
    if "reject" in venueid or "reject" in venue:
        return "Rejected"
    return "Active"


def parse(note: dict, cfg: dict) -> dict:
    paper_id = note.get("id")
    if not paper_id:
        raise RuntimeError("A submission is missing an ID")
    details = note.get("details") or {}
    replies = details.get("directReplies")
    if replies is None:
        replies = details.get("replies")
    if isinstance(replies, dict):
        replies = replies.get("notes")
    if replies is None and not note.get("replyCount"):
        replies = []
    if not isinstance(replies, list):
        raise RuntimeError(f"Submission {paper_id} is missing directReplies; unsafe to publish")
    reviews = []
    for reply in replies:
        invitations = reply.get("invitations") or ([reply["invitation"]] if reply.get("invitation") else [])
        if not any(str(inv).endswith("/-/" + cfg["review"]) for inv in invitations):
            continue
        readers = reply.get("readers") or []
        if readers and "everyone" not in readers:
            continue
        if not reply.get("id"):
            continue
        reviews.append({
            "id": str(reply["id"]),
            "rating": score(field(reply, "rating")),
            "confidence": score(field(reply, "confidence")),
            "reviewer": str((reply.get("signatures") or ["Anonymous"])[0]).split("/")[-1],
        })
    number = note.get("number")
    return {
        "id": str(paper_id),
        "number": int(number) if str(number or "").isdigit() else None,
        "title": str(field(note, "title", "Untitled")),
        "area": str(field(note, "primary_area", "Unspecified") or "Unspecified"),
        "status": classify(note, cfg),
        "url": f"https://openreview.net/forum?id={paper_id}",
        "reviews": reviews,
    }


def collect(page_size: int, delay: float) -> dict:
    s = session()
    info = fetch(s, "/groups", {"id": VENUE})
    groups = info.get("groups")
    if not groups:
        raise RuntimeError("ICLR 2027 group is not publicly available")
    g = groups[0]
    cfg = {
        "submission": setting(g, "submission_name", "Submission"),
        "review": setting(g, "review_name", "Official_Review"),
        "withdrawn": setting(g, "withdrawn_venue_id", VENUE + "/Withdrawn_Submission"),
        "desk": setting(g, "desk_rejected_venue_id", VENUE + "/Desk_Rejected_Submission"),
    }
    invitation = f"{VENUE}/-/{cfg['submission']}"
    expected = None
    after = None
    seen = set()
    papers = []
    review_count = 0
    pages = 0
    while True:
        query = {"invitation": invitation, "details": "directReplies", "limit": page_size, "stream": "true"}
        if after:
            query["after"] = after
        else:
            query["count"] = "true"
        result = fetch(s, "/notes", query)
        notes = result.get("notes")
        if not isinstance(notes, list):
            raise RuntimeError("OpenReview response did not include notes")
        if expected is None and result.get("count") is not None:
            expected = int(result["count"])
        if not notes:
            break
        for note in notes:
            paper = parse(note, cfg)
            if paper["id"] in seen:
                raise RuntimeError("Repeated paper during pagination")
            seen.add(paper["id"])
            papers.append(paper)
            review_count += len(paper["reviews"])
        new_after = notes[-1].get("id")
        if not new_after or new_after == after:
            raise RuntimeError("The pagination cursor did not advance")
        after = new_after
        pages += 1
        print(f"Page {pages}: {len(papers):,} papers, {review_count:,} reviews" + (f" / {expected:,} expected" if expected else ""), flush=True)
        if len(notes) < page_size:
            break
        if pages > 5000:
            raise RuntimeError("Page safety limit exceeded")
        time.sleep(delay)
    if not papers:
        raise RuntimeError("Received no submissions; refusing to publish")
    if expected is not None and len(papers) < expected:
        raise RuntimeError(f"Incomplete download: {len(papers)} / {expected} submissions")
    return {
        "complete": True,
        "generated_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "venue": VENUE,
        "total_submissions": len(papers),
        "total_reviews": review_count,
        "source": "OpenReview public API v2, official review replies",
        "papers": papers,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=150)
    parser.add_argument("--delay", type=float, default=0.2)
    args = parser.parse_args()
    if not 1 <= args.limit <= 1000:
        parser.error("--limit must be from 1 to 1000")
    data = collect(args.limit, args.delay)
    temp = SNAPSHOT.with_name("snapshot.tmp.json")
    try:
        with temp.open("w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
            f.write("\n")
        if temp.stat().st_size > 90_000_000:
            raise RuntimeError("Snapshot exceeds 90 MB GitHub Pages safety limit")
        os.replace(temp, SNAPSHOT)
    finally:
        temp.unlink(missing_ok=True)
    print(f"Published complete snapshot: {data['total_submissions']:,} papers / {data['total_reviews']:,} public reviews ({SNAPSHOT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Snapshot refresh failed (old snapshot preserved): {exc}", file=sys.stderr)
        sys.exit(1)