"""
🤖 SatyaSetu AI Copilot — Bilingual Investigation Assistant
Powered by Groq (Llama 3) with live database context.

Capabilities:
  1. Dashboard-aware investigations (Fiscal/Procurement/Welfare)
  2. Bilingual responses (English + Hindi)
  3. Anomaly explanation (Benford's Law, threshold gaming)
  4. Transaction lookup & department risk analysis
  5. Policy recommendations
  6. Methodology Q&A
"""

import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(tags=["AI Copilot"])

GROQ_API_KEY = os.getenv("Groq_api") or os.getenv("GROQ_API_KEY") or os.getenv("GROQ_API")

# ── System prompt — the "brain" of SatyaSetu ──────────────────────

SYSTEM_PROMPT = """You are **SatyaSetu AI** (सत्यसेतु AI), an expert AI Assistant for governance forensics and anti-corruption analysis. You are embedded in the SatyaSetu.AI platform — a production-grade tool for detecting anomalies in Indian government spending, procurement, and welfare delivery.

## Your Core Identity
- You are a **bilingual assistant** (English & Hindi). Respond in the same language the user writes in. If Hindi, use Devanagari script with natural Hindi.
- You are an **investigative copilot** — you help auditors, policymakers, and oversight bodies interpret data anomalies.
- You use **professional, policy-safe language**. Never accuse anyone of fraud. Use "statistical anomaly," "warrants review," "deviates from expected patterns."
- You are aware of the live database context provided below.

## Platform Knowledge

### 1. Fiscal Leakage Detection Dashboard
- Uses **Benford's Law** to analyze leading digit distribution of government spending
- Benford's Law: In natural datasets, digit 1 appears ~30.1%, digit 2 ~17.6%, digit 9 ~4.6%
- **MAD (Mean Absolute Deviation)**: < 0.006 = close conformity, 0.006-0.012 = acceptable, 0.012-0.015 = marginally acceptable, > 0.015 = non-conforming
- **Threshold Gaming**: Transactions clustering just below approval limits (₹50 Lakh requires higher sign-off, ₹1 Crore requires cabinet-level approval)
- **Current Data Context**: You have access to live database statistics provided as context

### 2. Procurement Intelligence Dashboard
- Analyzes government tenders for bid-rigging patterns
- **CRI (Corruption Risk Index)**: Score 0-1 based on single-bidding, price inflation, timing anomalies
- Key signals: single-bid contracts, Sunday/holiday awards, December rush, price deviation > 15%
- Network analysis reveals buyer-supplier collusion patterns

### 3. Welfare Delivery Forensics Dashboard
- Compares expected BPL beneficiaries vs actual enrollment
- Detects "ghost beneficiaries" — people who shouldn't be receiving benefits
- Gap analysis by district and scheme
- Cross-references Census/SECC data with active welfare rolls

## Response Style
- Be concise but informative (2-4 paragraphs max for simple questions)
- Use bullet points for lists
- Include specific numbers from context when available
- For Hindi: Use natural conversational Hindi, not overly formal
- Suggest follow-up investigation steps when relevant
- Always end complex analyses with "🔍 Recommended Next Steps"

## Important Rules
- NEVER fabricate data. If the context doesn't contain specific numbers, say so.
- NEVER make legal accusations. You are a decision-support tool.
- If asked about something outside governance/anti-corruption, politely redirect.
- If the user asks "what can you do?" — list your capabilities in a friendly way.
"""


# ── Data Models ───────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    language: Optional[str] = "auto"  # "en", "hi", or "auto"
    context_dashboard: Optional[str] = None  # "fiscal", "procurement", "welfare"


# ── Database Context Builder ──────────────────────────────────────

def _build_dashboard_context() -> str:
    """Pull live stats from the database for the AI to reason about."""
    from app.database import execute_query
    
    context_parts = []
    
    try:
        # Fiscal stats
        fiscal_stats = execute_query(
            "SELECT COUNT(*) as total, SUM(amount) as total_spend, AVG(amount) as avg_amount FROM fiscal_transactions",
            fetch_one=True
        )
        if fiscal_stats and fiscal_stats["total"] > 0:
            # Leading digit distribution
            digit_dist = execute_query("""
                SELECT LEFT(CAST(amount AS TEXT), 1) as digit, COUNT(*) as cnt
                FROM fiscal_transactions WHERE amount > 0
                GROUP BY LEFT(CAST(amount AS TEXT), 1)
                ORDER BY digit
            """)
            digit_str = ", ".join(
                f"Digit {d['digit']}: {d['cnt']} ({round(d['cnt']/fiscal_stats['total']*100,1)}%)"
                for d in digit_dist
            )
            
            # Threshold gaming
            near_50l = execute_query(
                "SELECT COUNT(*) as n FROM fiscal_transactions WHERE amount BETWEEN 4750000 AND 5000000",
                fetch_one=True
            )
            near_1cr = execute_query(
                "SELECT COUNT(*) as n FROM fiscal_transactions WHERE amount BETWEEN 9500000 AND 10000000",
                fetch_one=True
            )
            
            # Top departments
            top_depts = execute_query("""
                SELECT department, COUNT(*) as cnt, SUM(amount) as total_spend
                FROM fiscal_transactions GROUP BY department
                ORDER BY total_spend DESC LIMIT 5
            """)
            dept_str = "; ".join(
                f"{d['department']}: {d['cnt']} txns, ₹{d['total_spend']/10000000:.2f}Cr"
                for d in top_depts
            )
            
            # Top vendors by frequency
            top_vendors = execute_query("""
                SELECT vendor, COUNT(*) as cnt, SUM(amount) as total
                FROM fiscal_transactions WHERE vendor IS NOT NULL
                GROUP BY vendor ORDER BY cnt DESC LIMIT 5
            """)
            vendor_str = "; ".join(
                f"{v['vendor']}: {v['cnt']} contracts, ₹{v['total']/10000000:.2f}Cr"
                for v in top_vendors
            )
            
            context_parts.append(f"""
📊 FISCAL DASHBOARD (LIVE DATA):
- Total Transactions: {fiscal_stats['total']}
- Total Spend: ₹{fiscal_stats['total_spend']/10000000:.2f} Crore
- Average Transaction: ₹{fiscal_stats['avg_amount']/100000:.1f} Lakh
- Leading Digit Distribution: {digit_str}
- Threshold Gaming: {near_50l['n']} transactions near ₹50L limit, {near_1cr['n']} transactions near ₹1Cr limit
- Top Departments: {dept_str}
- Top Vendors: {vendor_str}
""")
    except Exception as e:
        context_parts.append(f"⚠️ Fiscal data unavailable: {str(e)[:100]}")
    
    try:
        # Procurement stats
        proc_stats = execute_query(
            "SELECT COUNT(*) as total, AVG(cri_score) as avg_cri, SUM(final_price) as total_spend FROM procurement_contracts",
            fetch_one=True
        )
        if proc_stats and proc_stats["total"] > 0:
            risk_dist = execute_query("""
                SELECT risk_level, COUNT(*) as cnt
                FROM procurement_contracts GROUP BY risk_level
            """)
            risk_str = ", ".join(f"{r['risk_level']}: {r['cnt']}" for r in risk_dist)
            
            single_bid = execute_query(
                "SELECT COUNT(*) as n FROM procurement_contracts WHERE bidders_count = 1",
                fetch_one=True
            )
            
            context_parts.append(f"""
🏗️ PROCUREMENT DASHBOARD (LIVE DATA):
- Total Contracts: {proc_stats['total']}
- Total Spend: ₹{proc_stats['total_spend']/10000000:.2f} Crore
- Average CRI Score: {proc_stats['avg_cri']:.3f}
- Risk Distribution: {risk_str}
- Single-Bid Contracts: {single_bid['n']} ({round(single_bid['n']/proc_stats['total']*100,1)}%)
""")
    except Exception as e:
        context_parts.append(f"⚠️ Procurement data unavailable: {str(e)[:100]}")
    
    try:
        # Welfare stats
        welfare_stats = execute_query(
            "SELECT COUNT(*) as districts, SUM(population_bpl) as expected, SUM(active_beneficiaries) as actual, SUM(gap) as total_gap FROM welfare_districts",
            fetch_one=True
        )
        if welfare_stats and welfare_stats["districts"] > 0:
            critical = execute_query(
                "SELECT COUNT(*) as n FROM welfare_districts WHERE risk_level = 'CRITICAL'",
                fetch_one=True
            )
            
            context_parts.append(f"""
🏥 WELFARE DASHBOARD (LIVE DATA):
- Districts Analyzed: {welfare_stats['districts']}
- Expected Beneficiaries (BPL): {welfare_stats['expected']:,}
- Actual Beneficiaries: {welfare_stats['actual']:,}
- Total Gap: {welfare_stats['total_gap']:,} excess enrollments
- Gap Percentage: {round(welfare_stats['total_gap']/welfare_stats['expected']*100,1) if welfare_stats['expected'] else 0}%
- Critical Districts: {critical['n']}
""")
    except Exception as e:
        context_parts.append(f"⚠️ Welfare data unavailable: {str(e)[:100]}")
    
    return "\n".join(context_parts) if context_parts else "No dashboard data currently available."


# ── Chat Endpoint ─────────────────────────────────────────────────

@router.post("/copilot/chat")
async def copilot_chat(request: ChatRequest):
    """🤖 Bilingual AI copilot for governance forensics investigation."""
    
    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="AI Copilot unavailable — GROQ_API_KEY not configured. Add 'Groq_api' to .env file."
        )
    
    try:
        from groq import Groq
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="Groq SDK not installed. Run: pip install groq"
        )
    
    # Build live database context
    db_context = _build_dashboard_context()
    
    # Construct system message with live context
    full_system = f"""{SYSTEM_PROMPT}

## LIVE DATABASE CONTEXT (as of this moment):
{db_context}
"""
    
    # Add language hint
    if request.language == "hi":
        full_system += "\n\n**LANGUAGE INSTRUCTION**: The user prefers Hindi. Respond in Hindi (Devanagari script). Use natural Hindi, not machine-translated."
    elif request.language == "en":
        full_system += "\n\n**LANGUAGE INSTRUCTION**: The user prefers English. Respond in English."
    
    # Build messages array
    messages = [{"role": "system", "content": full_system}]
    
    # Add conversation history (last 10 messages max)
    if request.history:
        for msg in request.history[-10:]:
            messages.append({"role": msg.role, "content": msg.content})
    
    # Add current user message
    messages.append({"role": "user", "content": request.message})
    
    # Call Groq API
    try:
        client = Groq(api_key=GROQ_API_KEY)
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.4,
            max_tokens=1500,
            top_p=0.9,
            stream=False,
        )
        
        assistant_message = completion.choices[0].message.content
        
        # Detect language of response
        has_hindi = any('\u0900' <= c <= '\u097F' for c in assistant_message)
        detected_language = "hi" if has_hindi else "en"
        
        return {
            "response": assistant_message,
            "language": detected_language,
            "model": "llama-3.3-70b-versatile",
            "tokens_used": {
                "prompt": completion.usage.prompt_tokens,
                "completion": completion.usage.completion_tokens,
                "total": completion.usage.total_tokens,
            },
        }
    
    except Exception as e:
        error_msg = str(e)
        if "rate_limit" in error_msg.lower() or "429" in error_msg:
            raise HTTPException(status_code=429, detail="Rate limit reached. Please try again in a few seconds.")
        raise HTTPException(status_code=500, detail=f"AI Copilot error: {error_msg[:200]}")


# ── Capabilities Endpoint ────────────────────────────────────────

@router.get("/copilot/capabilities")
async def copilot_capabilities():
    """📋 Return the AI Copilot's capabilities and status."""
    return {
        "status": "active" if GROQ_API_KEY else "inactive",
        "model": "llama-3.3-70b-versatile",
        "provider": "Groq",
        "languages": ["English", "Hindi (हिन्दी)"],
        "capabilities": [
            {
                "name": "Dashboard Investigation",
                "description": "Query live data from Fiscal, Procurement, and Welfare dashboards",
                "examples": [
                    "Which department has the highest spending?",
                    "कौन से विभाग में सबसे ज़्यादा खर्चा है?",
                ],
            },
            {
                "name": "Anomaly Explanation",
                "description": "Explain statistical anomalies detected by Benford's Law and threshold analysis",
                "examples": [
                    "Why is digit 4 flagged as anomalous?",
                    "बेनफोर्ड विश्लेषण क्या दिखाता है?",
                ],
            },
            {
                "name": "Risk Assessment",
                "description": "Evaluate corruption risk indicators for departments and vendors",
                "examples": [
                    "What does the CRI score mean for procurement?",
                    "Pinnacle Consulting Group के बारे में बताओ",
                ],
            },
            {
                "name": "Policy Recommendations",
                "description": "Suggest actionable next steps based on data findings",
                "examples": [
                    "What should we do about threshold gaming?",
                    "welfare gap को कम करने के लिए क्या करना चाहिए?",
                ],
            },
            {
                "name": "Methodology Q&A",
                "description": "Explain the statistical and forensic methods used in analysis",
                "examples": [
                    "How does Benford's Law work?",
                    "MAD score क्या है?",
                ],
            },
        ],
        "suggested_prompts": {
            "en": [
                "Give me a summary of all dashboards",
                "Which areas need immediate audit attention?",
                "Explain the threshold gaming pattern in fiscal data",
                "How many single-bid contracts were found?",
                "What are the key welfare delivery gaps?",
            ],
            "hi": [
                "सभी डैशबोर्ड का सारांश दो",
                "किन क्षेत्रों को तुरंत ऑडिट की ज़रूरत है?",
                "बजट डेटा में threshold gaming पैटर्न समझाओ",
                "कितने एकल बोली वाले ठेके मिले?",
                "कल्याण वितरण में मुख्य कमियाँ क्या हैं?",
            ],
        },
    }
