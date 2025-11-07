import re

def domain_from_email(email):
    match = re.search(r'@([\w.-]+)', email)
    return match.group(1) if match else None

def calculate_risk(entity):
    """
    Lightweight heuristic-based risk scoring.
    Replace with real OSINT APIs in Week 5.
    """
    value = entity["value"].lower()
    score = 0
    tags = []

    # 1. Suspicious TLDs
    if any(tld in value for tld in [".xyz", ".top", ".tk", ".pw", ".club", ".cf"]):
        score += 20
        tags.append("suspicious_tld")

    # 2. Phishing language
    if any(k in value for k in ["verify", "kyc", "update", "secure", "account", "review"]):
        score += 25
        tags.append("phishing_keyword")

    # 3. Email domain reputation
    if entity["type"] == "email":
        domain = domain_from_email(value)
        if domain and not any(ok in domain for ok in ["americanexpress", "amazon", "gov", "edu", "bank"]):
            score += 30
            tags.append("unverified_domain")

    # 4. Foreign .cl or .ru emails frequently used in scams
    if ".cl" in value or ".ru" in value:
        score += 15
        tags.append("foreign_domain")

    # Final normalization
    score = min(score, 100)

    if score >= 70:
        risk_level = "High"
    elif score >= 40:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "entity": entity["value"],
        "type": entity["type"],
        "risk_score": score,
        "risk_level": risk_level,
        "tags": tags
    }
