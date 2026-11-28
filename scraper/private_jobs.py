"""Private-company jobs from public job-board feeds (Greenhouse, Lever, SmartRecruiters).
Modes:
  python private_jobs.py             preview only: reads the feeds, writes private_jobs_preview.json
  python private_jobs.py save-dry    reads your database too and prints what WOULD be added / closed (writes nothing)
  python private_jobs.py save        really adds new jobs and closes jobs that left the company's feed
"""
import html
import json
import re
import sys
import time
from datetime import datetime, timezone

import requests
from bs4 import BeautifulSoup

HEADERS = {'User-Agent': 'DwarSing job portal (dwarsing.in)'}

# Companies whose feeds worked in the probe. (provider, slug, display name)
COMPANIES = [
    ('lever', 'paytm', 'Paytm'),
    ('smartrecruiters', 'swiggy', 'Swiggy'),
    ('greenhouse', 'pubmatic', 'PubMatic'),
    ('lever', 'mindtickle', 'MindTickle'),
    ('lever', 'zeta', 'Zeta'),
    ('greenhouse', 'zscaler', 'Zscaler'),
    ('greenhouse', 'druva', 'Druva'),
    ('greenhouse', 'rubrik', 'Rubrik'),
    ('lever', 'cred', 'CRED'),
    ('lever', 'meesho', 'Meesho'),
]

PLACES = ('pune', 'mumbai', 'navi mumbai', 'thane', 'nagpur', 'nashik', 'aurangabad', 'maharashtra')
MAX_PER_COMPANY = 40


def in_maharashtra(location):
    loc = (location or '').lower()
    return any(p in loc for p in PLACES)


def tidy(text):
    """Unescape entities, turn non-breaking spaces into normal ones, tidy blank lines."""
    text = html.unescape(text or '').replace('\xa0', ' ')
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r' ?\n ?', '\n', text)
    return re.sub(r'\n{3,}', '\n\n', text).strip()


def clean_location(location):
    """Keep only the Maharashtra places of a long multi-city list ('Noida / Pune, MH / Delhi' -> 'Pune, MH')."""
    parts = [p.strip() for p in re.split(r'\s*/\s*|;\s*', location or '') if p.strip()]
    keep = [p for p in parts if in_maharashtra(p)]
    return ' / '.join(keep) or (location or '').strip()


def html_to_text(html_text):
    """Feed HTML -> the simple text format the site's RichText understands (## headings, - bullets)."""
    if not html_text:
        return ''
    soup = BeautifulSoup(html_text, 'html.parser')
    for h in soup.find_all(re.compile(r'^h[1-6]$')):
        h.replace_with(f'\n\n## {h.get_text(" ", strip=True)}\n')
    for li in soup.find_all('li'):
        li.replace_with(f'\n- {li.get_text(" ", strip=True)}')
    for br in soup.find_all('br'):
        br.replace_with('\n')
    for p in soup.find_all(['p', 'div', 'ul', 'ol']):
        p.append('\n')
    return tidy(soup.get_text())


def posted_iso(ms_or_iso):
    try:
        if isinstance(ms_or_iso, (int, float)):
            return datetime.fromtimestamp(ms_or_iso / 1000, timezone.utc).date().isoformat()
        return str(ms_or_iso)[:10] or None
    except Exception:
        return None


# ---- one normaliser per provider: returns dicts with the same keys ------------------------------
def from_greenhouse(slug, company):
    r = requests.get(f'https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?content=true', headers=HEADERS, timeout=30)
    r.raise_for_status()
    out = []
    for j in r.json().get('jobs', []):
        loc = (j.get('location') or {}).get('name', '')
        if not in_maharashtra(loc):
            continue
        # Greenhouse sends its HTML escaped once, so unescape first
        raw = BeautifulSoup(j.get('content') or '', 'html.parser').get_text()
        out.append({
            'title': j.get('title', '').strip(), 'company': company, 'location': loc,
            'apply_link': j.get('absolute_url'), 'description': html_to_text(raw),
            'department': ', '.join(d.get('name', '') for d in j.get('departments', []) if d.get('name')),
            'posted': posted_iso(j.get('first_published') or j.get('updated_at')),
            'external_id': f'greenhouse:{slug}:{j.get("id")}',
        })
    return out


def from_lever(slug, company):
    r = requests.get(f'https://api.lever.co/v0/postings/{slug}?mode=json', headers=HEADERS, timeout=30)
    r.raise_for_status()
    out = []
    for j in r.json():
        cats = j.get('categories') or {}
        locs = cats.get('allLocations') or [cats.get('location') or '']
        loc = ' / '.join(l for l in locs if l)
        if not in_maharashtra(loc):
            continue
        parts = [j.get('descriptionPlain') or '']
        for lst in j.get('lists', []):
            parts.append(f"## {lst.get('text', '')}\n{html_to_text(lst.get('content'))}")
        parts.append(j.get('additionalPlain') or '')
        out.append({
            'title': j.get('text', '').strip(), 'company': company, 'location': loc,
            'apply_link': j.get('hostedUrl') or j.get('applyUrl'),
            'description': tidy('\n\n'.join(p.strip() for p in parts if p and p.strip())),
            'department': cats.get('team') or cats.get('department') or '',
            'posted': posted_iso(j.get('createdAt')),
            'external_id': f'lever:{slug}:{j.get("id")}',
        })
    return out


def from_smartrecruiters(slug, company):
    out, offset = [], 0
    while True:
        r = requests.get(f'https://api.smartrecruiters.com/v1/companies/{slug}/postings?limit=100&offset={offset}', headers=HEADERS, timeout=30)
        r.raise_for_status()
        data = r.json()
        content = data.get('content', [])
        for j in content:
            loc_d = j.get('location') or {}
            loc = ', '.join(x for x in (loc_d.get('city'), loc_d.get('region')) if x)
            if not in_maharashtra(loc) and not in_maharashtra(loc_d.get('city', '')):
                continue
            if len(out) >= MAX_PER_COMPANY:
                break
            detail = {}
            try:   # the list has no description, so read the single posting
                d = requests.get(f"https://api.smartrecruiters.com/v1/companies/{slug}/postings/{j['id']}", headers=HEADERS, timeout=30)
                detail = d.json() if d.status_code == 200 else {}
                time.sleep(0.3)
            except Exception:
                pass
            sections = (detail.get('jobAd') or {}).get('sections') or {}
            desc = '\n\n'.join(
                f"## {s.get('title', '')}\n{html_to_text(s.get('text'))}" for s in sections.values() if s.get('text'))
            out.append({
                'title': j.get('name', '').strip(), 'company': company, 'location': loc,
                'apply_link': detail.get('applyUrl') or detail.get('postingUrl'),
                'description': desc, 'department': (j.get('department') or {}).get('label', ''),
                'posted': posted_iso(j.get('releasedDate')),
                'external_id': f'smartrecruiters:{slug}:{j.get("id")}',
            })
        offset += len(content)
        if not content or offset >= data.get('totalFound', 0):
            break
    return out


PROVIDERS = {'greenhouse': from_greenhouse, 'lever': from_lever, 'smartrecruiters': from_smartrecruiters}


def fetch_all():
    """-> (jobs to show, every apply link seen per company, companies whose feed loaded fine)"""
    jobs, seen, ok = [], {}, set()
    for provider, slug, company in COMPANIES:
        try:
            found = PROVIDERS[provider](slug, company)[:MAX_PER_COMPANY]
            for j in found:
                j['location'] = clean_location(j['location'])
            seen[company] = {norm_url(j['apply_link']) for j in found if j['apply_link']}   # includes skipped ones
            skipped = [j for j in found if len(j['description']) < 200]
            found = [j for j in found if len(j['description']) >= 200]   # a job page with no real text is not worth showing
            print(f'{company:<12}{provider:<16}{len(found):>4} Maharashtra jobs' + (f'  ({len(skipped)} skipped: no description)' if skipped else ''))
            jobs.extend(found)
            ok.add(company)
        except Exception as e:
            print(f'{company:<12}{provider:<16} FAILED: {e}')
    return jobs, seen, ok


def norm_url(u):
    return (u or '').strip().rstrip('/').lower()


# ---- saving ---------------------------------------------------------------------------------------
MAX_NEW_PER_RUN = 20      # your Google Indexing API allows ~200 notifications a day; every new job uses one
CLOSE_LIMIT = 0.5         # never close more than half of a company's jobs in one run (protects against a bad feed)


def job_title(j):
    t = j['title']
    return t if j['company'].lower() in t.lower() else f"{t} - {j['company']}"


def build_row(j):
    intro = f"{j['company']} is hiring for this role in {j['location']}."
    if j.get('department'):
        intro += f" Team: {j['department']}."
    return {
        'title': job_title(j), 'company': j['company'], 'category': 'private', 'job_type': 'private',
        'location': j['location'], 'state': 'maharashtra', 'salary': 'Not disclosed',
        'description': f"{intro}\n\n{j['description']}",
        'apply_link': j['apply_link'], 'last_date': 'Open until filled',
        'is_active': True, 'is_featured': False,
    }


def load_private_rows(db):
    rows, start = [], 0
    while True:
        res = db.table('jobs').select('id, title, company, apply_link, is_active, description').eq('job_type', 'private').order('id').range(start, start + 499).execute()
        if not res.data:
            return rows
        rows.extend(res.data)
        start += len(res.data)


def plan_changes(jobs, seen, ok, rows):
    """-> (jobs to add, rows to close, warnings). Pure function so it can be tested."""
    known = {norm_url(r['apply_link']) for r in rows}
    to_add = [j for j in jobs if j['apply_link'] and norm_url(j['apply_link']) not in known]
    to_close, warnings = [], []
    for company in ok:
        # only jobs this scraper created (their text starts with our intro line); hand-made ones are never closed
        mine = [r for r in rows if r['company'] == company and r['is_active']
                and ' is hiring for this role in ' in (r.get('description') or '')[:200]]
        gone = [r for r in mine if norm_url(r['apply_link']) not in seen.get(company, set())]
        if not seen.get(company):
            if mine:
                warnings.append(f'{company}: feed returned no Maharashtra jobs, so NOTHING was closed')
            continue
        if len(gone) > 5 and len(gone) > CLOSE_LIMIT * len(mine):
            warnings.append(f'{company}: {len(gone)} of {len(mine)} jobs look gone - too many, so none were closed')
            continue
        to_close.extend(gone)
    return to_add, to_close, warnings


def save(dry_run):
    import os
    from dotenv import load_dotenv
    from supabase import create_client
    load_dotenv()
    db = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))
    jobs, seen, ok = fetch_all()
    rows = load_private_rows(db)
    to_add, to_close, warnings = plan_changes(jobs, seen, ok, rows)
    print(f'\nPrivate jobs already in database: {len(rows)}')
    print(f'New jobs found: {len(to_add)} (adding {min(len(to_add), MAX_NEW_PER_RUN)} this run, the rest on later runs)')
    print(f'Jobs that left the company feed: {len(to_close)}')
    for w in warnings:
        print('WARNING:', w)
    added = 0
    for j in to_add[:MAX_NEW_PER_RUN]:
        row = build_row(j)
        print(f"+ {'WOULD ADD' if dry_run else 'Adding'}: {row['title']} | {row['location']}")
        if not dry_run:
            try:
                db.table('jobs').insert(row).execute()
                added += 1
            except Exception as e:
                print(f'  Error inserting: {e}')
    for r in to_close:
        print(f"- {'WOULD CLOSE' if dry_run else 'Closing'}: {r['title']}")
        if not dry_run:
            db.table('jobs').update({'is_active': False}).eq('id', r['id']).execute()
    print(f"\nDone. {'Nothing was written (dry run).' if dry_run else f'Added {added}, closed {len(to_close)}.'}")


if __name__ == '__main__':
    mode = sys.argv[1] if len(sys.argv) > 1 else 'preview'
    if mode in ('save', 'save-dry'):
        save(dry_run=(mode == 'save-dry'))
        sys.exit(0)
    jobs, _, _ = fetch_all()
    missing = [j for j in jobs if not j['apply_link'] or not j['title']]
    print(f'\nTotal: {len(jobs)} jobs, {len(missing)} without a title or apply link, '
          f'{sum(1 for j in jobs if len(j["description"]) < 200)} with a very short description')
    with open('private_jobs_preview.json', 'w', encoding='utf-8') as f:
        json.dump(jobs, f, ensure_ascii=False, indent=2)
    print('Saved private_jobs_preview.json - open it and check a few jobs. Nothing was written to your database.')
    for j in jobs[:5]:
        print(f"\n- {j['title']} | {j['company']} | {j['location']} | posted {j['posted']}\n  {j['apply_link']}\n  {j['description'][:160]!r}")