# from fastapi import APIRouter, Form
# import os
# from app.pipelines.ocr import extract_text_from_image
# from app.pipelines.regex_extract import extract_entities
# from app.pipelines.ner import extract_named_entities
# from app.pipelines.risk_assessor import calculate_risk
# from app.pipelines.osint_engine import enrich_entity_osint
# from app.pipelines.report_generator import generate_pdf_report

# router = APIRouter()

# UPLOAD_DIR = "app/data/uploads"

# @router.post("/report")
# def generate_report(file_id: str = Form(...)):
#     file_path = os.path.join(UPLOAD_DIR, file_id)

#     if not os.path.exists(file_path):
#         return {"error": "File not found", "file_id": file_id}

#     # ✅ 1. Re-run OCR + extraction
#     raw_text = extract_text_from_image(file_path)
#     regex_hits = extract_entities(raw_text)
#     ner_hits = extract_named_entities(raw_text)
#     all_entities = regex_hits + ner_hits

#     # ✅ 2. Risk
#     risk_report = [calculate_risk(e) for e in all_entities]

#     # ✅ 3. OSINT
#     threat_intel = [enrich_entity_osint(e) for e in all_entities]

#     # ✅ 4. Generate PDF (returns bytes)
#     pdf_bytes = generate_pdf_report(
#         raw_text=raw_text,
#         entities=all_entities,
#         risk_report=risk_report,
#         threat_intel=threat_intel
#     )

#     # ✅ 5. Return PDF correctly
#     return pdf_bytes


from fastapi import APIRouter, Form, HTTPException
from fastapi.responses import StreamingResponse
from io import BytesIO
import os

from app.pipelines.ocr import extract_text_from_image
from app.pipelines.regex_extract import extract_entities
from app.pipelines.ner import extract_named_entities
from app.pipelines.risk_assessor import calculate_risk
from app.pipelines.osint_engine import enrich_entity_osint
from app.pipelines.report_generator import generate_pdf_report

router = APIRouter()

UPLOAD_DIR = "app/data/uploads"


@router.post("/report")
def generate_report(file_id: str = Form(...)):
    file_path = os.path.join(UPLOAD_DIR, file_id)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    # ✅ 1. OCR
    raw_text = extract_text_from_image(file_path)

    # ✅ 2. Entity extraction
    regex_hits = extract_entities(raw_text)
    ner_hits = extract_named_entities(raw_text)
    all_entities = regex_hits + ner_hits

    # ✅ 3. Risk scoring
    risk_report = [calculate_risk(e) for e in all_entities]

    # ✅ 4. OSINT enrichment
    threat_intel = [enrich_entity_osint(e) for e in all_entities]

    # ✅ 5. Generate PDF bytes
    pdf_bytes = generate_pdf_report(
        raw_text=raw_text,
        entities=all_entities,
        risk_report=risk_report,
        threat_intel=threat_intel
    )

    # ✅ 6. Convert to stream for FastAPI
    pdf_stream = BytesIO(pdf_bytes)

    # ✅ 7. Return proper PDF response
    return StreamingResponse(
        pdf_stream,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=cyberlens_report.pdf"
        }
    )
