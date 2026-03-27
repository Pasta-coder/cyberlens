"""
🌱 Comprehensive Fiscal Data Seed — 150 Transactions
Designed to demonstrate ALL anomaly detection patterns:
  1. Benford's Law violations (unnatural digit clustering on 4, 9)
  2. Threshold gaming (amounts clustering just below ₹50L, ₹1Cr limits)
  3. Department-level hotspots (Education, PWD have suspicious patterns)
  4. Vendor concentration (same vendors win across departments)
  5. Temporal spikes (March rush — fiscal year-end gaming)
"""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import get_db
import random

random.seed(42)

DEPARTMENTS = [
    "Education", "Health & Family Welfare", "PWD (Roads & Bridges)",
    "Water & Sewage", "Urban Development", "Transport", "Social Welfare",
    "Revenue", "Agriculture", "IT & e-Governance", "Power & Energy",
    "Housing", "Environment", "Tourism"
]

VENDORS = [
    "Ashoka Buildcon Ltd.", "Shapoorji Pallonji", "Larsen & Toubro",
    "NCC Ltd.", "Tata Projects", "JMC Projects India", "HCC Infrastructure",
    "IRB Infrastructure", "Dilip Buildcon", "Afcons Infrastructure",
    "Galaxy Infra", "Singh & Associates", "Rajesh Construction Co.",
    "Metro Solutions Pvt Ltd", "Delhi Infra Services", "Green Earth Tech",
    "National IT Solutions", "Smart City Devices Pvt Ltd",
    "Bharat Heavy Electricals", "Continental Healthcare Supplies",
    "Sunrise Pharma Distributors", "Pinnacle Consulting Group"
]

PURPOSES_BY_DEPT = {
    "Education": ["School building renovation", "Computer lab setup", "Mid-day meal supply", "Teacher training program", "Digital classroom equipment", "Library modernization", "Furniture procurement", "Sports equipment"],
    "Health & Family Welfare": ["Hospital equipment procurement", "Ambulance fleet expansion", "Medicine bulk purchase", "ICU bed installation", "Diagnostic lab upgrade", "Mobile health unit", "Vaccination drive", "PPE kit procurement"],
    "PWD (Roads & Bridges)": ["Road resurfacing work", "Bridge repair & maintenance", "Highway median construction", "Footpath reconstruction", "Drainage improvement", "Street light installation", "Flyover maintenance", "Divider painting"],
    "Water & Sewage": ["Pipeline replacement", "STP plant maintenance", "Water testing lab", "Bore well installation", "Sewer line extension", "Water meter installation", "WTP chemical supply", "Jal Board repairs"],
    "Urban Development": ["Park beautification", "Community center construction", "Solid waste management", "Urban forestry drive", "Public toilet complex", "Market renovation", "Heritage restoration", "Smart city module"],
    "Transport": ["Bus procurement", "Depot upgrade", "ITS system installation", "EV charging stations", "Ticketing system upgrade", "Bus stand renovation", "CCTV for buses", "Route planning software"],
    "Social Welfare": ["Pension distribution system", "Disability aid procurement", "Shelter home maintenance", "Widow pension processing", "Scholarship disbursement", "Ration card verification", "Old age home supplies"],
    "Revenue": ["Land record digitization", "Survey equipment", "RTI documentation system", "Office automation", "Revenue court upgrade"],
    "Agriculture": ["Seed distribution scheme", "Soil testing lab", "Irrigation channel repair", "Farmer training program", "Cold storage facility"],
    "IT & e-Governance": ["Data center upgrade", "E-district portal", "Network infrastructure", "Cyber security audit", "Cloud migration project"],
    "Power & Energy": ["Solar panel installation", "Transformer replacement", "Underground cabling", "Substation upgrade", "Smart meter rollout"],
    "Housing": ["EWS housing construction", "Slum rehabilitation", "DDA flat repair", "Affordable housing project", "Building survey"],
    "Environment": ["Air quality monitoring", "Green belt development", "Waste processing plant", "Electric bus pilot", "River cleanup drive"],
    "Tourism": ["Monument restoration", "Tourist info kiosk", "Heritage walk development", "Promotional campaign", "Wayfinding signage"],
}


def generate_transactions():
    """Generate 150 transactions with deliberate anomaly patterns."""
    transactions = []
    tx_counter = 1

    # ════════════════════════════════════════════════════════════
    # PATTERN 1: Natural Benford-conforming transactions (60 txns)
    # These follow Benford's Law — realistic baseline
    # ════════════════════════════════════════════════════════════
    benford_amounts = [
        # Digit 1 (~30% → 18 txns)
        1250000, 1780000, 1950000, 1100000, 1620000, 15600000,
        12300000, 1890000, 1050000, 10500000, 1340000, 1470000,
        19800000, 18500000, 11200000, 16700000, 1020000, 1560000,
        # Digit 2 (~18% → 11 txns)
        2300000, 2750000, 2100000, 2890000, 21000000, 2650000,
        2480000, 2150000, 2970000, 2050000, 2340000,
        # Digit 3 (~12% → 7 txns)
        3200000, 3750000, 3100000, 3900000, 3450000, 3870000, 3050000,
        # Digit 5 (~8% → 5 txns)
        5200000, 5600000, 5100000, 5800000, 5350000,
        # Digit 6 (~7% → 4 txns)
        6200000, 6700000, 6100000, 6500000,
        # Digit 7 (~6% → 3 txns)
        7200000, 7500000, 7800000,
        # Digit 8 (~5% → 3 txns)
        8200000, 8500000, 8100000,
    ]
    for amt in benford_amounts:
        dept = random.choice(DEPARTMENTS)
        purposes = PURPOSES_BY_DEPT.get(dept, ["General expenditure"])
        month = random.choice(["01", "02", "04", "05", "06", "07", "08", "09", "10", "11"])
        day = random.randint(1, 28)
        transactions.append({
            "id": f"DELHI/FY26/{tx_counter:04d}",
            "dept": dept,
            "amount": amt + random.randint(-50000, 50000),  # slight jitter
            "purpose": random.choice(purposes),
            "vendor": random.choice(VENDORS),
            "date": f"2025-{month}-{day:02d}",
        })
        tx_counter += 1

    # ════════════════════════════════════════════════════════════
    # PATTERN 2: Threshold gaming — just below ₹50 Lakh (20 txns)
    # Approval threshold at ₹50L → amounts cluster at ₹48-49.9L
    # This creates an artificial spike at digit 4
    # ════════════════════════════════════════════════════════════
    threshold_depts = ["Education", "PWD (Roads & Bridges)", "Health & Family Welfare", "Urban Development"]
    threshold_vendors = ["Galaxy Infra", "Singh & Associates", "Rajesh Construction Co.", "Metro Solutions Pvt Ltd"]
    for i in range(20):
        amt = random.randint(4750000, 4990000)  # ₹47.5L to ₹49.9L
        dept = threshold_depts[i % len(threshold_depts)]
        purposes = PURPOSES_BY_DEPT.get(dept, ["General expenditure"])
        # Many in March (fiscal year-end rush)
        month = "03" if i < 12 else random.choice(["01", "02", "11", "12"])
        day = random.randint(15, 28) if month == "03" else random.randint(1, 28)
        transactions.append({
            "id": f"DELHI/FY26/{tx_counter:04d}",
            "dept": dept,
            "amount": amt,
            "purpose": random.choice(purposes),
            "vendor": random.choice(threshold_vendors),
            "date": f"2025-{month}-{day:02d}",
        })
        tx_counter += 1

    # ════════════════════════════════════════════════════════════
    # PATTERN 3: Threshold gaming — just below ₹1 Crore (15 txns)
    # Approval threshold at ₹1Cr → amounts cluster at ₹95L-99.9L
    # This creates an artificial spike at digit 9
    # ════════════════════════════════════════════════════════════
    crore_depts = ["PWD (Roads & Bridges)", "Water & Sewage", "Housing", "Power & Energy"]
    crore_vendors = ["Ashoka Buildcon Ltd.", "NCC Ltd.", "Dilip Buildcon", "IRB Infrastructure"]
    for i in range(15):
        amt = random.randint(9500000, 9990000)  # ₹95L to ₹99.9L
        dept = crore_depts[i % len(crore_depts)]
        purposes = PURPOSES_BY_DEPT.get(dept, ["General expenditure"])
        month = "03" if i < 8 else random.choice(["02", "09", "12"])
        day = random.randint(20, 28) if month == "03" else random.randint(1, 28)
        transactions.append({
            "id": f"DELHI/FY26/{tx_counter:04d}",
            "dept": dept,
            "amount": amt,
            "purpose": random.choice(purposes),
            "vendor": random.choice(crore_vendors),
            "date": f"2025-{month}-{day:02d}",
        })
        tx_counter += 1

    # ════════════════════════════════════════════════════════════
    # PATTERN 4: Large legitimate transactions (15 txns)
    # High-value infra projects — these are normal
    # ════════════════════════════════════════════════════════════
    large_amounts = [
        15000000, 22000000, 35000000, 42000000, 18000000,
        27000000, 31000000, 55000000, 65000000, 12000000,
        48000000, 72000000, 25000000, 38000000, 19500000,
    ]
    for i, amt in enumerate(large_amounts):
        dept = random.choice(["PWD (Roads & Bridges)", "Water & Sewage", "Housing", "Transport", "Power & Energy"])
        purposes = PURPOSES_BY_DEPT.get(dept, ["Infrastructure project"])
        month = random.choice(["01", "04", "06", "08", "10"])
        transactions.append({
            "id": f"DELHI/FY26/{tx_counter:04d}",
            "dept": dept,
            "amount": amt + random.randint(-200000, 200000),
            "purpose": random.choice(purposes),
            "vendor": random.choice(["Larsen & Toubro", "Tata Projects", "Shapoorji Pallonji", "Afcons Infrastructure", "Bharat Heavy Electricals"]),
            "date": f"2025-{month}-{random.randint(1, 28):02d}",
        })
        tx_counter += 1

    # ════════════════════════════════════════════════════════════
    # PATTERN 5: Suspicious same-vendor concentration (15 txns)
    # Single vendor dominates in one department
    # ════════════════════════════════════════════════════════════
    suspicious_vendor = "Pinnacle Consulting Group"
    for i in range(15):
        amt = random.choice([4800000, 4850000, 4900000, 4950000, 3200000, 3500000, 2800000, 2100000])
        purposes = PURPOSES_BY_DEPT.get("IT & e-Governance", ["IT project"])
        month = random.choice(["01", "02", "03", "05", "07", "09", "11"])
        transactions.append({
            "id": f"DELHI/FY26/{tx_counter:04d}",
            "dept": random.choice(["IT & e-Governance", "Revenue", "Education"]),
            "amount": amt + random.randint(-20000, 20000),
            "purpose": random.choice(purposes),
            "vendor": suspicious_vendor,
            "date": f"2025-{month}-{random.randint(1, 28):02d}",
        })
        tx_counter += 1

    # ════════════════════════════════════════════════════════════
    # PATTERN 6: Micro-transactions (split payments) (15 txns)
    # To show payment splitting patterns
    # ════════════════════════════════════════════════════════════
    for i in range(15):
        amt = random.randint(450000, 499000)  # ₹4.5L to ₹4.99L (below ₹5L review threshold)
        dept = random.choice(["Education", "Social Welfare", "Agriculture"])
        purposes = PURPOSES_BY_DEPT.get(dept, ["Misc"])
        month = random.choice(["03", "03", "03", "09", "12"])  # heavy March clustering
        transactions.append({
            "id": f"DELHI/FY26/{tx_counter:04d}",
            "dept": dept,
            "amount": amt,
            "purpose": random.choice(purposes),
            "vendor": random.choice(["Singh & Associates", "Galaxy Infra", "Delhi Infra Services"]),
            "date": f"2025-{month}-{random.randint(1, 28):02d}",
        })
        tx_counter += 1

    # ════════════════════════════════════════════════════════════
    # PATTERN 7: Round-number payments (10 txns)
    # Exact round amounts are suspicious in government spending
    # ════════════════════════════════════════════════════════════
    round_amounts = [
        1000000, 2000000, 5000000, 3000000, 10000000,
        1500000, 2500000, 4000000, 7500000, 500000,
    ]
    for i, amt in enumerate(round_amounts):
        dept = random.choice(DEPARTMENTS)
        purposes = PURPOSES_BY_DEPT.get(dept, ["Expenditure"])
        transactions.append({
            "id": f"DELHI/FY26/{tx_counter:04d}",
            "dept": dept,
            "amount": amt,
            "purpose": random.choice(purposes),
            "vendor": random.choice(VENDORS),
            "date": f"2025-{random.choice(['01','02','03','04','05','06','07','08','09','10','11','12'])}-{random.randint(1,28):02d}",
        })
        tx_counter += 1

    random.shuffle(transactions)
    return transactions


def seed():
    print("🌱 Seeding 150 diverse fiscal transactions...")
    transactions = generate_transactions()

    with get_db() as conn:
        with conn.cursor() as cur:
            # Clear existing fiscal data
            cur.execute("DELETE FROM fiscal_transactions")
            print("  🗑️  Cleared old fiscal data")

            # Insert new data
            for tx in transactions:
                cur.execute(
                    """INSERT INTO fiscal_transactions 
                       (transaction_id, department, amount, purpose, vendor, date, batch_id)
                       VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                    (
                        tx["id"],
                        tx["dept"],
                        tx["amount"],
                        tx["purpose"],
                        tx["vendor"],
                        tx["date"],
                        "SEED-DEMO-2026",
                    ),
                )

            print(f"  ✅ Inserted {len(transactions)} transactions")

            # Verify patterns
            cur.execute("SELECT COUNT(*) as n FROM fiscal_transactions")
            total = cur.fetchone()["n"]

            cur.execute("""
                SELECT LEFT(CAST(amount AS TEXT), 1) as digit, COUNT(*) as cnt 
                FROM fiscal_transactions 
                WHERE amount > 0
                GROUP BY LEFT(CAST(amount AS TEXT), 1) 
                ORDER BY digit
            """)
            digit_dist = cur.fetchall()

            print(f"\n📊 Digit Distribution (total={total}):")
            for row in digit_dist:
                pct = round(row["cnt"] / total * 100, 1)
                bar = "█" * int(pct / 2)
                print(f"  Digit {row['digit']}: {row['cnt']:3d} ({pct:5.1f}%) {bar}")

            cur.execute("""
                SELECT COUNT(*) as n FROM fiscal_transactions 
                WHERE amount BETWEEN 4750000 AND 5000000
            """)
            near_50l = cur.fetchone()["n"]

            cur.execute("""
                SELECT COUNT(*) as n FROM fiscal_transactions 
                WHERE amount BETWEEN 9500000 AND 10000000
            """)
            near_1cr = cur.fetchone()["n"]

            print(f"\n🎯 Threshold Gaming:")
            print(f"  Near ₹50L (₹47.5-50L): {near_50l} transactions")
            print(f"  Near ₹1Cr (₹95L-1Cr):  {near_1cr} transactions")

            cur.execute("""
                SELECT department, COUNT(*) as cnt, SUM(amount) as total
                FROM fiscal_transactions
                GROUP BY department
                ORDER BY total DESC
                LIMIT 5
            """)
            dept_summary = cur.fetchall()
            print(f"\n🏛️ Top 5 Departments:")
            for d in dept_summary:
                print(f"  {d['department']:30s} → {d['cnt']:3d} txns, ₹{d['total']/10000000:.2f} Cr")

    print("\n🎉 Seed complete!")


if __name__ == "__main__":
    seed()
