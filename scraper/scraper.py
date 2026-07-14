import requests
from bs4 import BeautifulSoup
from supabase import create_client
from dotenv import load_dotenv
import os
import time

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Words that indicate it's NOT a real job — skip these
SKIP_KEYWORDS = [
    'android app', 'ios app', 'apple app', 'youtube', 'instagram',
    'facebook', 'telegram', 'whatsapp', 'google play', 'app store',
    'sarkari result®', 'sarkariresult', 'advertis', 'sponsor',
    'download app', 'follow us', 'subscribe', 'contact us',
    'about us', 'privacy policy', 'disclaimer', 'sitemap',
    'result®', 'android', 'apple /'
]

# Words that MUST appear for it to be a real job
JOB_KEYWORDS = [
    'recruitment', 'vacancy', 'vacancies', 'bharti', 'notification',
    'apply', 'application', 'post', 'admit card', 'result', 'answer key',
    'syllabus', 'cut off', 'merit list', 'selection', 'joining'
]

def get_existing_titles():
    response = supabase.table('jobs').select('title').execute()
    return {job['title'].lower() for job in response.data}

def determine_category(title):
    title_lower = title.lower()
    if any(word in title_lower for word in ['railway', 'rrb', 'ntpc', 'loco pilot', 'station master', 'rpf']):
        return 'railway'
    elif any(word in title_lower for word in ['bank', 'sbi', 'ibps', 'rbi', 'nabard', 'ippb', 'clerk', ' po ', 'probationary officer']):
        return 'banking'
    elif any(word in title_lower for word in ['army', 'navy', 'air force', 'cisf', 'crpf', 'bsf', 'itbp', 'ssb', 'defence', 'military', 'soldier', 'paramilitary', 'coast guard']):
        return 'defence'
    elif any(word in title_lower for word in ['teacher', 'tgt', 'pgt', 'lecturer', 'professor', 'kvs', 'nvs', 'principal', 'headmaster', 'faculty', 'teaching']):
        return 'teaching'
    elif any(word in title_lower for word in ['software', 'developer', 'programmer', 'data scientist', 'web developer', 'android developer', 'ios developer']):
        return 'it-software'
    else:
        return 'government'

def is_real_job(title):
    title_lower = title.lower()
    # Skip if contains advertisement keywords
    if any(skip in title_lower for skip in SKIP_KEYWORDS):
        return False
    # Skip if title is too short or too long
    if len(title) < 15 or len(title) > 150:
        return False
    # Must contain at least one job-related keyword
    if not any(kw in title_lower for kw in JOB_KEYWORDS):
        return False
    return True

def scrape_sarkari_result():
    print("Starting scraper...")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    try:
        url = 'https://www.sarkariresult.com'
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        existing_titles = get_existing_titles()
        print(f"Existing jobs in database: {len(existing_titles)}")
        jobs_added = 0

        for link in soup.find_all('a', href=True):
            title = link.get_text(strip=True)
            href = link.get('href', '')

            # Filter out fake/ad entries
            if not is_real_job(title):
                continue
            if title.lower() in existing_titles:
                continue

            if href.startswith('/'):
                apply_link = f"https://www.sarkariresult.com{href}"
            elif href.startswith('http'):
                apply_link = href
            else:
                apply_link = f"https://www.sarkariresult.com/{href}"

            category = determine_category(title)

            job_data = {
                'title': title,
                'company': 'Government of India',
                'category': category,
                'job_type': 'government',
                'location': 'All India',
                'salary': 'As per government norms',
                'description': f'{title}. Visit the official notification for complete details including eligibility criteria, age limit, selection process and application procedure.',
                'apply_link': apply_link,
                'last_date': 'Check official notification',
                'is_active': True,
                'is_featured': False
            }

            try:
                supabase.table('jobs').insert(job_data).execute()
                existing_titles.add(title.lower())
                jobs_added += 1
                print(f"✓ Added [{category}]: {title}")
                time.sleep(0.3)
                if jobs_added >= 30:
                    break
            except Exception as e:
                print(f"Error inserting: {e}")
                continue

        print(f"\nDone! Added {jobs_added} new jobs.")

    except Exception as e:
        print(f"Scraping error: {e}")

if __name__ == '__main__':
    scrape_sarkari_result()