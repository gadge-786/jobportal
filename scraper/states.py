"""Single source of truth for state detection.

  determine_state(title) -> slug or None (None = central / all-India)
  python states.py --sql   -> prints the SQL (add column + preview + backfill)
  python states.py --js    -> prints lib/states.js
Order matters: the first state whose keywords match wins.
"""
import re, sys, json

# slug: (English name, Marathi name, [keywords - letters and spaces only])
STATES = {
 'maharashtra': ('Maharashtra', 'महाराष्ट्र', ['mpsc','maharashtra','mahatransco','mahagenco','mahadiscom','msedcl','mahavitaran','msrtc','bmc','mumbai','navi mumbai','bombay','pune','pcmc','nagpur','nashik','thane','kolhapur','sangli','satara','solapur','aurangabad','sambhajinagar','deogiri','ahmednagar','latur','nanded','jalgaon','amravati','akola','mhada','mahatet']),
 'uttar-pradesh': ('Uttar Pradesh', 'उत्तर प्रदेश', ['uppsc','upsssc','uttar pradesh','up police','uppcl','upsc up','lucknow','allahabad high court','prayagraj']),
 'bihar': ('Bihar', 'बिहार', ['bpsc','bssc','bpssc','bihar','patna']),
 'rajasthan': ('Rajasthan', 'राजस्थान', ['rpsc','rssb','rsmssb','rajasthan','jaipur','jodhpur']),
 'madhya-pradesh': ('Madhya Pradesh', 'मध्य प्रदेश', ['mppsc','mpesb','madhya pradesh','mp police','vyapam','bhopal','indore']),
 'gujarat': ('Gujarat', 'गुजरात', ['gpsc','gsssb','gujarat','ojas','gsecl','ahmedabad','surat','vadodara','rajkot','gandhinagar']),
 'karnataka': ('Karnataka', 'कर्नाटक', ['kpsc','kea','karnataka','bangalore','bengaluru','kpcl','mysore']),
 'tamil-nadu': ('Tamil Nadu', 'तमिळनाडू', ['tnpsc','tnusrb','tn mrb','tamil nadu','tamilnadu','chennai','coimbatore','madurai']),
 'kerala': ('Kerala', 'केरळ', ['kerala','kpsc kerala','thiruvananthapuram','kochi']),
 'andhra-pradesh': ('Andhra Pradesh', 'आंध्र प्रदेश', ['appsc','andhra pradesh','andhra','amaravati','visakhapatnam']),
 'telangana': ('Telangana', 'तेलंगणा', ['tspsc','tgpsc','telangana','tgsrtc','hyderabad']),
 'odisha': ('Odisha', 'ओडिशा', ['opsc','ossc','osssc','odisha','bhubaneswar','cuttack']),
 'west-bengal': ('West Bengal', 'पश्चिम बंगाल', ['wbpsc','wbssc','west bengal','wb police','kolkata','calcutta']),
 'assam': ('Assam', 'आसाम', ['apsc','assam','adre','slprb','gauhati','guwahati']),
 'punjab': ('Punjab', 'पंजाब', ['ppsc','pspcl','psssb','punjab','ludhiana','amritsar']),
 'haryana': ('Haryana', 'हरियाणा', ['hpsc','hssc','haryana','hpgcl','gurugram','gurgaon']),
 'himachal-pradesh': ('Himachal Pradesh', 'हिमाचल प्रदेश', ['hppsc','himachal','shimla']),
 'uttarakhand': ('Uttarakhand', 'उत्तराखंड', ['uksssc','ukpsc','uttarakhand','dehradun']),
 'jharkhand': ('Jharkhand', 'झारखंड', ['jpsc','jssc','jharkhand','ranchi']),
 'chhattisgarh': ('Chhattisgarh', 'छत्तीसगड', ['cgpsc','cgvyapam','chhattisgarh','raipur']),
 'delhi': ('Delhi', 'दिल्ली', ['dsssb','delhi','new delhi','ndmc']),
 'jammu-kashmir': ('Jammu & Kashmir', 'जम्मू आणि काश्मीर', ['jkssb','jkpsc','jammu','kashmir','srinagar']),
 'ladakh': ('Ladakh', 'लडाख', ['ladakh','lahdc','kssrb','leh','kargil']),
 'goa': ('Goa', 'गोवा', ['goa','panaji']),
 'chandigarh': ('Chandigarh', 'चंदीगड', ['chandigarh']),
 'north-east': ('North East', 'ईशान्य भारत', ['meghalaya','manipur','mizoram','nagaland','tripura','sikkim','arunachal','itanagar','shillong','imphal','aizawl','kohima','agartala','gangtok']),
}

def _kw(words):
    for w in words:
        assert re.fullmatch(r'[a-z ]+', w), w
    return '|'.join(sorted(words, key=len, reverse=True))

_PY = [(slug, re.compile(r'\b(?:%s)\b' % _kw(v[2]), re.I)) for slug, v in STATES.items()]

def determine_state(title):
    for slug, rx in _PY:
        if rx.search(title or ''):
            return slug
    return None

def sql():
    rows = ',\n  '.join(
        "(%d, '%s', '\\m(?:%s)\\M')" % (i, slug, _kw(v[2]).replace("'", "''"))
        for i, (slug, v) in enumerate(STATES.items()))
    kw = "with kw(ord, state, pat) as (values\n  %s\n)" % rows
    return f"""-- 1) column + index (safe to re-run)
alter table jobs add column if not exists state text;
create index if not exists jobs_state_idx on jobs(state);

-- 2) PREVIEW (changes nothing): what each active job would get
{kw}
select distinct on (j.id) k.state as new_state, j.title
from jobs j join kw k on j.title ~* k.pat
where j.is_active and j.state is null
order by j.id, k.ord;

-- 3) BACKFILL: run only after the preview looks right
begin;
alter table jobs disable trigger trigger_bump_job_updated_at;
{kw},
m as (
  select distinct on (j.id) j.id, k.state
  from jobs j join kw k on j.title ~* k.pat
  where j.is_active and j.state is null
  order by j.id, k.ord
)
update jobs set state = m.state from m where jobs.id = m.id;
alter table jobs enable trigger trigger_bump_job_updated_at;
commit;

-- 4) CHECK
-- select state, count(*) from jobs where is_active group by 1 order by 2 desc;
-- select count(*) from jobs where updated_at > now() - interval '5 minutes';  -- expect 0
"""

def auto_sql():
    whens = '\n    '.join(
        "when t ~* '\\m(?:%s)\\M' then '%s'" % (_kw(v[2]), slug) for slug, v in STATES.items())
    return f"""-- Auto-fill jobs.state on every manual or scripted insert
create or replace function detect_state(t text) returns text
language sql immutable as $$
  select case
    {whens}
    else null
  end
$$;

create or replace function set_job_state() returns trigger
language plpgsql as $$
begin
  if new.state is null and new.title is not null then
    new.state := detect_state(new.title);
  end if;
  return new;
end
$$;

drop trigger if exists trigger_set_job_state on jobs;
create trigger trigger_set_job_state
before insert or update of title on jobs
for each row execute function set_job_state();

-- TEST (changes nothing):
-- select detect_state('MPSC Group C Recruitment 2026');   -- maharashtra
-- select detect_state('SSC CGL 2026');                      -- null (central)
"""

def js():
    items = [{'slug': s, 'name': v[0], 'mr': v[1]} for s, v in STATES.items()]
    return ("// Generated from scraper/states.py - do not edit by hand\n"
            "export const STATES = %s\n\n"
            "export function stateLabel(slug, mr) {\n"
            "  if (slug === 'all-india') return mr ? 'केंद्र सरकार / संपूर्ण भारत' : 'Central / All India'\n"
            "  const s = STATES.find(x => x.slug === slug)\n"
            "  return s ? (mr ? s.mr : s.name) : slug\n}\n") % json.dumps(items, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    if '--sql' in sys.argv: print(sql())
    elif '--js' in sys.argv: print(js())
    elif '--auto-sql' in sys.argv: print(auto_sql())
    else: print('use --sql or --js')