import requests
from bs4 import BeautifulSoup
from supabase import create_client
from dotenv import load_dotenv
import os
import time

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

# Connect to Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_existing_titles():
    """Get all job titles already in database to avoid duplicates"""
    response = supabase.table('jobs').select('title').execute()
    return {job['title'].lower() for job in response.data}

def determine_category(title):
    """Auto-detect category from job title"""
    title_lower = title.lower()
    if any(word in title_lower for word in ['railway', 'rrb', 'ntpc', 'loco pilot', 'station master']):
        return 'railway'
    elif any(word in title_lower for word in ['bank', 'sbi', 'ibps', 'rbi', 'nabard', 'ippb', 'clerk', 'po ', 'probationary']):
        return 'banking'
    elif any(word in title_lower for word in ['army', 'navy', 'air force', 'cisf', 'crpf', 'bsf', 'itbp', 'ssb', 'defence', 'military', 'soldier', 'constable', 'paramilitary']):
        return 'defence'
    elif any(word in title_lower for word in ['teacher', 'tgt', 'pgt', 'lecturer', 'professor', 'kvs', 'nvs', 'principal', 'headmaster', 'faculty']):
        return 'teaching'
    elif any(word in title_lower for word in ['software', 'developer', 'programmer', 'data scientist', 'web developer', 'android', 'ios developer']):
        return 'it-software'
    elif any(word in title_lower for word in ['private', 'ltd', 'pvt', 'limited', 'technologies', 'solutions']):
        return 'private'
    else:
        return 'government'

def scrape_sarkari_result():
    """Scrape latest jobs from sarkariresult.com"""
    print("Starting scraper...")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        url = 'https://www.sarkariresult.com'
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Get existing titles to avoid duplicates
        existing_titles = get_existing_titles()
        print(f"Found {len(existing_titles)} existing jobs in database")
        
        jobs_added = 0
        
        # Find all job links on the page
        job_links = soup.find_all('a', href=True)
        
        for link in job_links:
            title = link.get_text(strip=True)
            href = link.get('href', '')
            
            # Skip if title is too short or already exists
            if len(title) < 10:
                continue
            if title.lower() in existing_titles:
                print(f"Skipping duplicate: {title}")
                continue

            # Only process job-related links
            job_keywords = ['recruitment', 'vacancy', 'bharti', 'jobs', 'result', 'admit', 'notification', '2025', '2026']
            if not any(kw in title.lower() for kw in job_keywords):
                continue
            
            # Build full URL
            if href.startswith('/'):
                apply_link = f"https://www.sarkariresult.com{href}"
            elif href.startswith('http'):
                apply_link = href
            else:
                apply_link = f"https://www.sarkariresult.com/{href}"
            
            category = determine_category(title)
            
            job_data = {
                'title': title,
                'company': 'Sarkari Result',
                'category': category,
                'job_type': 'government',
                'location': 'All India',
                'salary': 'As per government norms',
                'description': f'{title}. Visit the official website for complete details, eligibility criteria, and application process.',
                'apply_link': apply_link,
                'last_date': 'Check official notification',
                'is_active': True,
                'is_featured': False
            }

            try:
                supabase.table('jobs').insert(job_data).execute()
                existing_titles.add(title.lower())
                jobs_added += 1
                print(f"Added: {title}")
                time.sleep(0.5)  # Be polite to the server
                
                if jobs_added >= 20:  # Limit to 20 new jobs per run
                    break
                    
            except Exception as e:
                print(f"Error inserting job: {e}")
                continue
        
        print(f"\nDone! Added {jobs_added} new jobs to database.")
        
    except Exception as e:
        print(f"Scraping error: {e}")

if __name__ == '__main__':
    scrape_sarkari_result()