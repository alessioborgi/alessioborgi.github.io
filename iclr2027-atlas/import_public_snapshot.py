#!/usr/bin/env python3
"""Fallback for OpenReview's 403 challenge: import a separately published public 2027 score snapshot.

The source contains only OpenReview paper metadata and per-review numeric rating/confidence.
The exported timestamp is the ORIGINAL source timestamp, not today's date.
"""
from __future__ import annotations

import json
import os
from pathlib import Path

import requests

HERE = Path(__file__).parent
OUT = HERE / 'snapshot.json'
SOURCE = ('https://raw.githubusercontent.com/songjhPKU/'
          'ICLR2027-statistics/main/src/snapshot.json')
SOURCE_REPO = 'https://github.com/songjhPKU/ICLR2027-statistics'


def convert(data: dict) -> dict:
    meta = data.get('meta') or {}
    rows = data.get('rows')
    if not isinstance(rows, list) or len(rows) < 10000:
        raise ValueError('External source is missing the complete submission rows')
    papers = []
    seen = set()
    n_reviews = 0
    statuses = {'active': 'Active', 'withdrawn': 'Withdrawn', 'desk': 'Desk rejected', 'other': 'Rejected'}
    for row in rows:
        if not isinstance(row, list) or len(row) != 5:
            raise ValueError('Unexpected third-party paper schema')
        paper_id, title, area, state, raw_reviews = row
        if not isinstance(paper_id, str) or not paper_id or paper_id in seen:
            raise ValueError('Invalid or repeated OpenReview paper identifier')
        seen.add(paper_id)
        if state not in statuses or not isinstance(raw_reviews, list):
            raise ValueError('Invalid paper status or reviews')
        reviews = []
        for i, pair in enumerate(raw_reviews):
            if not isinstance(pair, list) or len(pair) != 2:
                raise ValueError('Invalid rating and confidence pair')
            rating, confidence = pair
            if rating is not None and (not isinstance(rating,(int,float)) or not 1<=rating<=4):
                raise ValueError('Rating outside 1–4 scale')
            if confidence is not None and (not isinstance(confidence,(int,float)) or not 1<=confidence<=4):
                raise ValueError('Confidence outside 1–4 scale')
            reviews.append({'id':f'{paper_id}_snapshot_{i}','rating':rating,'confidence':confidence,'reviewer':'Anonymous'})
        n_reviews+=len(reviews)
        papers.append({'id':paper_id,'number':None,'title':str(title),'area':str(area or 'Unspecified'),
                       'status':statuses[state], 'url':'https://openreview.net/forum?id='+paper_id, 'reviews':reviews})
    stamp = meta.get('fetched_at')
    if not isinstance(stamp,str) or len(stamp)<10:
        raise ValueError('Source does not identify its collection date')
    return {
        'complete':True,'generated_utc':stamp,'total_submissions':len(papers),
        'total_reviews':n_reviews,
        'venue':'ICLR.cc/2027/Conference',
        'source':'Third-party public OpenReview snapshot (Nov 6, 2026)',
        'source_url':SOURCE_REPO,
        'papers':papers,
    }


def main() -> None:
    print('OpenReview bulk API unavailable; using independent public Nov 6 snapshot:',SOURCE_REPO,flush=True)
    response=requests.get(SOURCE,timeout=(20,180),headers={'User-Agent':'ICLR2027ReviewAtlas/2.1'})
    response.raise_for_status()
    data=convert(response.json())
    print(f"Validated {len(data['papers']):,} papers, {data['total_reviews']:,} numeric review records",flush=True)
    tmp=OUT.with_suffix('.import.tmp')
    try:
        with tmp.open('w',encoding='utf8') as f:
            json.dump(data,f,ensure_ascii=False,separators=(',',':'),allow_nan=False)
            f.write('\n')
        if tmp.stat().st_size > 90_000_000:
            raise RuntimeError('Snapshot exceeds 90 MB')
        os.replace(tmp,OUT)
    finally:
        tmp.unlink(missing_ok=True)
    print('Imported source timestamp:',data['generated_utc'])

if __name__=='__main__':
    main()