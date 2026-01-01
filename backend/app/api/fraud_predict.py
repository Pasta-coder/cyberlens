"""
🚨 Fraud Detection API
Predict corruption risk for public procurement contracts using the trained XGBoost model.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
import joblib
import pandas as pd
import numpy as np
import os
import traceback

router = APIRouter()

# --- Model Loading ---
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")

# Load model and related artifacts
try:
    model = joblib.load(os.path.join(MODEL_DIR, "fraud_detection_model.pkl"))
    feature_columns = joblib.load(os.path.join(MODEL_DIR, "model_feature_columns.pkl"))
    target_encoders = joblib.load(os.path.join(MODEL_DIR, "target_encoders.pkl"))
    MODEL_LOADED = True
    print("✅ Fraud detection model loaded successfully")
except Exception as e:
    MODEL_LOADED = False
    model = None
    feature_columns = None
    target_encoders = None
    print(f"⚠️ Failed to load fraud detection model: {e}")


# --- Request/Response Models ---
class ContractInput(BaseModel):
    """Input schema for a single contract prediction"""
    name: str = Field(..., description="Contract/Tender title")
    department: Optional[str] = Field(None, description="Department name")
    estimated_price: float = Field(..., gt=0, description="Estimated contract value")
    final_price: float = Field(..., gt=0, description="Final/Awarded contract value")
    bidders: int = Field(..., ge=1, description="Number of bidders")
    award_month: Optional[int] = Field(6, ge=1, le=12, description="Month of award (1-12)")
    is_sunday: Optional[bool] = Field(False, description="Was contract awarded on Sunday?")
    is_december: Optional[bool] = Field(False, description="Was contract awarded in December?")


class FraudSignal(BaseModel):
    """A detected fraud signal"""
    signal: str
    description: str
    severity: str  # "high", "medium", "low"


class PredictionResult(BaseModel):
    """Output schema for fraud prediction"""
    contract_name: str
    predicted_cri: float
    risk_level: str
    risk_color: str
    recommendation: str
    fraud_signals: List[FraudSignal]
    feature_breakdown: dict


class BatchPredictionRequest(BaseModel):
    """Request schema for batch predictions"""
    contracts: List[ContractInput]


# --- Helper Functions ---
def detect_fraud_signals(contract: ContractInput) -> List[FraudSignal]:
    """Detect rule-based fraud signals from contract data"""
    signals = []
    
    # Round Number Trap
    if contract.final_price % 1000 == 0:
        signals.append(FraudSignal(
            signal="🚩 Round Number",
            description=f"Final price ({contract.final_price:,.0f}) is a round number (divisible by 1000)",
            severity="medium"
        ))
    
    # Single Bidder
    if contract.bidders == 1:
        signals.append(FraudSignal(
            signal="🚩 Single Bidder",
            description="Only one bidder participated - indicates potential bid rigging",
            severity="high"
        ))
    
    # Vague Title
    if len(contract.name) < 30:
        signals.append(FraudSignal(
            signal="🚩 Vague Title",
            description=f"Contract title is too short ({len(contract.name)} chars) - may hide true purpose",
            severity="medium"
        ))
    
    # Cost Overrun
    if contract.estimated_price > 0:
        overrun = (contract.final_price - contract.estimated_price) / contract.estimated_price * 100
        if overrun > 5:
            signals.append(FraudSignal(
                signal="🚩 Cost Overrun",
                description=f"Final price exceeds estimate by {overrun:.1f}%",
                severity="high" if overrun > 20 else "medium"
            ))
    
    # Sunday Award
    if contract.is_sunday:
        signals.append(FraudSignal(
            signal="🚩 Sunday Award",
            description="Contract awarded on Sunday - unusual timing",
            severity="low"
        ))
    
    # December Rush
    if contract.is_december:
        signals.append(FraudSignal(
            signal="🚩 December Rush",
            description="Contract awarded in December - year-end budget spending rush",
            severity="low"
        ))
    
    return signals


def predict_contract_risk(contract: ContractInput) -> PredictionResult:
    """Predict fraud risk for a single contract using the trained model"""
    
    if not MODEL_LOADED:
        raise HTTPException(
            status_code=503,
            detail="Fraud detection model not loaded. Please check server logs."
        )
    
    # Calculate derived features
    price_efficiency = contract.final_price / contract.estimated_price if contract.estimated_price > 0 else 1.0
    is_round_1000 = 1 if contract.final_price % 1000 == 0 else 0
    single_bidder_proxy = 1 if contract.bidders == 1 else 0
    title_length = len(contract.name)
    is_medium_title = 1 if 100 <= title_length <= 200 else 0
    
    # Build feature dictionary
    features = {
        'tender_finalprice': contract.final_price,
        'tender_estimatedprice': contract.estimated_price,
        'tender_recordedbidscount': contract.bidders,
        'is_round_1000': is_round_1000,
        'single_bidder_proxy': single_bidder_proxy,
        'title_length': title_length,
        'is_medium_title': is_medium_title,
        'price_efficiency': price_efficiency,
        'winner_dominance': 0,  # Unknown for new data
        'month': contract.award_month or 6,
        'is_sunday': 1 if contract.is_sunday else 0,
        'is_december': 1 if contract.is_december else 0,
    }
    
    # Add encoded features (use global mean = 0.445 based on training data)
    global_mean = 0.445
    for col in feature_columns:
        if '_encoded' in col and col not in features:
            features[col] = global_mean
    
    # Create DataFrame with correct columns
    X_input = pd.DataFrame([features])
    
    # Align with training columns
    for col in feature_columns:
        if col not in X_input.columns:
            X_input[col] = 0
    
    X_input = X_input[feature_columns].fillna(0)
    
    # Predict using trained model
    predicted_cri = float(model.predict(X_input)[0])
    
    # Determine risk level
    if predicted_cri >= 0.7:
        risk_level = "CRITICAL"
        risk_color = "🔴"
        recommendation = "IMMEDIATE INVESTIGATION REQUIRED"
    elif predicted_cri >= 0.5:
        risk_level = "HIGH"
        risk_color = "🟠"
        recommendation = "Detailed audit recommended"
    elif predicted_cri >= 0.3:
        risk_level = "MODERATE"
        risk_color = "🟡"
        recommendation = "Enhanced monitoring advised"
    else:
        risk_level = "LOW"
        risk_color = "🟢"
        recommendation = "Standard oversight sufficient"
    
    # Detect fraud signals
    fraud_signals = detect_fraud_signals(contract)
    
    # Feature breakdown for transparency
    feature_breakdown = {
        "price_efficiency": round(price_efficiency, 3),
        "is_round_number": bool(is_round_1000),
        "single_bidder": bool(single_bidder_proxy),
        "title_length": title_length,
        "award_month": contract.award_month or 6,
        "cost_overrun_percent": round((price_efficiency - 1) * 100, 2) if price_efficiency > 1 else 0
    }
    
    return PredictionResult(
        contract_name=contract.name,
        predicted_cri=round(predicted_cri, 4),
        risk_level=risk_level,
        risk_color=risk_color,
        recommendation=recommendation,
        fraud_signals=fraud_signals,
        feature_breakdown=feature_breakdown
    )


# --- API Endpoints ---
@router.post("/fraud-predict", response_model=PredictionResult)
async def predict_single_contract(contract: ContractInput):
    """
    🚨 Predict fraud risk for a single procurement contract.
    
    Uses the Romania-trained XGBoost model (R²=0.74) to predict corruption risk.
    Also provides rule-based fraud signal detection.
    """
    try:
        result = predict_contract_risk(contract)
        return result
    except HTTPException:
        raise
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"❌ Fraud prediction error: {error_trace}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/fraud-predict/batch")
async def predict_batch_contracts(request: BatchPredictionRequest):
    """
    🚨 Predict fraud risk for multiple procurement contracts.
    
    Returns predictions for all contracts with aggregate statistics.
    """
    try:
        results = []
        for contract in request.contracts:
            result = predict_contract_risk(contract)
            results.append(result)
        
        # Aggregate statistics
        cri_values = [r.predicted_cri for r in results]
        risk_counts = {
            "critical": sum(1 for r in results if r.risk_level == "CRITICAL"),
            "high": sum(1 for r in results if r.risk_level == "HIGH"),
            "moderate": sum(1 for r in results if r.risk_level == "MODERATE"),
            "low": sum(1 for r in results if r.risk_level == "LOW"),
        }
        
        return {
            "status": "success ✅",
            "total_contracts": len(results),
            "average_cri": round(np.mean(cri_values), 4),
            "max_cri": round(max(cri_values), 4),
            "min_cri": round(min(cri_values), 4),
            "risk_distribution": risk_counts,
            "predictions": [r.dict() for r in results]
        }
    except HTTPException:
        raise
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"❌ Batch fraud prediction error: {error_trace}")
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")


@router.get("/fraud-predict/model-info")
async def get_model_info():
    """
    📊 Get information about the loaded fraud detection model.
    """
    return {
        "model_loaded": MODEL_LOADED,
        "model_type": "XGBoost Regressor" if MODEL_LOADED else None,
        "training_data": "Romania Digiwhist 2023 (1.8M+ contracts)",
        "model_performance": {
            "r2_score": 0.74,
            "test_rmse": 0.098,
            "train_rmse": 0.091
        },
        "feature_count": len(feature_columns) if feature_columns else 0,
        "features": feature_columns if feature_columns else [],
        "fraud_signals_detected": [
            "Round Number Trap",
            "Single Bidder",
            "Vague Title",
            "Cost Overrun",
            "Sunday Award",
            "December Rush"
        ]
    }
