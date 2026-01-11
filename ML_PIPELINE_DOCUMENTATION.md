# 🤖 SatyaSetu.AI ML Models & AI Pipeline Documentation

> **Complete Technical Guide to Machine Learning and NLP Systems in SatyaSetu.AI**

This document provides an in-depth technical overview of all machine learning models, NLP pipelines, and AI-powered analysis systems used in the SatyaSetu.AI platform.

---

## 📊 Table of Contents

1. [System Architecture](#system-architecture)
2. [Pipeline Overview](#pipeline-overview)
3. [Fraud Detection Model (XGBoost)](#fraud-detection-model-xgboost)
4. [Scam Classifier (Hybrid ML)](#scam-classifier-hybrid-ml)
5. [Named Entity Recognition (NER)](#named-entity-recognition-ner)
6. [OCR Pipeline](#ocr-pipeline)
7. [OSINT Engine](#osint-engine)
8. [Risk Assessment Engine](#risk-assessment-engine)
9. [Model Files Reference](#model-files-reference)

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           SatyaSetu.AI PIPELINE                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   📤 INPUT                                                                       │
│   ├── Images (JPG, PNG, WEBP)                                                    │
│   ├── PDFs (Scanned documents)                                                   │
│   └── Contract Data (JSON)                                                       │
│                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────┐  │
│   │                        STAGE 1: TEXT EXTRACTION                          │  │
│   │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────┐   │  │
│   │  │   Tesseract     │    │    PyMuPDF      │    │   OpenCV            │   │  │
│   │  │   OCR Engine    │ +  │   PDF Parser    │ +  │   Preprocessing     │   │  │
│   │  │                 │    │                 │    │   (Adaptive)        │   │  │
│   │  └─────────────────┘    └─────────────────┘    └─────────────────────┘   │  │
│   └──────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                           │
│   ┌──────────────────────────────────────────────────────────────────────────┐  │
│   │                        STAGE 2: ENTITY EXTRACTION                        │  │
│   │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────┐   │  │
│   │  │   spaCy NER     │    │   Regex Engine  │    │   URL/QR Scanner    │   │  │
│   │  │  (en_core_web_  │ +  │  (UPI, Crypto,  │ +  │   (pyzbar)          │   │  │
│   │  │   sm)           │    │   Phone, Email) │    │                     │   │  │
│   │  └─────────────────┘    └─────────────────┘    └─────────────────────┘   │  │
│   └──────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                           │
│   ┌──────────────────────────────────────────────────────────────────────────┐  │
│   │                        STAGE 3: CLASSIFICATION                           │  │
│   │  ┌─────────────────────────────────────────────────────────────────────┐ │  │
│   │  │                    HYBRID SCAM CLASSIFIER                           │ │  │
│   │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │ │  │
│   │  │  │  TF-IDF +   │  │ Sentence-   │  │  Keyword    │  │ Sentiment  │  │ │  │
│   │  │  │  Logistic   │ +│ BERT        │ +│  Heuristics │ +│ Analysis   │  │ │  │
│   │  │  │  Regression │  │ (MiniLM)    │  │             │  │ (TextBlob) │  │ │  │
│   │  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │ │  │
│   │  │                           ↓                                          │ │  │
│   │  │              Weighted Confidence Fusion (50%/30%/20%)                │ │  │
│   │  └─────────────────────────────────────────────────────────────────────┘ │  │
│   └──────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                           │
│   ┌──────────────────────────────────────────────────────────────────────────┐  │
│   │                        STAGE 4: OSINT ENRICHMENT                         │  │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │  │
│   │  │ VirusTotal  │  │ AbuseIPDB   │  │ WHOIS API   │  │ OpenPhish       │  │  │
│   │  │ Domain/URL  │  │ IP Lookup   │  │ Domain Age  │  │ Phishing Feed   │  │  │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘  │  │
│   └──────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                           │
│   ┌──────────────────────────────────────────────────────────────────────────┐  │
│   │                        STAGE 5: RISK FUSION                              │  │
│   │  ┌─────────────────────────────────────────────────────────────────────┐ │  │
│   │  │              MULTI-FACTOR RISK ASSESSMENT ENGINE                    │ │  │
│   │  │                                                                     │ │  │
│   │  │   Factors:                                                          │ │  │
│   │  │   • Scam Classifier Confidence (40%)                                │ │  │
│   │  │   • Entity Risk Score (25%)                                         │ │  │
│   │  │   • Keyword Toxicity (15%)                                          │ │  │
│   │  │   • OSINT Intelligence (10%)                                        │ │  │
│   │  │   • Sentiment Neutrality (5%)                                       │ │  │
│   │  │   • Deceptive Tone Score (5%)                                       │ │  │
│   │  └─────────────────────────────────────────────────────────────────────┘ │  │
│   └──────────────────────────────────────────────────────────────────────────┘  │
│                                      ↓                                           │
│   📊 OUTPUT: Risk Level (LOW 🟢 / MEDIUM 🟠 / HIGH 🔴) + Explainable Rationale  │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Pipeline Overview

| Stage | Module | Technology | Purpose |
|-------|--------|------------|---------|
| 1 | `ocr.py` | Tesseract + PyMuPDF | Extract text from images/PDFs |
| 2a | `ner.py` | spaCy (en_core_web_sm) | Named Entity Recognition |
| 2b | `regex_extract.py` | Python regex | Extract UPI, crypto, phone, email |
| 2c | `url_qr_scanner.py` | pyzbar + regex | URL/QR code extraction |
| 3 | `scam_classifier.py` | TF-IDF + SBERT + Heuristics | Scam type classification |
| 4 | `osint_engine.py` | VirusTotal, AbuseIPDB, WHOIS | Threat intelligence |
| 5 | `risk_assessor.py` | Multi-factor fusion | Final risk scoring |
| 6 | `fraud_predict.py` | XGBoost | Procurement fraud prediction |

---

## 🚨 Fraud Detection Model (XGBoost)

### Overview

The **fraud detection model** is designed to predict corruption risk in public procurement contracts. It outputs a **Corruption Risk Indicator (CRI)** score between 0 and 1.

### Training Data

| Property | Value |
|----------|-------|
| **Source** | [Digiwhist / OpenTender EU](https://opentender.eu/download) |
| **Dataset** | Romania 2023 Public Procurement |
| **Records** | 1.8M+ contracts |
| **Time Period** | 2007-2023 |
| **Target Variable** | `cri_ro` (Composite Risk Indicator) |

### Model Specifications

| Specification | Value |
|--------------|-------|
| **Algorithm** | XGBoost Regressor |
| **Hyperparameters** | `n_estimators=200, max_depth=6, learning_rate=0.1, subsample=0.8, colsample_bytree=0.8` |
| **Training Split** | 80% train / 20% test |
| **Validation** | Cross-validated on Belgium data |

### Model Performance

| Metric | Training | Test |
|--------|----------|------|
| **R² Score** | 0.76 | **0.74** |
| **RMSE** | 0.091 | 0.098 |
| **MAE** | 0.072 | 0.079 |

### Feature Engineering

The model uses **17 engineered features** derived from raw contract data:

#### Core Numeric Features
| Feature | Description | Importance |
|---------|-------------|------------|
| `tender_finalprice` | Final awarded contract value | High |
| `tender_estimatedprice` | Initial estimated value | High |
| `tender_recordedbidscount` | Number of bidders | High |
| `price_efficiency` | `final_price / estimated_price` | Very High |

#### Binary Fraud Signal Features
| Feature | Description | Fraud Signal |
|---------|-------------|--------------|
| `is_round_1000` | 1 if final price divisible by 1000 | Round Number Trap |
| `single_bidder_proxy` | 1 if only 1 bidder | Bid Rigging |
| `is_medium_title` | 1 if title length 100-200 chars | Normal |
| `is_sunday` | 1 if awarded on Sunday | Unusual Timing |
| `is_december` | 1 if awarded in December | Budget Rush |

#### Temporal Features
| Feature | Description |
|---------|-------------|
| `month` | Month of contract award (1-12) |
| `title_length` | Character count of contract title |
| `winner_dominance` | Market share of winning contractor |

#### Target-Encoded Features
| Feature | Description |
|---------|-------------|
| `buyer_encoded` | Target-encoded buyer organization |
| `winner_encoded` | Target-encoded winning company |
| `cpv_encoded` | Target-encoded procurement category |

### Rule-Based Fraud Signals

In addition to ML predictions, the system detects heuristic fraud patterns:

```python
FRAUD_SIGNALS = {
    "🚩 Round Number Trap": "Final price divisible by 1000 (e.g., 500,000)",
    "🚩 Single Bidder": "Only 1 bidder participated (bid rigging indicator)",
    "🚩 Vague Title": "Contract title too short (<30 characters)",
    "🚩 Cost Overrun": "Final price exceeds estimate by >5%",
    "🚩 Sunday Award": "Contract awarded on Sunday (unusual)",
    "🚩 December Rush": "Year-end budget spending rush"
}
```

### Risk Level Thresholds

| CRI Score | Risk Level | Color | Recommended Action |
|-----------|------------|-------|-------------------|
| ≥ 0.70 | CRITICAL | 🔴 | Immediate investigation required |
| ≥ 0.50 | HIGH | 🟠 | Detailed audit recommended |
| ≥ 0.30 | MODERATE | 🟡 | Enhanced monitoring advised |
| < 0.30 | LOW | 🟢 | Standard oversight sufficient |

### API Usage

```bash
POST /api/fraud-predict
Content-Type: application/json

{
  "name": "Road Construction Phase 1",
  "department": "Ministry of Transport",
  "estimated_price": 500000,
  "final_price": 550000,
  "bidders": 1,
  "award_month": 12,
  "is_sunday": false,
  "is_december": true
}
```

### Model Files

| File | Size | Description |
|------|------|-------------|
| `fraud_detection_model.pkl` | 2.2 MB | Trained XGBoost model |
| `model_feature_columns.pkl` | 255 B | Feature column names |
| `target_encoders.pkl` | 4.4 MB | Target encoding mappings |

---

## 🎯 Scam Classifier (Hybrid ML)

### Architecture

The scam classifier uses a **three-tier hybrid approach** combining ML, deep learning, and heuristics:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      HYBRID SCAM CLASSIFIER                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────┐    ┌───────────────────┐    ┌─────────────────┐ │
│  │   TIER 1: ML      │    │  TIER 2: SEMANTIC │    │ TIER 3: RULES   │ │
│  │                   │    │                   │    │                 │ │
│  │  TF-IDF (2000)    │    │  Sentence-BERT    │    │  Keyword Match  │ │
│  │       +           │    │  (MiniLM-L6-v2)   │    │       +         │ │
│  │  Logistic Reg.    │    │       +           │    │  Tone Detection │ │
│  │                   │    │  Cosine Similarity│    │                 │ │
│  └───────────────────┘    └───────────────────┘    └─────────────────┘ │
│          ↓                        ↓                        ↓            │
│       50% weight              30% weight               20% weight       │
│          └─────────────────────────┴────────────────────────┘           │
│                                 ↓                                       │
│                    WEIGHTED CONFIDENCE FUSION                           │
│                                 ↓                                       │
│                  Final Category + Confidence Score                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Scam Categories

| Category | Keywords | Examples |
|----------|----------|----------|
| **Fake Bank / Financial Fraud** | bank, upi, payment, verify, transfer | KYC scams, fake OTP requests |
| **Lottery / Prize Scam** | lottery, prize, claim, winner, gift | Fake prize notifications |
| **Tech Support Scam** | support, microsoft, windows, virus | Fake virus alerts |
| **Fake Job / Recruitment** | job, resume, salary, work from home | Employment scams |
| **Investment / Crypto Scam** | crypto, bitcoin, investment, profit | Ponzi schemes |
| **Romance / Relationship** | love, darling, sweetheart, gift card | Dating scams |

### Components

#### 1. TF-IDF + Logistic Regression (50% weight)

```python
# Configuration
vectorizer = TfidfVectorizer(stop_words="english", max_features=2000)
model = LogisticRegression(max_iter=1000)
```

- Trained on labeled scam examples
- Fast inference, interpretable
- Good baseline accuracy

#### 2. Sentence-BERT Semantic Matching (30% weight)

```python
# Model: sentence-transformers/all-MiniLM-L6-v2
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Semantic category definitions
embeddings_db = {
    "Fake Bank": "bank account blocked refund transfer verify payment...",
    "Lottery Scam": "lottery prize claim reward congratulations winner...",
    # ... more categories
}

# Cosine similarity matching
similarity = util.cos_sim(text_embedding, category_embedding)
```

- Deep semantic understanding
- Handles paraphrasing and synonyms
- 384-dimensional embeddings

#### 3. Keyword + Tone Heuristics (20% weight)

```python
# Urgency detection
urgent_words = ["urgent", "immediately", "verify", "blocked", "action required"]

# Financial context
financial_words = ["bank", "upi", "payment", "account", "transfer", "crypto"]

# Reward bait
reward_words = ["prize", "winner", "reward", "claim", "offer"]
```

### Confidence Fusion Formula

```python
final_confidence = (
    ml_confidence * 0.50 +
    semantic_confidence * 0.30 +
    heuristic_confidence * 0.20 +
    tone_factor * 0.10  # adjustment
)
```

### Model Files

| File | Size | Description |
|------|------|-------------|
| `scam_classifier.pkl` | 3.1 KB | Trained Logistic Regression |
| `tfidf_vectorizer.pkl` | 2.1 KB | TF-IDF Vectorizer |

---

## 🧠 Named Entity Recognition (NER)

### Model

| Property | Value |
|----------|-------|
| **Library** | spaCy 3.7+ |
| **Model** | `en_core_web_sm` |
| **Size** | ~13 MB |
| **Pipeline** | tok2vec, tagger, parser, ner, lemmatizer |

### Entity Types Extracted

| Entity Type | Description | Example |
|-------------|-------------|---------|
| `PERSON` | Person names | "Rahul Sharma" |
| `ORG` | Organizations | "ICICI Bank", "Paytm" |
| `GPE` | Locations | "Mumbai", "India" |
| `PRODUCT` | Products/Services | "Google Pay" |
| `EVENT` | Events | "Annual Sale" |

### Confidence Scoring

```python
# Base confidence
confidence = 0.6

# Boost for capitalized ORG names
if entity.label_ == "ORG" and any(t.is_upper for t in entity):
    confidence += 0.2

# Boost for multi-word entities
if len(entity.text.split()) > 1:
    confidence += 0.1

# Max confidence = 1.0
```

### Deduplication

Entities are deduplicated by normalized form (lowercase, trimmed), keeping the highest confidence instance.

---

## 📄 OCR Pipeline

### Processing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      OCR PIPELINE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   INPUT FILE                                                    │
│       │                                                         │
│       ├── Is PDF? ──────────────────┐                           │
│       │                             ↓                           │
│       │                    ┌─────────────────┐                  │
│       │                    │    PyMuPDF      │                  │
│       │                    │  Page Rasterize │                  │
│       │                    │   (300 DPI)     │                  │
│       │                    └─────────────────┘                  │
│       │                             ↓                           │
│       ├── Is Image? ─────→ ┌─────────────────┐                  │
│       │                    │  Preprocessing  │                  │
│       │                    │  • Grayscale    │                  │
│       │                    │  • Median Filter│                  │
│       │                    │  • Contrast x2  │                  │
│       │                    └─────────────────┘                  │
│       │                             ↓                           │
│       │                    ┌─────────────────┐                  │
│       │                    │   Tesseract     │                  │
│       │                    │   OCR Engine    │                  │
│       │                    └─────────────────┘                  │
│       │                             ↓                           │
│       │                    ┌─────────────────┐                  │
│       │             (if empty) OpenCV Fallback│                  │
│       │                    │  • Thresholding │                  │
│       │                    │  • OTSU Binarize│                  │
│       │                    └─────────────────┘                  │
│       ↓                             ↓                           │
│   EXTRACTED TEXT ←──────────────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Preprocessing Steps

| Step | Technique | Purpose |
|------|-----------|---------|
| 1 | Grayscale conversion | Reduce color noise |
| 2 | Median filter | Remove salt-and-pepper noise |
| 3 | Contrast enhancement (2x) | Improve text visibility |
| 4 | OTSU thresholding (fallback) | Binary image for poor quality |

---

## 🌐 OSINT Engine

### Data Sources

| Source | API | Data Provided | Rate Limit |
|--------|-----|---------------|------------|
| **VirusTotal** | `VT_API_KEY` | Domain/URL malware reports | 4 req/min (free) |
| **AbuseIPDB** | `ABUSEIPDB_KEY` | IP abuse reports | 1000 req/day |
| **WHOIS API** | `WHOIS_KEY` | Domain registration info | Varies |
| **OpenPhish** | Public feed | Phishing URL list | No limit |

### Entity Types Handled

| Entity Type | OSINT Sources Used |
|-------------|-------------------|
| Email | VirusTotal (domain), WHOIS, OpenPhish |
| URL | VirusTotal (URL + domain), OpenPhish |
| IP Address | AbuseIPDB |
| Domain | VirusTotal, WHOIS, OpenPhish |

### Aggregate Scoring

```python
# Score fusion for URLs
score = (
    virustotal_url_score +
    virustotal_domain_score
) / 2 + (openphish_listed * 20)

# Risk classification
if score >= 70: return "High"
if score >= 40: return "Medium"
return "Low"
```

### Caching

- **Cache TTL**: 24 hours
- **Storage**: JSON files with SHA-1 hash keys
- **Location**: `app/data/osint_cache/`

---

## ⚖️ Risk Assessment Engine

### Multi-Factor Fusion

The risk assessor combines signals from all pipeline stages:

```python
BASE_WEIGHTS = {
    "scam_conf": 0.40,        # Scam classifier confidence
    "entity_risk": 0.25,      # Average entity risk score
    "keyword_toxicity": 0.15, # High-risk keyword count
    "osint": 0.10,            # OSINT intelligence
    "sentiment": 0.05,        # Sentiment neutrality
    "tone": 0.05              # Deceptive tone patterns
}
```

### Dynamic Weight Adjustment

Weights are adjusted based on scam type:

| Scam Type | Weight Boost |
|-----------|--------------|
| Investment Scam | OSINT +5% |
| Phishing | Keyword Toxicity +5% |
| Loan Scam | Entity Risk +5% |

### High-Risk Keywords

```python
HIGH_RISK_KEYWORDS = [
    "urgent", "verify", "immediately", "transfer", "payment", "otp",
    "win", "claim", "refund", "block", "suspended", "update", "login"
]

MEDIUM_RISK_KEYWORDS = [
    "helpdesk", "support", "account", "service", "offer", "congratulations"
]
```

### Deceptive Tone Patterns

```python
DECEPTIVE_PATTERNS = [
    r"(act\s+now)",
    r"(limited\s+time)",
    r"(verify\s+account)",
    r"(update\s+details)",
    r"(click\s+here)",
    r"(avoid\s+suspension)"
]
```

### Final Risk Output

```python
{
    "score": 0.72,
    "risk_level": "HIGH 🔴",
    "rationale": "AI classified as Fake Bank Fraud (85% confidence); Suspicious entities detected",
    "timestamp": "2024-01-15T14:32:00",
    "factors": {
        "scam_confidence": 0.85,
        "avg_entity_risk": 0.45,
        "keyword_toxicity": 0.36,
        "tone_score": 0.30,
        "sentiment_neutrality": 0.92,
        "osint_weight": 0.20
    }
}
```

---

## 📁 Model Files Reference

| File Path | Model | Format | Size |
|-----------|-------|--------|------|
| `app/models/fraud_detection_model.pkl` | XGBoost Regressor | Pickle | 2.2 MB |
| `app/models/model_feature_columns.pkl` | Feature names | Pickle | 255 B |
| `app/models/target_encoders.pkl` | Target encodings | Pickle | 4.4 MB |
| `app/models/scam_classifier.pkl` | Logistic Regression | Pickle | 3.1 KB |
| `app/models/tfidf_vectorizer.pkl` | TF-IDF Vectorizer | Pickle | 2.1 KB |

### External Models (Downloaded at Runtime)

| Model | Source | Size | Purpose |
|-------|--------|------|---------|
| `en_core_web_sm` | spaCy | 13 MB | NER |
| `all-MiniLM-L6-v2` | Sentence-Transformers | 80 MB | Semantic embeddings |

---

## 📈 Performance Benchmarks

| Pipeline Stage | Avg. Latency | Notes |
|----------------|--------------|-------|
| OCR (image) | 1-3s | Depends on image size |
| OCR (PDF, 10 pages) | 10-15s | 300 DPI rendering |
| NER | <100ms | Lazy loaded |
| Scam Classifier | 200-500ms | SBERT embedding is slowest |
| OSINT (per entity) | 500ms-2s | With caching |
| Risk Assessment | <50ms | Pure computation |
| Fraud Prediction | <100ms | XGBoost inference |

---

## 🔒 Security Considerations

1. **API Keys**: Stored in environment variables, never in code
2. **Model Files**: Not version-controlled (added to `.gitignore`)
3. **OSINT Cache**: Expires after 24 hours
4. **Input Validation**: All inputs sanitized before processing

---

## 🚀 Future Improvements

- [ ] Fine-tune transformer model for scam detection
- [ ] Add multilingual OCR support
- [ ] Implement active learning for scam classifier
- [ ] Add graph neural network for fraud network detection
- [ ] Real-time model monitoring and drift detection

---

*Last Updated: January 2026*
