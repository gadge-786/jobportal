"""Step 1 of private-jobs scraping: find which companies have a working public job feed
(Greenhouse, Lever, Ashby, SmartRecruiters or Workable) and how many of their jobs are in Maharashtra.
Run on your PC:  python probe_boards.py
Nothing is saved to your database - it only prints a table.
Add or remove company slugs in COMPANIES. The slug is the last part of the company's careers URL:
  boards.greenhouse.io/<slug>   or   jobs.lever.co/<slug>
"""
import requests

# These are GUESSES - many will show 'no feed', which is fine. Add the ones you find.
COMPANIES = [
    'phonepe', 'cred', 'razorpay', 'meesho', 'groww', 'zeta', 'postman', 'freshworks', 'druva',
    'persistent', 'zscaler', 'atlassian', 'coinswitch', 'whatfix', 'browserstack', 'sharechat',
    'dream11', 'urbancompany', 'swiggy', 'zomato', 'icertis', 'cleartax',
    'paytm', 'ola', 'lenskart', 'nykaa', 'bharatpe', 'slice', 'jupiter', 'upstox', 'zerodha',
    'chargebee', 'hasura', 'razorpayx', 'jumpcloud', 'thoughtworks', 'nutanix', 'veritas',
    'netapp', 'vmware', 'cloudera', 'pubmatic', 'sumologic', 'amagi', 'gojek', 'unacademy',
    'physicswallah', 'vedantu', 'eightfold', 'mindtickle', 'rubrik', 'sprinklr', 'zoho',
    'qualys', 'barclays', 'visa', 'mastercard', 'bosch', 'siemens', 'tcs', 'infosys', 'wipro',
    'techmahindra', 'capgemini', 'accenture', 'cognizant', 'ltimindtree', 'mphasis', 'hexaware',
    'zensar', 'cybage', 'amdocs', 'bnymellon', 'deutschebank', 'jpmorgan', 'wellsfargo',
]
PLACES = ('pune', 'mumbai', 'navi mumbai', 'thane', 'nagpur', 'nashik', 'maharashtra')
HEADERS = {'User-Agent': 'DwarSing job portal feed check (dwarsing.in)'}


def greenhouse(slug):
    r = requests.get(f'https://boards-api.greenhouse.io/v1/boards/{slug}/jobs', headers=HEADERS, timeout=20)
    if r.status_code != 200:
        return None
    return [(j.get('title', ''), (j.get('location') or {}).get('name', '')) for j in r.json().get('jobs', [])]


def lever(slug):
    r = requests.get(f'https://api.lever.co/v0/postings/{slug}?mode=json', headers=HEADERS, timeout=20)
    if r.status_code != 200 or not isinstance(r.json(), list):
        return None
    return [(j.get('text', ''), (j.get('categories') or {}).get('location', '') or '') for j in r.json()]


def ashby(slug):
    r = requests.get(f'https://api.ashbyhq.com/posting-api/job-board/{slug}', headers=HEADERS, timeout=20)
    if r.status_code != 200:
        return None
    return [(j.get('title', ''), j.get('location', '') or '') for j in r.json().get('jobs', [])]


def smartrecruiters(slug):
    r = requests.get(f'https://api.smartrecruiters.com/v1/companies/{slug}/postings?limit=100', headers=HEADERS, timeout=20)
    if r.status_code != 200:
        return None
    out = []
    for j in r.json().get('content', []):
        loc = j.get('location') or {}
        out.append((j.get('name', ''), f"{loc.get('city', '')}, {loc.get('region', '')}"))
    return out or None


def workable(slug):
    r = requests.get(f'https://apply.workable.com/api/v1/widget/accounts/{slug}', headers=HEADERS, timeout=20)
    if r.status_code != 200:
        return None
    return [(j.get('title', ''), f"{j.get('city', '')}, {j.get('state', '')}") for j in r.json().get('jobs', [])]


def in_mh(loc):
    loc = (loc or '').lower()
    return any(p in loc for p in PLACES)


print(f"{'company':<14}{'feed':<12}{'all jobs':>9}{'Maharashtra':>13}  sample")
for slug in COMPANIES:
    for name, fn in (('greenhouse', greenhouse), ('lever', lever), ('ashby', ashby), ('smartrecruit', smartrecruiters), ('workable', workable)):
        try:
            jobs = fn(slug)
        except Exception as e:
            jobs = None
        if jobs is None:
            continue
        mh = [j for j in jobs if in_mh(j[1])]
        sample = f'{mh[0][0]} ({mh[0][1]})' if mh else ''
        print(f'{slug:<14}{name:<12}{len(jobs):>9}{len(mh):>13}  {sample[:60]}')
        break
    else:
        print(f'{slug:<14}{"no feed":<12}')