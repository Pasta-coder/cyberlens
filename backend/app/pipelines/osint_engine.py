import os, json, re, time
from typing import Dict, Any, Optional
import requests
from dotenv import load_dotenv

load_dotenv()

VT_API_KEY = os.getenv("VT_API_KEY", "")
ABUSEIPDB_KEY = os.getenv("ABUSEIPDB_KEY", "")
WHOIS_KEY = os.getenv("WHOIS_KEY", "")

FALLBACK_DIR = "app/pipelines/fallback_osint"

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})")
URL_RE   = re.compile(r"https?://([A-Za-z0-9.-]+\.[A-Za-z]{2,})(?:[^\s]*)")
IP_RE    = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")

def _read_json(path: str) -> Dict[str, Any]:
    try:
        with open(path, "r") as f:
            return json.load(f)
    except Exception:
        return {}

def _vt_headers():
    return {"x-apikey": VT_API_KEY} if VT_API_KEY else {}

def _safe_get_json(url: str, headers: Optional[dict] = None, params: Optional[dict] = None, timeout: int = 10):
    try:
        r = requests.get(url, headers=headers, params=params, timeout=timeout)
        if r.status_code == 200:
            return r.json(), False
        return {"error": f"status_{r.status_code}"}, True
    except Exception as e:
        return {"error": str(e)}, True

def _score_from_labels_count(count: int) -> int:
    # Simple mapping: more positives => higher risk (cap 100)
    return max(0, min(100, count * 15))

def _risk_label(score: int) -> str:
    if score >= 70: return "High"
    if score >= 40: return "Medium"
    return "Low"

# ---- Live Lookups ----

def vt_domain_report(domain: str):
    if not VT_API_KEY:
        return {"source":"virustotal","used_fallback":True,"note":"no_api_key"}
    url = f"https://www.virustotal.com/api/v3/domains/{domain}"
    data, failed = _safe_get_json(url, headers=_vt_headers())
    if failed: return {"source":"virustotal","used_fallback":True,**data}
    positives = 0
    try:
        cats = data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
        positives = cats.get("malicious", 0) + cats.get("suspicious", 0)
    except Exception:
        pass
    score = _score_from_labels_count(positives)
    return {"source":"virustotal","used_fallback":False,"positives":positives,"score":score,"risk":_risk_label(score)}

def vt_url_report(url_str: str):
    if not VT_API_KEY:
        return {"source":"virustotal_url","used_fallback":True,"note":"no_api_key"}
    # VT URL lookup: need URL id (base64url). Use the simple search endpoint as a fallback heuristic.
    search_url = "https://www.virustotal.com/api/v3/search"
    data, failed = _safe_get_json(search_url, headers=_vt_headers(), params={"query": url_str})
    if failed: return {"source":"virustotal_url","used_fallback":True,**data}
    positives = 0
    try:
        for item in data.get("data", []):
            stats = item.get("attributes", {}).get("last_analysis_stats", {})
            positives = max(positives, stats.get("malicious", 0) + stats.get("suspicious", 0))
    except Exception:
        pass
    score = _score_from_labels_count(positives)
    return {"source":"virustotal_url","used_fallback":False,"positives":positives,"score":score,"risk":_risk_label(score)}

def abuseipdb_report(ip: str):
    if not ABUSEIPDB_KEY:
        return {"source":"abuseipdb","used_fallback":True,"note":"no_api_key"}
    url = "https://api.abuseipdb.com/api/v2/check"
    headers = {"Key": ABUSEIPDB_KEY, "Accept": "application/json"}
    data, failed = _safe_get_json(url, headers=headers, params={"ipAddress": ip, "maxAgeInDays": "180"})
    if failed: return {"source":"abuseipdb","used_fallback":True,**data}
    score = int(data.get("data", {}).get("abuseConfidenceScore", 0))
    return {"source":"abuseipdb","used_fallback":False,"abuse_confidence":score,"risk":_risk_label(score)}

def whois_domain(domain: str):
    if not WHOIS_KEY:
        return {"source":"whois","used_fallback":True,"note":"no_api_key"}
    # Using WhoisXML API format
    url = "https://www.whoisxmlapi.com/whoisserver/WhoisService"
    params = {"apiKey": WHOIS_KEY, "domainName": domain, "outputFormat": "JSON"}
    data, failed = _safe_get_json(url, params=params)
    if failed: return {"source":"whois","used_fallback":True,**data}
    try:
        rec = data.get("WhoisRecord", {})
        reg = rec.get("registrarName")
        cr  = rec.get("createdDateNormalized") or rec.get("createdDate")
        cn  = rec.get("registryData", {}).get("country")
        age_tag = "new_domain" if cr and str(cr).startswith(("2025","2024","2023")) else "established"
        return {"source":"whois","used_fallback":False,"registrar":reg,"created":cr,"country":cn,"age_tag":age_tag}
    except Exception:
        return {"source":"whois","used_fallback":True,"error":"parse_error"}

# ---- Fallbacks ----

def fallback_domain(domain: str):
    db = _read_json(os.path.join(FALLBACK_DIR, "domains.json"))
    return db.get(domain, {"risk":"unknown","tags":["no_local_match"],"sources":["fallback"]})

def fallback_ip(ip: str):
    db = _read_json(os.path.join(FALLBACK_DIR, "ips.json"))
    return db.get(ip, {"risk":"unknown","tags":["no_local_match"],"sources":["fallback"]})

def fallback_email(email: str):
    db = _read_json(os.path.join(FALLBACK_DIR, "emails.json"))
    return db.get(email, {"risk":"unknown","tags":["no_local_match"],"sources":["fallback"]})

# ---- Public blocklist quick check (OpenPhish raw list) ----
def openphish_check(domain_or_url: str):
    # Lightweight: fetch once per run (optional). To keep it stable, skip live call if no internet.
    try:
        r = requests.get("https://openphish.com/feed.txt", timeout=5)
        if r.status_code == 200:
            lines = r.text.splitlines()
            hit = any(domain_or_url in line for line in lines[:1000])  # cap lines to be fast
            return {"source":"openphish","used_fallback":False,"listed":bool(hit)}
        return {"source":"openphish","used_fallback":True,"error":f"status_{r.status_code}"}
    except Exception as e:
        return {"source":"openphish","used_fallback":True,"error":str(e)}

# ---- Dispatcher ----

def classify_entity_for_osint(entity: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    etype = entity.get("type","").lower()
    val = entity.get("value","")
    # We only OSINT-check: email, url, domain, ip
    if etype == "email":
        m = EMAIL_RE.search(val)
        if not m: return None
        domain = m.group(1)
        return {"kind":"email","value":val,"domain":domain}
    if etype == "url":
        m = URL_RE.search(val)
        if not m: return None
        domain = m.group(1)
        return {"kind":"url","value":val,"domain":domain}
    if etype in ("domain","host"):
        return {"kind":"domain","value":val,"domain":val}
    if etype in ("ip","ipv4"):
        if IP_RE.search(val):
            return {"kind":"ip","value":val}
    return None

def enrich_entity_osint(entity: Dict[str, Any]) -> Dict[str, Any]:
    info = classify_entity_for_osint(entity)
    if not info:
        return {"value": entity.get("value"), "type": entity.get("type"), "osint": None}

    kind = info["kind"]
    out = {"value": entity.get("value"), "type": entity.get("type"), "osint": {}, "fallback_used": False}

    if kind == "email":
        domain = info["domain"]
        vt = vt_domain_report(domain)
        wh = whois_domain(domain)
        op = openphish_check(domain)
        out["osint"] = {"virustotal": vt, "whois": wh, "openphish": op}
        out["fallback_used"] = any(x.get("used_fallback") for x in [vt,wh,op])
        if out["fallback_used"]:
            out["fallback"] = {"email": fallback_email(info["value"]), "domain": fallback_domain(domain)}
        return out

    if kind == "url":
        domain = info["domain"]
        vt_u = vt_url_report(info["value"])
        vt_d = vt_domain_report(domain)
        wh = whois_domain(domain)
        op = openphish_check(info["value"])
        out["osint"] = {"virustotal_url": vt_u, "virustotal_domain": vt_d, "whois": wh, "openphish": op}
        out["fallback_used"] = any(x.get("used_fallback") for x in [vt_u,vt_d,wh,op])
        if out["fallback_used"]:
            out["fallback"] = {"domain": fallback_domain(domain)}
        return out

    if kind == "domain":
        domain = info["domain"]
        vt = vt_domain_report(domain)
        wh = whois_domain(domain)
        op = openphish_check(domain)
        out["osint"] = {"virustotal": vt, "whois": wh, "openphish": op}
        out["fallback_used"] = any(x.get("used_fallback") for x in [vt,wh,op])
        if out["fallback_used"]:
            out["fallback"] = {"domain": fallback_domain(domain)}
        return out

    if kind == "ip":
        ip = info["value"]
        ab = abuseipdb_report(ip)
        out["osint"] = {"abuseipdb": ab}
        out["fallback_used"] = ab.get("used_fallback", False)
        if out["fallback_used"]:
            out["fallback"] = {"ip": fallback_ip(ip)}
        return out

    return out
