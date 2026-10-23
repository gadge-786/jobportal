import requests
from bs4 import BeautifulSoup
from supabase import create_client
from dotenv import load_dotenv
import os
import sys
import time
import re
from datetime import datetime, timedelta, timezone
from last_date import derive_last_date, PLACEHOLDER

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

# Refresh settings: how often and how many existing jobs are re-checked
MAX_REFRESH_PER_RUN = 20
REFRESH_WINDOW_DAYS = 30
MIN_HOURS_BETWEEN_CHECKS = 20
TRACKED_FIELDS = ['details_table', 'notification_pdf', 'apply_link']

SKIP_KEYWORDS = [
    'android app', 'ios app', 'apple app', 'youtube', 'instagram',
    'facebook', 'telegram', 'whatsapp', 'google play', 'app store',
    'advertis', 'sponsor', 'download app', 'follow us', 'subscribe',
    'contact us', 'about us', 'privacy policy', 'disclaimer', 'sitemap',
    'freejobalert', 'free job alert', 'home page', 'click here'
]

JOB_KEYWORDS = [
    'recruitment', 'vacancy', 'vacancies', 'bharti', 'notification',
    'apply', 'application', 'post', 'admit card', 'result', 'answer key',
    'syllabus', 'cut off', 'merit list', 'selection', 'hall ticket',
    'exam date', 'interview'
]

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def parse_ts(value):
    try:
        return datetime.fromisoformat(value.replace('Z', '+00:00'))
    except Exception:
        return None

def get_existing_titles():
    response = supabase.table('jobs').select('title').execute()
    return {job['title'].lower() for job in response.data}

def determine_category(title):
    t = title.lower()
    if any(w in t for w in ['admit card', 'hall ticket', 'call letter', 'exam city']):
        return 'admit-cards'
    if any(w in t for w in ['result', 'merit list', 'cut off', 'scorecard']):
        return 'results' 

    title_lower = title.lower()
    if any(w in title_lower for w in ['railway', 'rrb', 'ntpc', 'loco pilot', 'station master', 'rpf']):
        return 'railway'
    elif any(w in title_lower for w in ['bank', 'sbi', 'ibps', 'rbi', 'nabard', 'ippb', 'clerk', ' po ', 'probationary officer']):
        return 'banking'
    elif any(w in title_lower for w in ['army', 'navy', 'air force', 'cisf', 'crpf', 'bsf', 'itbp', 'ssb', 'defence', 'military', 'soldier', 'paramilitary', 'coast guard', 'agniveer']):
        return 'defence'
    elif any(w in title_lower for w in ['teacher', 'tgt', 'pgt', 'lecturer', 'professor', 'kvs', 'nvs', 'principal', 'headmaster', 'faculty', 'teaching']):
        return 'teaching'
    elif any(w in title_lower for w in ['software', 'developer', 'programmer', 'data scientist', 'web developer']):
        return 'it-software'
    else:
        return 'government'

def is_real_job(title):
    title_lower = title.lower()
    if any(skip in title_lower for skip in SKIP_KEYWORDS):
        return False
    if len(title) < 15 or len(title) > 150:
        return False
    if not any(kw in title_lower for kw in JOB_KEYWORDS):
        return False
    return True

def extract_job_details(detail_url):
    """Visit the individual job page and extract structured table data"""
    result = {
        'official_link': None,
        'pdf_link': None,
        'details_table': {},
    }
    try:
        response = requests.get(detail_url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        identifying_keywords = ['organization', 'organisation', 'vacanc', 'qualification',
                                 'official website', 'post name', 'age limit', 'notification',
                                 'notice number', 'selection process']

        bad_values = ['details', 'particulars', 'last date', 'date', 'posts', 'post name',
                      'set a', 'set b', 'set c', 'set d']

        found_valid_table = False

        for table in soup.find_all('table'):
            if found_valid_table:
                break

            rows = table.find_all('tr')
            temp_rows = []
            keyword_match_count = 0

            for row in rows:
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 2:
                    label = cells[0].get_text(strip=True)
                    value = cells[1].get_text(strip=True)

                    if not label or not value or len(label) > 60 or len(value) > 200:
                        continue

                    label_lower = label.lower()
                    value_lower = value.lower()

                    if value_lower in bad_values:
                        continue
                    if label.replace('.', '').isdigit():
                        continue
                    if value.strip().upper() in ['A', 'B', 'C', 'D', 'DROPPED']:
                        continue
                    if re.search(r'-\s*\d+\s*posts?', label_lower) or re.search(r'-\s*\d+\s*posts?', value_lower):
                        continue

                    temp_rows.append((label, value))
                    if any(kw in label_lower for kw in identifying_keywords):
                        keyword_match_count += 1

            if keyword_match_count >= 2:
                for label, value in temp_rows:
                    result['details_table'][label] = value
                found_valid_table = True

        for link in soup.find_all('a', href=True):
            href = link['href']
            if href.lower().endswith('.pdf'):
                result['pdf_link'] = href if href.startswith('http') else f"https://www.freejobalert.com{href}"
                break

        for link in soup.find_all('a', href=True):
            href = link['href']
            if href.lower().endswith('.pdf'):
                continue
            if ('.gov.in' in href or '.nic.in' in href) and 'freejobalert' not in href:
                result['official_link'] = href
                break

    except Exception as e:
        print(f"  Could not extract details: {e}")

    return result

def fresh_values(details, source_url):
    """The three fields we track for changes, in the same form they are stored"""
    return {
        'details_table': details.get('details_table') or {},
        'notification_pdf': details.get('pdf_link'),
        'apply_link': details.get('official_link') or source_url,
    }

def build_description(title, category):
    category_line = {
        'railway': 'This recruitment is conducted by the Railway Recruitment Board for posts in Indian Railways.',
        'banking': 'This recruitment is for positions in the banking sector.',
        'defence': 'This recruitment is for defence and paramilitary forces.',
        'teaching': 'This recruitment is for teaching positions in government institutions.',
        'it-software': 'This is a private sector IT and software industry opportunity.',
        'government': 'This recruitment is conducted by a government department.',
    }
    return f"{title}. {category_line.get(category, category_line['government'])} Full details including vacancies, important dates and eligibility are listed below."

def scrape_freejobalert():
    print("Starting scraper for freejobalert.com...")
    try:
        url = 'https://www.freejobalert.com'
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        existing_titles = get_existing_titles()
        print(f"Existing jobs in database: {len(existing_titles)}")
        jobs_added = 0

        for link in soup.find_all('a', href=True):
            title = link.get_text(strip=True)
            href = link.get('href', '')

            if not is_real_job(title):
                continue
            if title.lower() in existing_titles:
                continue

            if href.startswith('/'):
                detail_url = f"https://www.freejobalert.com{href}"
            elif href.startswith('http'):
                detail_url = href
            else:
                detail_url = f"https://www.freejobalert.com/{href}"

            category = determine_category(title)

            print(f"Fetching details for: {title}")
            details = extract_job_details(detail_url)
            time.sleep(0.5)

            fresh = fresh_values(details, detail_url)

            job_data = {
                'title': title,
                'company': 'Government of India',
                'category': category,
                'job_type': 'government',
                'location': 'All India',
                'salary': 'As per government norms',
                'description': build_description(title, category),
                'apply_link': fresh['apply_link'],
                'notification_pdf': fresh['notification_pdf'],
                'details_table': fresh['details_table'],
                'last_date': derive_last_date(details.get('details_table')) or PLACEHOLDER,
                'is_active': True,
                'is_featured': False,
                'source_url': detail_url,
                'scraped_snapshot': fresh,
                'last_checked_at': now_iso(),
            }

            try:
                supabase.table('jobs').insert(job_data).execute()
                existing_titles.add(title.lower())
                jobs_added += 1
                print(f"✓ Added [{category}]: {title}")
                if jobs_added >= 15:
                    break
            except Exception as e:
                print(f"Error inserting: {e}")
                continue

        print(f"\nDone! Added {jobs_added} new jobs with detailed info.")

    except Exception as e:
        print(f"Scraping error: {e}")

def refresh_existing_jobs(dry_run=False):
    """Re-check recent scraped jobs and update fields that changed on the source page.
    Fields you edited by hand are never overwritten."""
    print("\nChecking existing jobs for source changes..." + (" (DRY RUN, nothing is written)" if dry_run else ""))

    cutoff = (datetime.now(timezone.utc) - timedelta(days=REFRESH_WINDOW_DAYS)).strftime('%Y-%m-%dT%H:%M:%SZ')
    try:
        response = (
            supabase.table('jobs')
            .select('id, title, source_url, scraped_snapshot, last_checked_at, details_table, notification_pdf, apply_link')
            .eq('is_active', True)
            .gte('created_at', cutoff)
            .execute()
        )
    except Exception as e:
        print(f"Could not load jobs to refresh: {e}")
        return

    now = datetime.now(timezone.utc)
    never = datetime.min.replace(tzinfo=timezone.utc)
    candidates = []
    for job in response.data:
        if not job.get('source_url') or not job.get('scraped_snapshot'):
            continue  # jobs added before this feature, or by hand, are never touched
        checked = parse_ts(job['last_checked_at']) if job.get('last_checked_at') else None
        if checked and now - checked < timedelta(hours=MIN_HOURS_BETWEEN_CHECKS):
            continue
        candidates.append((checked or never, job))

    candidates.sort(key=lambda pair: pair[0])
    candidates = candidates[:MAX_REFRESH_PER_RUN]
    print(f"{len(candidates)} job(s) due for a check")

    changed = protected = failed = 0

    for _, job in candidates:
        source_url = job['source_url']
        fresh = fresh_values(extract_job_details(source_url), source_url)
        time.sleep(0.5)

        looks_empty = (
            not fresh['details_table']
            and not fresh['notification_pdf']
            and fresh['apply_link'] == source_url
        )
        if looks_empty:
            failed += 1
            print(f"- No usable data (page gone or layout changed): {job['title']}")
            if not dry_run:
                supabase.table('jobs').update({'last_checked_at': now_iso()}).eq('id', job['id']).execute()
            continue

        old_snapshot = job['scraped_snapshot'] or {}
        updates = {}
        kept_manual = []

        for field in TRACKED_FIELDS:
            new_val = fresh[field]
            if not new_val:
                continue  # never blank a field because a scrape came back empty
            if new_val == old_snapshot.get(field):
                continue  # the source has not changed
            if job.get(field) == old_snapshot.get(field):
                updates[field] = new_val  # live value is still the scraped one, safe to refresh
            else:
                kept_manual.append(field)  # edited by hand, keep it

        if updates:
            changed += 1
            print(f"* Changed on source: {job['title']} -> {', '.join(updates.keys())}")
        if kept_manual:
            protected += 1
            print(f"  Kept your manual edit(s) in {job['title']}: {', '.join(kept_manual)}")

        new_snapshot = {**old_snapshot, **{f: v for f, v in fresh.items() if v}}
        record = {**updates, 'scraped_snapshot': new_snapshot, 'last_checked_at': now_iso()}

        if not dry_run:
            res = supabase.table('jobs').update(record).eq('id', job['id']).execute()
            if not res.data:
                print(f"  WARNING: update touched no rows for {job['title']} (possible permissions/RLS problem)")

    print(f"\nRefresh done: {changed} changed, {protected} with protected manual edits, {failed} unusable pages.")

if __name__ == '__main__':
    mode = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if mode == 'refresh-dry':
        refresh_existing_jobs(dry_run=True)
    elif mode == 'refresh':
        refresh_existing_jobs()
    else:
        scrape_freejobalert()
        refresh_existing_jobs()