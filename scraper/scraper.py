import requests
from bs4 import BeautifulSoup
from supabase import create_client
from dotenv import load_dotenv
import os
import time
import re

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

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

def determine_category(title):
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

        # Extract all tables — most job sites use tables for Important Dates, Vacancy Details, Fee etc.
        for table in soup.find_all('table'):
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 2:
                    label = cells[0].get_text(strip=True)
                    value = cells[1].get_text(strip=True)
                    if label and value and len(label) < 60 and len(value) < 200:
                        result['details_table'][label] = value

        # Find PDF notification link specifically
        for link in soup.find_all('a', href=True):
            href = link['href']
            if href.lower().endswith('.pdf'):
                result['pdf_link'] = href if href.startswith('http') else f"https://www.freejobalert.com{href}"
                break

        # Find the actual "apply online" link — usually has "apply" in the link text, and is NOT a pdf
        for link in soup.find_all('a', href=True):
            href = link['href']
            link_text = link.get_text(strip=True).lower()
            if href.lower().endswith('.pdf'):
                continue
            if ('.gov.in' in href or '.nic.in' in href) and 'freejobalert' not in href:
                result['official_link'] = href
                break

    except Exception as e:
        print(f"  Could not extract details: {e}")

    return result

def build_description(title, category):
    """Short, clean overview — detailed info now comes from the table separately"""
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

            # Use official govt link if found, otherwise fallback to the freejobalert page
            apply_link = details.get('official_link') or detail_url
            pdf_link = details.get('pdf_link')

            job_data = {
                'title': title,
                'company': 'Government of India',
                'category': category,
                'job_type': 'government',
                'location': 'All India',
                'salary': 'As per government norms',
                'description': build_description(title, category),
                'apply_link': apply_link,
                'notification_pdf': pdf_link,
                'details_table': details.get('details_table') or {},
                'last_date': 'Check official notification',
                'is_active': True,
                'is_featured': False
            }

            try:
                supabase.table('jobs').insert(job_data).execute()
                existing_titles.add(title.lower())
                jobs_added += 1
                print(f"✓ Added [{category}]: {title}")
                if jobs_added >= 15:  # Lower limit since each job now takes longer
                    break
            except Exception as e:
                print(f"Error inserting: {e}")
                continue

        print(f"\nDone! Added {jobs_added} new jobs with detailed info.")

    except Exception as e:
        print(f"Scraping error: {e}")

if __name__ == '__main__':
    scrape_freejobalert()