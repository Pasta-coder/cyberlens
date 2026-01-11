from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from datetime import datetime
from io import BytesIO
import os

REPORT_DIR = "app/reports"
os.makedirs(REPORT_DIR, exist_ok=True)


def generate_pdf_report(file_id, raw_text, entities, risk_report, threat_intel,
                        scam_class=None, url_qr_findings=None):
    """
    🧠 Generates a full SatyaSetu.AI forensic intelligence report (multi-page PDF).
    Includes AI classification, risk, OSINT findings, and extracted text.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=60,
        bottomMargin=50,
        title="SatyaSetu.AI Forensic Report"
    )
    styles = getSampleStyleSheet()

    # 🧾 Custom styles
    heading = ParagraphStyle(name="Heading", fontSize=14, leading=16, spaceAfter=10, textColor=colors.HexColor("#1F4E79"))
    subheading = ParagraphStyle(name="Subheading", fontSize=12, leading=14, spaceAfter=6, textColor=colors.HexColor("#17365D"))
    body = styles["BodyText"]

    story = []

    # === HEADER ===
    story.append(Paragraph("<b> SATYASETU.AI FORENSIC INTELLIGENCE REPORT</b>", heading))
    story.append(Spacer(1, 10))
    story.append(Paragraph(f"<b>File ID:</b> {file_id}", body))
    story.append(Paragraph(f"<b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", body))
    story.append(Spacer(1, 15))

    # === SCAM CLASSIFICATION ===
    if scam_class:
        story.append(Paragraph("🧠 <b>AI Scam Classification</b>", subheading))
        category = scam_class.get("category", "N/A")
        conf = scam_class.get("confidence", 0) * 100
        story.append(Paragraph(f"<b>Predicted Category:</b> {category}", body))
        story.append(Paragraph(f"<b>Confidence:</b> {conf:.1f}%", body))
        story.append(Spacer(1, 10))

    # === RISK ASSESSMENT ===
    if risk_report:
        story.append(Paragraph("⚠️ <b>Risk Assessment</b>", subheading))
        level = risk_report.get("risk_level", "N/A")
        score = risk_report.get("score", "N/A")

        # Risk color based on level
        color_map = {"High": colors.red, "Medium": colors.orange, "Low": colors.green}
        risk_color = color_map.get(level, colors.black)

        risk_table = Table([
            ["Risk Level", "Score"],
            [Paragraph(f"<b><font color='{risk_color.hexval()}'>{level}</font></b>", body), str(score)]
        ], colWidths=[200, 200])
        risk_table.setStyle(TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.3, colors.grey),
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
        ]))
        story.append(risk_table)
        story.append(Spacer(1, 12))

    # === EXTRACTED ENTITIES ===
    if entities:
        story.append(Paragraph("🔍 <b>Extracted Entities</b>", subheading))
        table_data = [["Type", "Value", "Confidence"]]
        for e in entities:
            conf = f"{e.get('confidence', 0)*100:.1f}%" if e.get("confidence") else "---"
            table_data.append([
                e.get("type", ""),
                e.get("value", ""),
                conf
            ])
        entity_table = Table(table_data, colWidths=[100, 300, 80])
        entity_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#17365D")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
        ]))
        story.append(entity_table)
        story.append(Spacer(1, 12))

    # === THREAT INTELLIGENCE ===
    if threat_intel:
        story.append(Paragraph("🌐 <b>Threat Intelligence (OSINT)</b>", subheading))
        for intel in threat_intel:
            story.append(Paragraph(f"• <b>{intel.get('entity', intel)}</b>", body))
            sources = intel.get("sources", [])
            for src in sources:
                sname = src.get("source", "unknown")
                risk = src.get("risk", "unknown")
                score = src.get("score", "N/A")
                story.append(Paragraph(f" ↳ {sname.title()} — {risk} ({score})", body))
            story.append(Spacer(1, 6))
        story.append(PageBreak())

    # === URL / QR FINDINGS ===
    if url_qr_findings:
        story.append(Paragraph("🔗 <b>URL & QR Code Findings</b>", subheading))
        for f in url_qr_findings:
            story.append(Paragraph(f"- {f}", body))
        story.append(Spacer(1, 12))

    # === OCR TEXT ===
    if raw_text:
        story.append(Paragraph("🧾 <b>Extracted OCR Text</b>", subheading))
        safe_text = raw_text.replace("\n", "<br/>")
        story.append(Paragraph(safe_text, body))
        story.append(Spacer(1, 15))

    # === FOOTER ===
    story.append(Spacer(1, 20))
    story.append(Paragraph("<font size=9 color=grey>Generated by SatyaSetu.AI Automated Intelligence Framework © 2025</font>", styles["Normal"]))

    # === BUILD PDF ===
    doc.build(story)

    pdf_bytes = buffer.getvalue()
    buffer.close()

    pdf_path = os.path.join(REPORT_DIR, f"forensic_{file_id}.pdf")
    with open(pdf_path, "wb") as f:
        f.write(pdf_bytes)

    return {"pdf_path": pdf_path, "bytes": pdf_bytes}
