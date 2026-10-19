"""Parse the real application deadline out of a scraped details_table.

Usage in scraper.py:
    from last_date import derive_last_date, PLACEHOLDER
"""
import re
from datetime import date

PLACEHOLDER = 'Check official notification'

MONTHS = {m: i for i, m in enumerate(
    ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'], 1)}

# Labels we never want (other dates that also say "last date")
BAD_LABEL = re.compile(r'fee|payment|correction|edit|modif|withdraw|exam|admit|result|answer|interview|document|dv\b', re.I)
# Labels that strongly mean "deadline to apply"
GOOD_LABEL = re.compile(r'apply|application|registration|online|submission|walk', re.I)

NUM_DATE = re.compile(r'\b(\d{1,2})\s*[/\-.]\s*(\d{1,2})\s*[/\-.]\s*(\d{2,4})\b')
DMY_TEXT = re.compile(r'\b(\d{1,2})(?:st|nd|rd|th)?[\s\-,]*([A-Za-z]{3,9})[\s\-,.]*(\d{4})\b')
MDY_TEXT = re.compile(r'\b([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b')


def _mk(y, m, d):
    if y < 100:
        y += 2000
    try:
        return date(y, m, d)
    except ValueError:
        return None


def parse_date(text):
    """Return the first date found in text as a date, or None. Indian day-first order."""
    if not text:
        return None
    m = NUM_DATE.search(text)
    if m:
        d, mo, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
        return _mk(y, mo, d)
    m = DMY_TEXT.search(text)
    if m and m.group(2)[:3].lower() in MONTHS:
        return _mk(int(m.group(3)), MONTHS[m.group(2)[:3].lower()], int(m.group(1)))
    m = MDY_TEXT.search(text)
    if m and m.group(1)[:3].lower() in MONTHS:
        return _mk(int(m.group(3)), MONTHS[m.group(1)[:3].lower()], int(m.group(2)))
    return None


def derive_last_date(details_table):
    """Return e.g. '15 November 2026', or None if no trustworthy deadline is found."""
    if not isinstance(details_table, dict):
        return None
    best = None  # (score, date)
    for label, value in details_table.items():
        l = str(label).lower()
        if 'last' not in l and 'closing' not in l and 'end date' not in l and 'deadline' not in l:
            continue
        if BAD_LABEL.search(l):
            continue
        d = parse_date(str(value))
        if not d:
            continue
        score = 2 if GOOD_LABEL.search(l) else 1
        if best is None or score > best[0]:
            best = (score, d)
    if not best:
        return None
    return f"{best[1].day} {best[1].strftime('%B %Y')}"


if __name__ == '__main__':
    # CLI: backfill existing jobs that still show the placeholder
    import sys
    from dotenv import load_dotenv
    import os
    from supabase import create_client
    load_dotenv()
    sb = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))
    dry = '--dry' in sys.argv
    rows = sb.table('jobs').select('id,title,last_date,details_table').eq('is_active', True).execute().data
    n = 0
    for r in rows:
        if (r.get('last_date') or PLACEHOLDER) != PLACEHOLDER:
            continue  # already has a real or hand-entered date: never overwrite
        ld = derive_last_date(r.get('details_table'))
        if not ld:
            continue
        print(f"{'[dry] ' if dry else ''}{r['title'][:60]}  ->  {ld}")
        if not dry:
            sb.table('jobs').update({'last_date': ld}).eq('id', r['id']).execute()
        n += 1
    print(f"{n} job(s) {'would be ' if dry else ''}updated")