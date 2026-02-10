"""
🛡️ Admin Data Ingestion & Training Console
Allows government officials to upload datasets for:
  - XGBoost model retraining (training data)
  - Fiscal log analysis (Benford + cartel radar)
  - Welfare beneficiary gap detection
"""

from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException
from typing import Optional
from enum import Enum
import pandas as pd
import numpy as np
import io
import json
import traceback
from datetime import datetime, timezone

router = APIRouter(tags=["Admin – Data Ingestion"])


# ──────────────────────────────────────────────
# Enums & Constants
# ──────────────────────────────────────────────
class DataType(str, Enum):
    training = "training"
    fiscal = "fiscal"
    welfare = "welfare"


TRAINING_REQUIRED_COLS = {"contract_title", "final_price", "audit_outcome"}
FISCAL_REQUIRED_COLS = {"transaction_id", "amount"}
WELFARE_REQUIRED_COLS = {"district_name", "population_bpl", "active_beneficiaries"}


# ──────────────────────────────────────────────
# Background task: XGBoost retraining stub
# ──────────────────────────────────────────────
def retrain_model(df: pd.DataFrame):
    """
    Background task that would retrain the XGBoost model.
    In production this would:
      1. Merge with existing training data
      2. Feature-engineer
      3. Train new XGBoost model
      4. Save model artifact (.joblib)
      5. Hot-swap the loaded model
    For now we log the intent.
    """
    print(f"🧠 [Background] XGBoost retrain triggered with {len(df)} rows.")
    print(f"   Columns: {list(df.columns)}")
    print(f"   Audit-outcome distribution:\n{df['audit_outcome'].value_counts().to_dict()}")
    # TODO: plug in real training pipeline
    print("✅ [Background] Model retraining complete (stub).")


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────
def _parse_file(file_bytes: bytes, filename: str) -> pd.DataFrame:
    """Parse uploaded CSV or JSON into a DataFrame."""
    lower = filename.lower()
    if lower.endswith(".csv"):
        return pd.read_csv(io.BytesIO(file_bytes))
    elif lower.endswith(".json"):
        data = json.loads(file_bytes.decode("utf-8"))
        if isinstance(data, list):
            return pd.DataFrame(data)
        elif isinstance(data, dict):
            # Try common wrapper keys
            for key in ("data", "records", "rows"):
                if key in data and isinstance(data[key], list):
                    return pd.DataFrame(data[key])
            return pd.DataFrame([data])
        raise HTTPException(status_code=400, detail="JSON must be an array or object with a data array.")
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {filename}. Upload CSV or JSON.")


def _validate_columns(df: pd.DataFrame, required: set, label: str):
    """Raise 422 if required columns are missing."""
    missing = required - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Missing required columns for {label}: {sorted(missing)}. "
                   f"Found columns: {sorted(df.columns)}"
        )


def _benford_score(series: pd.Series) -> float:
    """
    Compute a simplified Benford's Law conformity score.
    Returns a 0-1 score where 1 = perfect conformity.
    """
    # Expected Benford distribution for leading digits 1-9
    expected = {d: np.log10(1 + 1 / d) for d in range(1, 10)}

    # Extract leading digits
    abs_vals = series.dropna().abs()
    abs_vals = abs_vals[abs_vals > 0]
    if len(abs_vals) == 0:
        return 0.0

    leading = abs_vals.astype(str).str.lstrip("0").str[0].astype(int)
    leading = leading[leading.between(1, 9)]
    observed = leading.value_counts(normalize=True)

    # Chi-squared-style deviation
    deviation = 0.0
    for d in range(1, 10):
        obs = observed.get(d, 0.0)
        exp = expected[d]
        deviation += (obs - exp) ** 2 / exp

    # Normalize to 0-1 (lower deviation = higher score)
    score = max(0.0, 1.0 - deviation)
    return round(score, 4)


# ──────────────────────────────────────────────
# Main Endpoint
# ──────────────────────────────────────────────
@router.post("/admin/ingest")
async def ingest_data(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    data_type: str = Form(...),
    uploader_name: str = Form(...),
    uploader_department: str = Form(...),
):
    """
    📥 Ingest uploaded data for model training or analytical processing.

    **data_type** must be one of: `training`, `fiscal`, `welfare`.
    Requires uploader identification (name + department) for audit trail.
    """
    # Log uploader info
    timestamp = datetime.now(timezone.utc).isoformat()
    print(f"📥 [{timestamp}] Ingestion by {uploader_name} ({uploader_department}) — type: {data_type}, file: {file.filename}")

    uploader_meta = {
        "uploaded_by": uploader_name,
        "department": uploader_department,
        "uploaded_at": timestamp,
    }
    # Validate data_type
    if data_type not in DataType.__members__:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid data_type '{data_type}'. Must be one of: {[e.value for e in DataType]}"
        )

    # Read & parse file
    try:
        file_bytes = await file.read()
        if len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")
        df = _parse_file(file_bytes, file.filename or "unknown.csv")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    rows = len(df)

    # ── Training Data ──────────────────────────
    if data_type == DataType.training:
        _validate_columns(df, TRAINING_REQUIRED_COLS, "training data")

        # Ensure audit_outcome is numeric
        try:
            df["audit_outcome"] = pd.to_numeric(df["audit_outcome"], errors="coerce")
        except Exception:
            pass

        invalid = df["audit_outcome"].isna().sum()
        if invalid > 0:
            print(f"⚠️  {invalid} rows have non-numeric audit_outcome — they will be dropped during training.")

        background_tasks.add_task(retrain_model, df)
        return {
            "status": "training_started",
            "message": "XGBoost model update queued.",
            "rows_received": rows,
            "columns": list(df.columns),
            **uploader_meta,
        }

    # ── Fiscal Logs ────────────────────────────
    elif data_type == DataType.fiscal:
        _validate_columns(df, FISCAL_REQUIRED_COLS, "fiscal logs")

        df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
        total_spend = float(df["amount"].sum())
        benford = _benford_score(df["amount"])
        dept_spend = (
            df.groupby("department")["amount"].sum().sort_values(ascending=False).head(10).to_dict()
            if "department" in df.columns else {}
        )

        return {
            "status": "success",
            "message": "Fiscal logs ingested. Benford Analysis & Cartel Radar updated.",
            "summary": {
                "total_transactions": rows,
                "total_spend": round(total_spend, 2),
                "benford_conformity_score": benford,
                "top_departments": dept_spend,
            },
            **uploader_meta,
        }

    # ── Welfare Stats ──────────────────────────
    elif data_type == DataType.welfare:
        _validate_columns(df, WELFARE_REQUIRED_COLS, "welfare stats")

        df["population_bpl"] = pd.to_numeric(df["population_bpl"], errors="coerce")
        df["active_beneficiaries"] = pd.to_numeric(df["active_beneficiaries"], errors="coerce")
        df["gap"] = df["active_beneficiaries"] - df["population_bpl"]

        # Districts where active > expected → potential ghost beneficiaries
        critical = df[df["gap"] > 0]
        critical_districts = critical["district_name"].tolist()
        total_ghost_estimate = int(critical["gap"].sum()) if len(critical) > 0 else 0

        return {
            "status": "success",
            "message": "Ghost Beneficiary Detection triggered.",
            "total_districts_analyzed": rows,
            "critical_districts": critical_districts,
            "total_excess_beneficiaries": total_ghost_estimate,
            "details": critical[["district_name", "population_bpl", "active_beneficiaries", "gap"]]
                .to_dict(orient="records") if len(critical) > 0 else [],
            **uploader_meta,
        }
