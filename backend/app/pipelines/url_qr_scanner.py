"""
SatyaSetu.AI URL & QR Threat Scanner v3
-----------------------------------
✅ Extract URLs from OCR text
✅ Decode QR codes from uploaded images
✅ Run heuristic + OSINT risk analysis
✅ Integrates with app/pipelines/osint_engine.py
"""

import re
import os
from typing import List, Dict
from urllib.parse import urlparse

# Import your OSINT functions
from app.pipelines.osint_engine import (
    vt_domain_report,
    vt_url_report,
    whois_domain,
    openphish_check,
    fallback_domain
)

# -------------------------------
# 🧩 Threat Intelligence (Local Fallback)
# -------------------------------
MALICIOUS_DOMAINS = {
    "phishingsite.com": "Confirmed phishing campaign",
    "upibanksecure.xyz": "Fake UPI banking portal",
    "lotterywin.top": "Lottery / prize scam",
    "freemoney.click": "Investment fraud portal",
    "fraudportal.tk": "Credential harvesting site",
    "kycupdate.cf": "Fake KYC scam domain",
}

SUSPICIOUS_TLDS = [".xyz", ".top", ".tk", ".pw", ".cf", ".club", ".icu", ".zip", ".mov"]
PHISHING_KEYWORDS = ["verify", "kyc", "login", "secure", "update", "bank", "account", "payment", "refund", "click"]


# -------------------------------
# 🔍 URL Extraction
# -------------------------------
def extract_urls(text: str) -> List[str]:
    if not text:
        return []
    pattern = re.compile(r"(https?://[^\s]+)")
    return list(set(re.findall(pattern, text)))


# -------------------------------
# 🧠 Heuristic Risk Analyzer
# -------------------------------
def heuristic_url_risk(url: str) -> Dict:
    parsed = urlparse(url)
    hostname = parsed.netloc.lower()
    risk_score = 0
    tags = []

    if any(hostname.endswith(tld) for tld in SUSPICIOUS_TLDS):
        risk_score += 30
        tags.append("suspicious_tld")

    if any(bad in hostname for bad in MALICIOUS_DOMAINS):
        risk_score += 50
        tags.append("known_malicious_domain")

    if any(k in url.lower() for k in PHISHING_KEYWORDS):
        risk_score += 20
        tags.append("phishing_keyword")

    if not url.lower().startswith("https://"):
        risk_score += 10
        tags.append("no_https")

    risk_score = min(100, risk_score)
    risk_level = "High" if risk_score >= 70 else "Medium" if risk_score >= 40 else "Low"

    return {
        "url": url,
        "domain": hostname,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "tags": tags,
        "note": MALICIOUS_DOMAINS.get(hostname, "N/A"),
    }


# -------------------------------
# 📸 QR Code Extraction (LAZY LOADED)
# -------------------------------
def extract_qr_codes(image_path: str) -> List[str]:
    try:
        # ⚠️ IMPORT HERE ONLY WHEN NEEDED
        import cv2
        from pyzbar.pyzbar import decode as qr_decode

        img = cv2.imread(image_path)
        if img is None:
            return []

        decoded = qr_decode(img)
        return [obj.data.decode("utf-8") for obj in decoded if obj.data]
    except ImportError:
        print("[QR Scanner] OpenCV/Pyzbar not installed or not found.")
        return []
    except Exception as e:
        print(f"[QR Scanner] Error: {e}")
        return []


# -------------------------------
# 🌐 OSINT Enrichment
# -------------------------------
def osint_enrich(domain_or_url: str) -> Dict:
    try:
        parsed = urlparse(domain_or_url)
        domain = parsed.netloc or domain_or_url

        vt_d = vt_domain_report(domain)
        vt_u = vt_url_report(domain_or_url)
        whois_info = whois_domain(domain)
        openphish_info = openphish_check(domain)
        fallback_info = fallback_domain(domain)

        osint_data = {
            "virustotal_domain": vt_d,
            "virustotal_url": vt_u,
            "whois": whois_info,
            "openphish": openphish_info,
            "fallback": fallback_info,
        }
        return osint_data
    except Exception as e:
        return {"error": f"OSINT enrichment failed: {str(e)}"}


# -------------------------------
# ⚙️ Combined Scanner
# -------------------------------
def scan_urls_and_qr(text: str, image_path: str) -> List[Dict]:
    urls = extract_urls(text or "")
    # Only try extracting QR if image path is provided
    qr_links = extract_qr_codes(image_path) if image_path else []

    all_links = list(set(urls + qr_links))
    if not all_links:
        return []

    results = []
    for link in all_links:
        heuristics = heuristic_url_risk(link)
        osint = osint_enrich(link)

        final_risk = heuristics["risk_score"]
        if isinstance(osint, dict):
            vt_domain_risk = osint.get("virustotal_domain", {}).get("risk", "Low")
            if vt_domain_risk == "High":
                final_risk = min(100, final_risk + 20)

        risk_level = "High" if final_risk >= 70 else "Medium" if final_risk >= 40 else "Low"

        results.append({
            "url": link,
            "domain": heuristics["domain"],
            "combined_risk": final_risk,
            "risk_level": risk_level,
            "heuristics": heuristics,
            "osint": osint,
        })

    return results