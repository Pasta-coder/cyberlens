from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter
from io import BytesIO

def generate_pdf_report(raw_text, entities, risk_report, threat_intel):
    buffer = BytesIO()

    # Create PDF document
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    story.append(Paragraph("<b>CyberLens Forensic Report</b>", styles['Title']))
    story.append(Spacer(1, 20))

    # Raw Text
    story.append(Paragraph("<b>Extracted Text:</b>", styles['Heading2']))
    safe_text = raw_text.replace("\n", "<br/>")
    story.append(Paragraph(safe_text, styles['BodyText']))
    story.append(Spacer(1, 20))

    # Entities
    story.append(Paragraph("<b>Entities:</b>", styles['Heading2']))
    for e in entities:
        story.append(Paragraph(str(e), styles['BodyText']))
    story.append(Spacer(1, 20))

    # Risk Report
    story.append(Paragraph("<b>Risk Report:</b>", styles['Heading2']))
    for r in risk_report:
        story.append(Paragraph(str(r), styles['BodyText']))
    story.append(Spacer(1, 20))

    # OSINT
    story.append(Paragraph("<b>Threat Intelligence:</b>", styles['Heading2']))
    for t in threat_intel:
        story.append(Paragraph(str(t), styles['BodyText']))

    # Build PDF
    doc.build(story)

    pdf_bytes = buffer.getvalue()
    buffer.close()

    return pdf_bytes
