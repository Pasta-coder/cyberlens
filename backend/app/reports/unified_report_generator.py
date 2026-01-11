import os
import json
from fpdf import FPDF
import matplotlib.pyplot as plt
import io
import base64

CACHE_DIR = "app/data/analysis_cache"
REPORTS_DIR = "app/reports"
os.makedirs(REPORTS_DIR, exist_ok=True)


# --- Utility: Encode Matplotlib figure to base64 ---
def fig_to_base64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight")
    buf.seek(0)
    img_b64 = base64.b64encode(buf.read()).decode("utf-8")
    plt.close(fig)
    return img_b64


# --- 1️⃣ Generate charts dynamically ---
def generate_charts(summary):
    charts = {}

    # Pie chart: Scam category distribution
    if summary["categories"]:
        fig, ax = plt.subplots(figsize=(4, 4))
        labels = list(summary["categories"].keys())
        sizes = list(summary["categories"].values())
        ax.pie(sizes, labels=labels, autopct="%1.1f%%", startangle=140)
        ax.set_title("Scam Category Distribution")
        charts["categories_pie"] = fig_to_base64(fig)

    # Risk histogram
    fig, ax = plt.subplots(figsize=(4, 3))
    risks = [summary["average_risk"]] * summary["total_cases"]
    ax.bar(["Avg Risk"], risks, color="crimson")
    ax.set_ylim(0, 100)
    ax.set_ylabel("Risk Score")
    ax.set_title("Average Risk Level")
    charts["risk_bar"] = fig_to_base64(fig)

    return charts


# --- 2️⃣ Generate the PDF ---
def generate_unified_report(batch_id: str):
    batch_path = os.path.join(CACHE_DIR, f"batch_{batch_id}.json")

    if not os.path.exists(batch_path):
        return {"error": "Batch data not found", "batch_id": batch_id}

    with open(batch_path, "r") as f:
        batch_data = json.load(f)

    summary = batch_data["summary"]
    cases = batch_data["cases"]

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Header
    pdf.set_font("Helvetica", "B", 20)
    pdf.cell(0, 10, "SatyaSetu.AI Unified Intelligence Report", ln=True, align="C")
    pdf.ln(8)

    # --- Executive Summary ---
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, "1. Executive Summary", ln=True)
    pdf.set_font("Helvetica", "", 12)
    pdf.multi_cell(
        0, 8,
        f"""
Total Cases: {summary['total_cases']}
Unique Entities: {summary['unique_entities']}
Average Risk Score: {summary['average_risk']}%
Dominant Scam Category: {summary['dominant_category']}
"""
    )
    pdf.ln(5)

    # --- Charts Section ---
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, "2. Intelligence Visualizations", ln=True)
    pdf.set_font("Helvetica", "", 12)

    charts = generate_charts(summary)
    for label, b64img in charts.items():
        img_data = base64.b64decode(b64img)
        img_stream = io.BytesIO(img_data)
        pdf.image(img_stream, x=None, w=150)
        pdf.ln(5)

    # --- Case Findings ---
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, "3. Individual Case Findings", ln=True)
    pdf.set_font("Helvetica", "", 11)

    for idx, case in enumerate(cases, 1):
        pdf.ln(6)
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 10, f"Case #{idx} — {case['file_id']}", ln=True)
        pdf.set_font("Helvetica", "", 11)
        pdf.multi_cell(
            0, 7,
            f"""
Scam Category: {case['scam_class'].get('category', 'N/A')}
Risk Score: {case['risk'].get('score', 'N/A')}
Entities Found: {len(case['entities'])}
URLs/QRs Detected: {len(case['url_qr_findings'])}
"""
        )

    # --- Save the PDF ---
    pdf_path = os.path.join(REPORTS_DIR, f"unified_report_{batch_id}.pdf")
    pdf.output(pdf_path)
    return {"pdf_path": pdf_path, "batch_id": batch_id}
