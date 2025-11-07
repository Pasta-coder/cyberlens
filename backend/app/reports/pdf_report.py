from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib.enums import TA_LEFT
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader
import os
from datetime import datetime

BLACK = colors.HexColor("#0A0A0A")
CYAN = colors.HexColor("#00C8FF")
WHITE = colors.HexColor("#FFFFFF")
GRAY = colors.HexColor("#E0E0E0")
RED = colors.HexColor("#FF3B3B")
YELLOW = colors.HexColor("#FFB200")
GREEN = colors.HexColor("#00FF85")

def risk_color(level):
    if level == "High": return RED
    if level == "Medium": return YELLOW
    return GREEN

def generate_pdf_report(
        file_id: str,
        raw_text: str,
        entities: list,
        risk_report: list,
        threat_intel: list,
        screenshot_path: str,
        output_path: str
    ):

    doc = SimpleDocTemplate(output_path, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    story = []

    # --- HEADER ---
    title_style = ParagraphStyle(
        name="title",
        fontName="Helvetica-Bold",
        fontSize=20,
        textColor=CYAN,
        alignment=TA_LEFT,
        leading=24
    )
    story.append(Paragraph("CYBERLENS — FORENSIC INTELLIGENCE REPORT", title_style))
    story.append(Spacer(1, 10))

    meta_style = ParagraphStyle(
        name="meta",
        fontName="Courier",
        fontSize=10,
        textColor=GRAY,
        leading=14
    )

    story.append(Paragraph(f"File ID: <b>{file_id}</b>", meta_style))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", meta_style))
    story.append(Spacer(1, 20))

    # --- SCREENSHOT PREVIEW ---
    if os.path.exists(screenshot_path):
        try:
            img = Image(screenshot_path, width=350, height=250)
            story.append(img)
            story.append(Spacer(1, 20))
        except:
            story.append(Paragraph("[ERROR LOADING IMAGE]", meta_style))
            story.append(Spacer(1, 20))

    # --- RAW TEXT ---
    section_title = ParagraphStyle(
        name="section",
        fontName="Helvetica-Bold",
        fontSize=14,
        textColor=CYAN,
        leading=18
    )

    body_style = ParagraphStyle(
        name="body",
        fontName="Courier",
        fontSize=10,
        textColor=GRAY,
        leading=14
    )

    story.append(Paragraph("RAW OCR TEXT", section_title))
    story.append(Spacer(1, 8))
    story.append(Paragraph(raw_text.replace("\n", "<br/>"), body_style))
    story.append(Spacer(1, 20))

    # --- RISK TABLE ---
    story.append(Paragraph("ENTITY RISK ANALYSIS", section_title))
    story.append(Spacer(1, 10))

    table_data = [["Entity", "Type", "Risk", "Tags"]]

    for item in risk_report:
        color = risk_color(item["risk_level"])
        table_data.append([
            item["entity"],
            item["type"],
            Paragraph(f'<font color="{color}"><b>{item["risk_level"]}</b></font>', body_style),
            ", ".join(item["tags"])
        ])

    table = Table(table_data, colWidths=[150, 60, 60, 150])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BLACK),
        ("TEXTCOLOR", (0, 0), (-1, 0), CYAN),
        ("BOX", (0, 0), (-1, -1), 1, CYAN),
        ("GRID", (0, 0), (-1, -1), 0.5, CYAN),
        ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#111")),
        ("TEXTCOLOR", (0, 1), (-1, -1), GRAY),
    ]))

    story.append(table)
    story.append(Spacer(1, 20))

    # --- THREAT INTEL ---
    story.append(Paragraph("OSINT THREAT INTELLIGENCE", section_title))
    story.append(Spacer(1, 10))

    for intel in threat_intel:
        story.append(Paragraph(f"<b>{intel['value']}</b> ({intel['type']})", meta_style))

        if intel["osint"] is None:
            story.append(Paragraph("<i>OSINT not applicable</i>", body_style))
            story.append(Spacer(1, 10))
            continue

        # Each OSINT source
        for src, data in intel["osint"].items():
            story.append(Paragraph(f"- <b>{src.upper()}</b>: {str(data)}", body_style))

        if intel.get("fallback_used"):
            story.append(Paragraph('<font color="#FFB200">[FALLBACK DATA USED]</font>', body_style))

        story.append(Spacer(1, 15))

    doc.build(story)
