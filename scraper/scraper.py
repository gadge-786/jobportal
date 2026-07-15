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

def get_existing_titles():
    response = supabase.table('jobs').select('title').execute()
    return {job['title'].lower() for job in response.data}

def generate_overview(title, category):
    category_context = {
        'railway': 'This recruitment is conducted by the Railway Recruitment Board (RRB) for various posts in Indian Railways, one of the largest employers in India.',
        'banking': 'This recruitment is conducted for positions in the banking sector, offering stable government or public sector bank careers with good growth opportunities.',
        'defence': 'This recruitment is for defence and paramilitary forces, offering the opportunity to serve the nation with attractive pay scales and additional allowances.',
        'teaching': 'This recruitment is for teaching positions in government or government-aided institutions, ideal for candidates with a passion for education.',
        'it-software': 'This is a private sector opportunity in the IT and software industry, suited for candidates with technical skills and relevant qualifications.',
        'private': 'This is a private sector job opportunity offering competitive salary and career growth in a corporate environment.',
        'government': 'This recruitment is conducted by a government department, offering job security, government benefits and a stable career path.',
    }
    context = category_context.get(category, category_context['government'])
    return f'{title} — {context} Candidates interested in this opportunity should review the complete eligibility criteria, age limit, and selection process on the official notification before applying.'

def determine_category(title):
    title_lower = title.lower()
    if any(word in title_lower for word in ['railway', 'rrb', 'ntpc', 'loco pilot', 'station master', 'rpf']):
        return 'railway'
    elif any(word in title_lower for word in ['bank', 'sbi', 'ibps', 'rbi', 'nabard', 'ippb', 'clerk', ' po ', 'probationary officer']):
        return 'banking'
    elif any(word in title_lower for word in ['army', 'navy', 'air force', 'cisf', 'crpf', 'bsf', 'itbp', 'ssb', 'defence', 'military', 'soldier', 'paramilitary', 'coast guard', 'agniveer']):
        return 'defence'
    elif any(word in title_lower for word in ['teacher', 'tgt', 'pgt', 'lecturer', 'professor', 'kvs', 'nvs', 'principal', 'headmaster', 'faculty', 'teaching']):
        return 'teaching'
    elif any(word in title_lower for word in ['software', 'developer', 'programmer', 'data scientist', 'web developer', 'android developer', 'ios developer']):
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

def scrape_freejobalert():
    print("Starting scraper for freejobalert.com...")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    try:
        url = 'https://www.freejobalert.com'
        response = requests.get(url, headers=headers, timeout=15)
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
                apply_link = f"https://www.freejobalert.com{href}"
            elif href.startswith('http'):
                apply_link = href
            else:
                apply_link = f"https://www.freejobalert.com/{href}"

            category = determine_category(title)

            job_data = {
                'title': title,
                'company': 'Government of India',
                'category': category,
                'job_type': 'government',
                'location': 'All India',
                'salary': 'As per government norms',
                'description': generate_overview(title, category),
                'apply_link': apply_link,
                'last_date': 'Check official notification',
                'is_active': True,
                'is_featured': False
            }

            try:
                supabase.table('jobs').insert(job_data).execute()
                existing_titles.add(title.lower())
                jobs_added += 1
                print(f"Added [{category}]: {title}")
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
    scrape_freejobalert()