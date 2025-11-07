from app.pipelines.osint_engine import enrich_entity_osint
from fastapi import APIRouter, Form
from app.pipelines.ocr import extract_text_from_image
from app.pipelines.regex_extract import extract_entities
from app.pipelines.ner import extract_named_entities
from app.pipelines.risk_assessor import calculate_risk
from app.services.chainlog import chain_log
import os

router = APIRouter()

UPLOAD_DIR = "app/data/uploads"

@router.post("/analyze")
def analyze(file_id: str = Form(...)):
    file_path = os.path.join(UPLOAD_DIR, file_id)

    if not os.path.exists(file_path):
        return {"error": "File not found", "file_id": file_id}

    # 1. OCR
    raw_text = extract_text_from_image(file_path)

    # 2. Regex + NER
    regex_hits = extract_entities(raw_text)
    ner_hits = extract_named_entities(raw_text)
    all_entities = regex_hits + ner_hits

    # ✅ 3. RISK SCORING (this was missing)
    risk_report = [calculate_risk(e) for e in all_entities]

    threat_intel = [enrich_entity_osint(e) for e in all_entities]

    # 4. Chain log
    chain_log(
        action="ANALYZE_EVIDENCE",
        actor="system",
        target=file_id,
        sha256=None,
        meta={"entities_found": len(all_entities)}
    )

    # 5. Response
    return {
        "file_id": file_id,
        "raw_text": raw_text,
        "entities": all_entities,
        "risk_report": risk_report,
        "threat_intel": threat_intel
    }
