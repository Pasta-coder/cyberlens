# 🔍 SatyaSetu.AI

> **AI-Powered Digital Forensics & Fraud Detection Platform**

SatyaSetu.AI is an intelligent forensic analysis platform that combines OCR, NLP, OSINT, and Machine Learning to detect fraud patterns in digital evidence and public procurement contracts.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SatyaSetu.AI                                      │
├──────────────────────────────┬──────────────────────────────────────────────┤
│        FRONTEND              │               BACKEND (FastAPI)              │
│        (Next.js)             │                                              │
│                              │  ┌─────────────────────────────────────────┐ │
│  • Evidence Upload           │  │           AI PIPELINES                  │ │
│  • Case Dashboard            │  │                                         │ │
│  • Entity Intelligence       │  │  📄 OCR Engine (Tesseract + PyMuPDF)    │ │
│  • Fraud Prediction UI       │  │  🧠 NER (spaCy en_core_web_sm)          │ │
│  • Batch Analysis            │  │  🎯 Scam Classifier (TF-IDF + SBERT)    │ │
│  • Report Generation         │  │  🔗 URL/QR Scanner + OSINT              │ │
│                              │  │  ⚖️ Fraud Predictor (XGBoost)           │ │
│                              │  │  📊 Risk Assessor                       │ │
│                              │  └─────────────────────────────────────────┘ │
│                              │                                              │
│                              │  ┌─────────────────────────────────────────┐ │
│                              │  │           ML MODELS                     │ │
│                              │  │                                         │ │
│                              │  │  • fraud_detection_model.pkl (XGBoost)  │ │
│                              │  │  • scam_classifier.pkl (Logistic Reg)   │ │
│                              │  │  • tfidf_vectorizer.pkl                 │ │
│                              │  │  • target_encoders.pkl                  │ │
│                              │  └─────────────────────────────────────────┘ │
└──────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 🚀 Features

### 📄 Evidence Processing Pipeline
| Step | Module | Description |
|------|--------|-------------|
| 1 | **Upload Evidence** | Secure file upload with chain of custody logging |
| 2 | **OCR Engine** | Extract text from images/PDFs using Tesseract & PyMuPDF |
| 3 | **NER Extraction** | Identify entities (names, orgs, locations) using spaCy |
| 4 | **Scam Classification** | AI-powered scam detection with confidence scoring |
| 5 | **URL/QR Scanning** | Extract and analyze URLs with OSINT enrichment |
| 6 | **Risk Assessment** | Comprehensive threat scoring and recommendations |
| 7 | **Report Generation** | PDF forensic reports with all findings |

### ⚖️ Fraud Detection (Public Procurement)
AI-powered corruption risk prediction for government contracts.

---

## 🤖 Machine Learning Models

### 1. 🚨 Fraud Detection Model (XGBoost)

**Purpose:** Predict corruption risk in public procurement contracts

**Training Data:**
- **Source:** [Digiwhist Romania 2023](https://opentender.eu/download) (Open Contracting Data)
- **Size:** 1.8M+ public procurement contracts
- **Target Variable:** Composite Risk Indicator (CRI) — a score from 0-1

**Model Performance:**
| Metric | Value |
|--------|-------|
| R² Score | **0.74** |
| Test RMSE | 0.098 |
| Train RMSE | 0.091 |

**Key Features Used:**
| Feature | Description |
|---------|-------------|
| `tender_finalprice` | Final awarded contract value |
| `tender_estimatedprice` | Initial estimated value |
| `tender_recordedbidscount` | Number of bidders |
| `price_efficiency` | Ratio: final_price / estimated_price |
| `is_round_1000` | Flag if final price is divisible by 1000 |
| `single_bidder_proxy` | Flag if only 1 bidder participated |
| `title_length` | Length of contract title |
| `is_medium_title` | Flag if title is 100-200 characters |
| `is_sunday` | Flag if awarded on Sunday |
| `is_december` | Flag if awarded in December |
| `buyer_encoded` | Target-encoded buyer organization |
| `winner_encoded` | Target-encoded winning company |

**Rule-Based Fraud Signals:**
```
🚩 Round Number Trap    — Final price divisible by 1000
🚩 Single Bidder        — Only one bidder (bid rigging indicator)
🚩 Vague Title          — Contract title too short (<30 chars)
🚩 Cost Overrun         — Final price exceeds estimate by >5%
🚩 Sunday Award         — Unusual timing (awarded on Sunday)
🚩 December Rush        — Year-end budget spending rush
```

**Risk Levels:**
| CRI Score | Level | Action |
|-----------|-------|--------|
| ≥ 0.70 | 🔴 CRITICAL | Immediate investigation required |
| ≥ 0.50 | 🟠 HIGH | Detailed audit recommended |
| ≥ 0.30 | 🟡 MODERATE | Enhanced monitoring advised |
| < 0.30 | 🟢 LOW | Standard oversight sufficient |

---

### 2. 🎯 Scam Classifier

**Purpose:** Classify text evidence as potential scam/fraud

**Architecture:** Hybrid approach combining:
- **TF-IDF Vectorizer** — Text feature extraction
- **Logistic Regression** — Primary classifier
- **Sentence-BERT** — Semantic similarity matching to known scam patterns

**Scam Categories Detected:**
- Phishing / Fake Bank Emails
- KYC Verification Scams
- Lottery/Prize Scams
- Investment Fraud
- Tech Support Scams
- Romance Scams

---

## 📂 Project Structure

```
SatyaSeth.AI/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/               # API Routes
│   │   │   ├── upload_evidence.py
│   │   │   ├── analyze.py
│   │   │   ├── fraud_predict.py   # 🚨 Fraud Detection API
│   │   │   ├── report.py
│   │   │   ├── batch_analyze.py
│   │   │   └── threat_hub.py
│   │   ├── pipelines/         # AI Processing Pipelines
│   │   │   ├── ocr.py             # Tesseract + PyMuPDF
│   │   │   ├── ner.py             # spaCy NER
│   │   │   ├── scam_classifier.py # ML Scam Detection
│   │   │   ├── url_qr_scanner.py  # URL/QR Extraction
│   │   │   ├── osint_engine.py    # OSINT Lookups
│   │   │   ├── risk_assessor.py   # Risk Scoring
│   │   │   └── report_generator.py
│   │   ├── models/            # Trained ML Models
│   │   │   ├── fraud_detection_model.pkl  # XGBoost (Romania)
│   │   │   ├── scam_classifier.pkl
│   │   │   ├── tfidf_vectorizer.pkl
│   │   │   └── target_encoders.pkl
│   │   └── main.py            # FastAPI App Entry
│   ├── Dockerfile
│   └── requirements.txt
│
├── webapp/                    # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── fraud-predict/    # Fraud Prediction UI
│   │   │   ├── entities/         # Entity Intelligence
│   │   │   └── ...
│   │   └── lib/
│   │       └── api.ts            # API Client
│   └── package.json
│
└── docker-compose.yml
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React, TailwindCSS, Framer Motion |
| **Backend** | FastAPI, Python 3.10, Uvicorn |
| **ML/AI** | XGBoost, scikit-learn, spaCy, Sentence-Transformers |
| **OCR** | Tesseract, PyMuPDF |
| **Database** | File-based (JSON/Pickle for MVP) |
| **Deployment** | Docker, Render |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker (optional)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Run server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd webapp

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api" > .env.local

# Run development server
npm run dev
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build
```

---

## 📡 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload-evidence` | Upload evidence files |
| POST | `/api/analyze` | Full forensic analysis |
| GET | `/api/report/{file_id}` | Generate PDF report |

### Fraud Detection Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/fraud-predict` | Predict single contract risk |
| POST | `/api/fraud-predict/batch` | Batch contract analysis |
| GET | `/api/fraud-predict/model-info` | Model metadata |

### Example: Fraud Prediction Request

```bash
curl -X POST "http://localhost:8000/api/fraud-predict" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Road Construction Phase 1",
    "department": "Ministry of Transport",
    "estimated_price": 500000,
    "final_price": 550000,
    "bidders": 1,
    "award_month": 12,
    "is_sunday": false,
    "is_december": true
  }'
```

---

## 📊 Model Training (Fraud Detection)

The fraud detection model was trained on public procurement data:

```python
# Training notebook: notebooks/fraud_detection_training.ipynb

# Data source
data = pd.read_csv("data-romania-2023.csv")  # 1.8M+ contracts

# Target variable
# Composite Risk Indicator (CRI) — combines multiple red flags

# Model: XGBoost Regressor
model = XGBRegressor(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8
)

# Cross-validated on Belgium data for generalization
```

---

## 🔒 Security Notes

- CORS configured for specific origins in production
- File uploads validated and sanitized
- Chain of custody logging for evidence
- No sensitive data stored in version control

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **Digiwhist / OpenTender** — Public procurement data
- **spaCy** — NLP pipeline
- **XGBoost** — Gradient boosting framework
- **FastAPI** — Modern Python web framework

