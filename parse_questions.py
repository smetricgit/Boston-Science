import re, json, pathlib
text = pathlib.Path('/mnt/data/science-bee-app/questions.txt').read_text(encoding='utf-8', errors='ignore')
lines = text.splitlines()
questions=[]
current_round='Unknown Round'
current_section=''
cur=None

def flush():
    global cur
    if not cur: return
    body='\n'.join(cur['lines']).strip()
    m=re.search(r'ANSWER:\s*(.*)', body, flags=re.S)
    if m:
        q=body[:m.start()].strip()
        a=m.group(1).strip()
        q=re.sub(r'\s+', ' ', q)
        a=re.sub(r'\s+', ' ', a)
        q=re.sub(r'^\(\d+\)\s*', '', q).strip()
        if q and a:
            questions.append({
                'id': len(questions)+1,
                'round': cur['round'],
                'section': cur['section'],
                'number': cur['number'],
                'question': q,
                'answer': a,
                'acceptableAnswers': extract_answers(a),
            })
    cur=None

def extract_answers(ans):
    # Best-effort answer variants from common quizbowl syntax.
    base = re.split(r'\s*\((?:accept|or|prompt|do not|do not accept|accept either|accept specific|Editors note|prompt on)', ans, maxsplit=1, flags=re.I)[0].strip(' .;')
    variants=[]
    if base: variants.append(base)
    # capture parenthetical accept/or aliases but exclude prompt/do not instructions
    for p in re.findall(r'\(([^)]*)\)', ans):
        if re.search(r'\b(do not|prompt|before|after|note)\b', p, re.I):
            continue
        p=re.sub(r'^(accept|or)\s+', '', p, flags=re.I).strip()
        parts=re.split(r';|,?\s+or\s+', p)
        for part in parts:
            part=re.sub(r'\baccept\b', '', part, flags=re.I).strip(' .;')
            if part and len(part)<80:
                variants.append(part)
    # de-duplicate
    out=[]
    for v in variants:
        if v and v.lower() not in [x.lower() for x in out]:
            out.append(v)
    return out

round_pat=re.compile(r'(?:\([A-Z]+\)\s*)?Science Bee (Round \d+|Backup|Extras|Semifinals|Finals|Bee Finals|National Finals|Championship).*', re.I)
for raw in lines:
    line=raw.strip()
    if not line:
        if cur: cur['lines'].append('')
        continue
    rm=round_pat.search(line)
    if rm and not line.startswith('ANSWER'):
        flush()
        current_round=line
        current_section=''
        continue
    if line in {'Regulation Tossups','Extra Questions','Tiebreaker Questions'}:
        flush()
        current_section=line
        continue
    qm=re.match(r'^\((\d+)\)\s+', line)
    if qm:
        flush()
        cur={'round':current_round,'section':current_section,'number':int(qm.group(1)),'lines':[line]}
    elif cur:
        cur['lines'].append(line)
flush()
path=pathlib.Path('/mnt/data/science-bee-app/questions.json')
path.write_text(json.dumps(questions, ensure_ascii=False, indent=2), encoding='utf-8')
print(len(questions))
print(questions[0])
print(questions[-1])
