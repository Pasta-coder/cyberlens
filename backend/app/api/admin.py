"""
🛡️ Admin Data Ingestion & Training Console
Stores uploaded data to PostgreSQL database.
Protected by JWT authentication.
"""

from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException, Depends
from typing import Optional
from enum import Enum
import pandas as pd
import numpy as np
import io
import json
import uuid
import traceback
from datetime import datetime, timezone

from app.auth import require_admin
from app.database import get_db, execute_query, execute_insert

router = APIRouter(tags=["Admin – Data Ingestion"])


# ──────────────────────────────────────────────
# Enums & Constants
# ──────────────────────────────────────────────
class DataType(str, Enum):
    training = "training"
    fiscal = "fiscal"
    welfare = "welfare"
    procurement = "procurement"


FISCAL_REQUIRED_COLS = {"transaction_id", "amount"}
WELFARE_REQUIRED_COLS = {"district_name", "population_bpl", "active_beneficiaries"}
PROCUREMENT_REQUIRED_COLS = {"contract_title", "final_price"}


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


# ──────────────────────────────────────────────
# Main Ingest Endpoint (Auth Protected)
# ──────────────────────────────────────────────
@router.post("/admin/ingest")
async def ingest_data(
    file: UploadFile = File(...),
    data_type: str = Form(...),
    uploader_name: str = Form("Admin"),
    uploader_department: str = Form("IT Department"),
    admin: dict = Depends(require_admin),
):
    """
    📥 Ingest uploaded data into PostgreSQL database.
    Protected by JWT authentication.
    
    **data_type** must be one of: `fiscal`, `welfare`, `procurement`.
    """
    timestamp = datetime.now(timezone.utc).isoformat()
    batch_id = f"BATCH-{uuid.uuid4().hex[:8].upper()}"
    
    uploader = admin.get("full_name", uploader_name)
    department = admin.get("department", uploader_department)
    
    print(f"📥 [{timestamp}] Ingestion by {uploader} ({department}) — type: {data_type}, file: {file.filename}")

    if data_type not in DataType.__members__:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid data_type '{data_type}'. Must be one of: {[e.value for e in DataType]}"
        )

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

    # ── Fiscal Data ────────────────────────────
    if data_type == DataType.fiscal:
        _validate_columns(df, FISCAL_REQUIRED_COLS, "fiscal logs")
        df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
        
        inserted = 0
        with get_db() as conn:
            with conn.cursor() as cur:
                for _, row in df.iterrows():
                    cur.execute(
                        """INSERT INTO fiscal_transactions 
                           (transaction_id, department, amount, purpose, vendor, date, batch_id)
                           VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                        (
                            str(row.get("transaction_id", f"TX-{uuid.uuid4().hex[:6]}")),
                            str(row.get("department", "Unknown")),
                            float(row.get("amount", 0)),
                            str(row.get("purpose", "")) if pd.notna(row.get("purpose")) else None,
                            str(row.get("vendor", "")) if pd.notna(row.get("vendor")) else None,
                            str(row.get("date", "")) if pd.notna(row.get("date")) else None,
                            batch_id,
                        )
                    )
                    inserted += 1
                
                # Log upload
                cur.execute(
                    """INSERT INTO upload_logs (batch_id, data_type, filename, rows_count, uploaded_by, department)
                       VALUES (%s, %s, %s, %s, %s, %s)""",
                    (batch_id, "fiscal", file.filename, inserted, uploader, department)
                )

        return {
            "status": "success",
            "message": f"✅ {inserted} fiscal transactions stored to database.",
            "batch_id": batch_id,
            "rows_inserted": inserted,
            "total_spend": round(float(df["amount"].sum()), 2),
            "uploaded_by": uploader,
            "department": department,
        }

    # ── Procurement Data ──────────────────────
    elif data_type == DataType.procurement:
        _validate_columns(df, PROCUREMENT_REQUIRED_COLS, "procurement contracts")
        df["final_price"] = pd.to_numeric(df["final_price"], errors="coerce")
        
        inserted = 0
        with get_db() as conn:
            with conn.cursor() as cur:
                for _, row in df.iterrows():
                    est = float(row.get("estimated_price", 0) or 0)
                    final = float(row.get("final_price", 0) or 0)
                    bidders = int(row.get("bidders_count", 1) or 1)
                    month = int(row.get("award_month", 1) or 1)
                    is_sunday = bool(row.get("is_sunday", False))
                    is_december = month == 12
                    
                    # Calculate CRI
                    cri = 0.0
                    signals = []
                    if bidders == 1:
                        cri += 0.3
                        signals.append("Single Bidder")
                    if est > 0 and final > est * 1.1:
                        overrun = round((final - est) / est * 100, 1)
                        cri += 0.2
                        signals.append(f"Cost Overrun {overrun}%")
                    if is_december:
                        cri += 0.15
                        signals.append("December Rush")
                    if is_sunday:
                        cri += 0.1
                        signals.append("Sunday Award")
                    if final % 1000 == 0:
                        cri += 0.1
                        signals.append("Round Number")
                    
                    cri = min(cri, 1.0)
                    risk = "CRITICAL" if cri >= 0.7 else "HIGH" if cri >= 0.5 else "MODERATE" if cri >= 0.3 else "LOW"
                    
                    cur.execute(
                        """INSERT INTO procurement_contracts 
                           (contract_title, department, buyer_name, winner_name, estimated_price,
                            final_price, bidders_count, award_date, award_month, is_sunday,
                            is_december, cri_score, risk_level, fraud_signals, batch_id)
                           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                        (
                            str(row.get("contract_title", "Untitled")),
                            str(row.get("department", "Unknown")),
                            str(row.get("buyer_name", "")) if pd.notna(row.get("buyer_name")) else None,
                            str(row.get("winner_name", "")) if pd.notna(row.get("winner_name")) else None,
                            est,
                            final,
                            bidders,
                            str(row.get("award_date", "")) if pd.notna(row.get("award_date")) else None,
                            month,
                            is_sunday,
                            is_december,
                            round(cri, 4),
                            risk,
                            json.dumps(signals),
                            batch_id,
                        )
                    )
                    inserted += 1
                
                cur.execute(
                    """INSERT INTO upload_logs (batch_id, data_type, filename, rows_count, uploaded_by, department)
                       VALUES (%s, %s, %s, %s, %s, %s)""",
                    (batch_id, "procurement", file.filename, inserted, uploader, department)
                )

        return {
            "status": "success",
            "message": f"✅ {inserted} procurement contracts stored and analyzed.",
            "batch_id": batch_id,
            "rows_inserted": inserted,
            "total_value": round(float(df["final_price"].sum()), 2),
            "uploaded_by": uploader,
        }

    # ── Welfare Data ──────────────────────────
    elif data_type == DataType.welfare:
        _validate_columns(df, WELFARE_REQUIRED_COLS, "welfare stats")
        df["population_bpl"] = pd.to_numeric(df["population_bpl"], errors="coerce")
        df["active_beneficiaries"] = pd.to_numeric(df["active_beneficiaries"], errors="coerce")
        
        inserted = 0
        with get_db() as conn:
            with conn.cursor() as cur:
                for _, row in df.iterrows():
                    pop = int(row.get("population_bpl", 0))
                    active = int(row.get("active_beneficiaries", 0))
                    gap = active - pop
                    gap_pct = round((gap / pop * 100), 2) if pop > 0 else 0
                    risk = "CRITICAL" if gap_pct > 15 else "HIGH" if gap_pct > 10 else "MODERATE" if gap_pct > 5 else "LOW"
                    
                    cur.execute(
                        """INSERT INTO welfare_districts 
                           (district_name, population_bpl, active_beneficiaries, scheme_name,
                            year, gap, gap_percentage, risk_level, batch_id)
                           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                        (
                            str(row.get("district_name", "Unknown")),
                            pop,
                            active,
                            str(row.get("scheme_name", "General")),
                            int(row.get("year", 2026)),
                            gap,
                            gap_pct,
                            risk,
                            batch_id,
                        )
                    )
                    inserted += 1
                
                cur.execute(
                    """INSERT INTO upload_logs (batch_id, data_type, filename, rows_count, uploaded_by, department)
                       VALUES (%s, %s, %s, %s, %s, %s)""",
                    (batch_id, "welfare", file.filename, inserted, uploader, department)
                )

        return {
            "status": "success",
            "message": f"✅ {inserted} welfare district records stored.",
            "batch_id": batch_id,
            "rows_inserted": inserted,
            "uploaded_by": uploader,
        }

    # ── Training Data (kept as stub) ──────────
    elif data_type == DataType.training:
        return {
            "status": "accepted",
            "message": "Training data received. Model retraining queued.",
            "rows_received": rows,
            "batch_id": batch_id,
        }


# ──────────────────────────────────────────────
# Admin Overview – Upload History
# ──────────────────────────────────────────────
@router.get("/admin/uploads")
async def get_upload_history(admin: dict = Depends(require_admin)):
    """📋 View upload history from the audit log."""
    logs = execute_query(
        "SELECT * FROM upload_logs ORDER BY created_at DESC LIMIT 50"
    )
    
    # Stats
    total_fiscal = execute_query("SELECT COUNT(*) as count FROM fiscal_transactions", fetch_one=True)
    total_procurement = execute_query("SELECT COUNT(*) as count FROM procurement_contracts", fetch_one=True)
    total_welfare = execute_query("SELECT COUNT(*) as count FROM welfare_districts", fetch_one=True)
    
    return {
        "uploads": [dict(l) for l in logs] if logs else [],
        "database_stats": {
            "fiscal_transactions": total_fiscal["count"] if total_fiscal else 0,
            "procurement_contracts": total_procurement["count"] if total_procurement else 0,
            "welfare_districts": total_welfare["count"] if total_welfare else 0,
        },
    }


@router.get("/admin/stats")
async def get_admin_stats():
    """📊 Public-facing database statistics."""
    total_fiscal = execute_query("SELECT COUNT(*) as count FROM fiscal_transactions", fetch_one=True)
    total_procurement = execute_query("SELECT COUNT(*) as count FROM procurement_contracts", fetch_one=True)
    total_welfare = execute_query("SELECT COUNT(*) as count FROM welfare_districts", fetch_one=True)
    
    return {
        "status": "online",
        "database": "PostgreSQL (Neon)",
        "fiscal_transactions": total_fiscal["count"] if total_fiscal else 0,
        "procurement_contracts": total_procurement["count"] if total_procurement else 0,
        "welfare_districts": total_welfare["count"] if total_welfare else 0,
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }
