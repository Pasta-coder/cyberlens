from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# --- API Routers ---
from app.api.upload_evidence import router as upload_router         # Step 1: Upload Evidence
from app.api.analyze import router as analyze_router                 # Steps 2–4: OCR + NER + Classify + URL/QR
from app.api.report import router as report_router                   # Step 2: Single Case PDF Report
from app.api.threat_hub import router as intel_router              # Step 3: Real-time Threat Intelligence Hub
from app.api.batch_analyze import router as batch_router             # Step 5: Multi-File Batch Analyzer
from app.api.unified_report import router as unified_router          # Step 5: Unified Intelligence PDF Report
from app.api.fraud_predict import router as fraud_predict_router     # Step 6: Fraud Detection & Prediction
from app.api.admin import router as admin_router                      # Step 7: Admin Data Ingestion
from app.api.auth_routes import router as auth_router                 # 🔐 Authentication
from app.api.dashboards import router as dashboard_router             # 📊 Dashboard APIs
from app.api.copilot import router as copilot_router                   # 🤖 AI Copilot

# --- Initialize Auth ---
from app.auth import init_default_admin

# --- App Config ---
app = FastAPI(
    title="SatyaSetu.AI API",
    version="2.0",
    description="""
    🚀 **SatyaSetu.AI: AI-Powered Governance Forensics Platform**

    Core Features:
    • Evidence Upload & Chain of Custody
    • OCR + NER Entity Extraction
    • Scam Classifier (AI-powered)
    • OSINT + Risk Intelligence + URL/QR Detection
    • Threat Intelligence Hub (Fraud Cluster Detection)
    • Batch Analysis + Unified Reports
    • XGBoost Fraud Prediction (R²=0.74)
    • Fiscal Anomaly Detection (Benford's Law)
    • Procurement Intelligence Dashboard
    • Welfare Delivery Forensics
    • 🤖 Bilingual AI Copilot (Groq / Llama 3)
    • JWT-Protected Admin Console
    • PostgreSQL Database (Neon)
    """
)

# --- CORS for Frontend Integration ---
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://satyasetu-ai.onrender.com",
    "https://satayasetu-ai.onrender.com",
    "https://satyasetu-ai.vercel.app",
    "*",  # Allow all for hackathon demo
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Register API Routers ---
app.include_router(auth_router, prefix="/api")            # 🔐 /api/auth/login
app.include_router(dashboard_router, prefix="/api")       # 📊 /api/fiscal/dashboard, etc.
app.include_router(upload_router, prefix="/api")          # 🧩 /api/upload-evidence
app.include_router(analyze_router, prefix="/api")         # 🧠 /api/analyze
app.include_router(report_router, prefix="/api")          # 🧾 /api/report
app.include_router(intel_router, prefix="/api")           # 🕵️ /api/intel
app.include_router(batch_router, prefix="/api")           # 🧮 /api/batch-analyze
app.include_router(unified_router, prefix="/api")         # 📊 /api/unified-report
app.include_router(fraud_predict_router, prefix="/api")   # 🚨 /api/fraud-predict
app.include_router(admin_router, prefix="/api")           # 🛡️ /api/admin/ingest
app.include_router(copilot_router, prefix="/api")         # 🤖 /api/copilot/chat


# --- Startup Event ---
@app.on_event("startup")
async def startup():
    init_default_admin()
    print("🚀 SatyaSetu.AI v2.0 — All systems operational")


# --- Health Endpoint ---
@app.get("/")
def root():
    return {
        "status": "✅ SatyaSetu.AI backend active",
        "version": "2.0",
        "database": "PostgreSQL (Neon)",
        "modules_loaded": [
            "auth",
            "dashboards",
            "upload_evidence",
            "analyze",
            "report",
            "threat_intel",
            "batch_analyze",
            "unified_report",
            "fraud_predict",
            "admin_ingest",
        ],
    }
