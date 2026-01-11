"""
SatyaSeth.AI Hybrid Scam Classifier v2
-----------------------------------
Combines:
✅ ML (TF-IDF + Logistic Regression)
✅ Deep Embeddings (Sentence-BERT)
✅ Keyword + Tone Heuristics
✅ Explainable Fraud Signals
"""

import os
import re
import numpy as np
import joblib
import gc  # <--- CRITICAL IMPORT FOR MEMORY MANAGEMENT
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from textblob import TextBlob

# =========================
# ⚙️ CONFIGURATION
# =========================
MODEL_PATH = "app/models/scam_classifier.pkl"
VECTORIZER_PATH = "app/models/tfidf_vectorizer.pkl"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

SCAM_TYPES = [
    "Fake Bank / Financial Fraud",
    "Lottery / Prize Scam",
    "Tech Support Scam",
    "Fake Job / Recruitment Scam",
    "Investment / Crypto Scam",
    "Romance / Relationship Scam"
]

# =========================
# 🧩 BASE DATASET (COLD START)
# =========================
TRAIN_DATA = [
    ("Your account has been locked. Verify now.", "Fake Bank / Financial Fraud"),
    ("Dear user, you have won a cash prize! Click below to claim.", "Lottery / Prize Scam"),
    ("Call Microsoft Support immediately to fix security issue.", "Tech Support Scam"),
    ("Work from home jobs available! Pay registration fees to apply.", "Fake Job / Recruitment Scam"),
    ("Double your crypto in 3 days! Send bitcoin now.", "Investment / Crypto Scam"),
    ("I love you, please send me a gift card to meet.", "Romance / Relationship Scam"),
]

# =========================
# 🧠 UTILITIES
# =========================

def clean_text(text: str):
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def ensure_model_loaded():
    """If model not found, trains a minimal one."""
    if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
        print("⚙️ Training baseline scam classifier...")
        texts, labels = zip(*TRAIN_DATA)
        vectorizer = TfidfVectorizer(stop_words="english", max_features=2000)
        X = vectorizer.fit_transform(texts)
        model = LogisticRegression(max_iter=1000)
        model.fit(X, labels)
        os.makedirs("app/models", exist_ok=True)
        joblib.dump(model, MODEL_PATH)
        joblib.dump(vectorizer, VECTORIZER_PATH)


# =========================
# ⚡ CLASSIFICATION LOGIC
# =========================

def detect_urgency_and_financial_terms(text: str):
    """Detect scam-related tone features."""
    urgent_words = ["urgent", "immediately", "verify", "blocked", "update", "alert", "action required"]
    financial_words = ["bank", "upi", "payment", "account", "transfer", "refund", "investment", "loan", "crypto"]
    reward_words = ["prize", "winner", "reward", "claim", "offer"]

    urgency = sum(1 for w in urgent_words if w in text)
    financial = sum(1 for w in financial_words if w in text)
    reward = sum(1 for w in reward_words if w in text)

    tone_factor = min(1.0, (urgency * 0.1) + (financial * 0.1) + (reward * 0.05))
    return {
        "urgency_score": round(urgency / 3, 2),
        "financial_score": round(financial / 4, 2),
        "reward_score": round(reward / 3, 2),
        "tone_factor": tone_factor
    }


def classify_scam(text: str):
    """Perform hybrid AI + semantic + heuristic classification."""

    # ⚠️ Initialize variables to None so we can safely delete them in 'finally'
    model = None
    vectorizer = None
    embedder = None

    try:
        text_clean = clean_text(text)
        if not text_clean:
            return {"category": "Unclassified", "confidence": 0.0, "keywords": []}

        # --- LOAD RESOURCES LOCALLY (PREVENTS GLOBAL MEMORY LEAKS) ---
        print("⏳ Loading Scam Models...")
        ensure_model_loaded()

        # Load lightweight ML models
        model = joblib.load(MODEL_PATH)
        vectorizer = joblib.load(VECTORIZER_PATH)

        # Load heavy Transformer model
        from sentence_transformers import SentenceTransformer, util
        embedder = SentenceTransformer(EMBEDDING_MODEL)

        # --- Step 1: Logistic Regression Prediction ---
        X = vectorizer.transform([text_clean])
        probs = model.predict_proba(X)[0]
        pred_label = model.classes_[np.argmax(probs)]
        ml_conf = float(np.max(probs))

        # --- Step 2: Sentence Embedding Semantic Match ---
        embeddings_db = {
            "Fake Bank / Financial Fraud": "bank account blocked refund transfer verify payment loan upi",
            "Lottery / Prize Scam": "lottery prize claim reward congratulations winner gift",
            "Tech Support Scam": "support microsoft windows security virus fix alert technician helpdesk",
            "Fake Job / Recruitment Scam": "job offer hr recruiter apply resume salary internship work from home",
            "Investment / Crypto Scam": "crypto bitcoin investment trading wallet profit double money fund",
            "Romance / Relationship Scam": "love relationship chat gift darling sweetheart honey emotional connect"
        }

        text_emb = embedder.encode(text_clean, convert_to_tensor=True)
        semantic_scores = {
            cat: float(util.cos_sim(text_emb, embedder.encode(desc, convert_to_tensor=True))[0][0])
            for cat, desc in embeddings_db.items()
        }
        semantic_label = max(semantic_scores, key=semantic_scores.get)
        semantic_conf = float(semantic_scores[semantic_label])

        # --- Step 3: Heuristic Keyword Matching ---
        KEYWORDS = {
            "verify": "Fake Bank / Financial Fraud",
            "upi": "Fake Bank / Financial Fraud",
            "lottery": "Lottery / Prize Scam",
            "crypto": "Investment / Crypto Scam",
            "resume": "Fake Job / Recruitment Scam",
            "love": "Romance / Relationship Scam",
            "support": "Tech Support Scam"
        }
        token_counts = Counter(text_clean.split())
        heuristic_scores = {cat: 0 for cat in SCAM_TYPES}
        for token, count in token_counts.items():
            if token in KEYWORDS:
                heuristic_scores[KEYWORDS[token]] += count
        heuristic_label = max(heuristic_scores, key=heuristic_scores.get)
        heuristic_conf = min(1.0, heuristic_scores[heuristic_label] / 5.0)

        # --- Step 4: Tone and Sentiment Analysis ---
        tone = detect_urgency_and_financial_terms(text_clean)
        sentiment = TextBlob(text_clean).sentiment.polarity

        # --- Step 5: Confidence Fusion ---
        final_label = max(
            [pred_label, semantic_label, heuristic_label],
            key=[pred_label, semantic_label, heuristic_label].count
        )

        weights = {"ml": 0.5, "semantic": 0.3, "heuristic": 0.2}
        combined_conf = (
            ml_conf * weights["ml"] +
            semantic_conf * weights["semantic"] +
            heuristic_conf * weights["heuristic"]
        )

        # Adjust confidence based on tone factors (urgent + financial)
        combined_conf = min(1.0, combined_conf + tone["tone_factor"] * 0.1)

        # --- Step 6: Keyword Evidence Extraction ---
        top_keywords = [k for k, v in KEYWORDS.items() if v == final_label and k in text_clean]

        return {
            "category": final_label,
            "confidence": round(combined_conf, 2),
            "votes": {
                "ml": pred_label,
                "semantic": semantic_label,
                "heuristic": heuristic_label
            },
            "tone_signals": tone,
            "sentiment_polarity": round(sentiment, 3),
            "keywords": top_keywords,
        }

    finally:
        # --- ⚠️ CRITICAL MEMORY CLEANUP ---
        # This block ALWAYS runs, even if the code above crashes.
        # It forces the deletion of the heavy models to free up 300MB+ RAM.
        if 'embedder' in locals() and embedder is not None:
            del embedder
        if 'model' in locals() and model is not None:
            del model
        if 'vectorizer' in locals() and vectorizer is not None:
            del vectorizer

        gc.collect() # Force Python to release memory to OS
        print("✅ Scam Classifier Models Unloaded from Memory")