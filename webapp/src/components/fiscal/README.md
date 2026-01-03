# Fiscal Leakage Dashboard Components

## Architecture: Research → Data → Anomaly Framework

This dashboard follows a **consistent 3-step pattern** that can be applied across multiple governance domains.

---

## 🎯 The Framework

### Step 1: Research Expectation
**Component**: `ResearchExplanationCard.tsx`
- Explains the research foundation (Benford's Law)
- No formulas shown to user
- Lists key principles and global sources
- Policy-safe language throughout

### Step 2: Data Mapping
**Utility**: `src/lib/benford.ts`
- Extracts transaction amounts from API/mock JSON
- Computes first non-zero digit (1-9)
- Calculates frequency distribution
- Converts to percentages

### Step 3: Anomaly Visualization
**Component**: `BenfordAnomalyGraph.tsx`
- Bar + Line composite chart (Recharts)
- Blue bars = Observed frequencies
- Red line = Benford's Law expectations
- **Visual Rule**: Bars exceeding line by >5% turn RED automatically
- Tooltip shows exact percentages and deviations

### Step 4: Interpretation
**Component**: `InterpretationPanel.tsx`
- Auto-generated plain-language explanation
- Targeted at judges, auditors, policymakers
- States what anomaly means, recommended actions, legal disclaimer
- Example: *"Transactions starting with digit '9' appear 4× more frequently than expected..."*

---

## 📁 File Structure

```
src/
├── components/
│   └── fiscal/
│       ├── ResearchExplanationCard.tsx  # Step 1: Research foundation
│       ├── BenfordAnomalyGraph.tsx      # Step 3: Visual anomaly detection
│       ├── InterpretationPanel.tsx      # Step 4: Plain-language findings
│       └── README.md                    # This file
├── lib/
│   └── benford.ts                       # Step 2: Data mapping utilities
└── app/
    └── fiscal/
        └── page.tsx                     # Main dashboard page
```

---

## 🔧 How to Use

### Development Mode
```bash
npm run dev
```

Navigate to: **http://localhost:3000/fiscal**

### Data Sources
The dashboard attempts to fetch from:
1. `/api/spend/transactions` (backend API - if available)
2. `/mock/fiscal-sample.json` (fallback)

### Switching API ↔ Mock Mode
Edit `src/app/fiscal/page.tsx`:

```typescript
// Current: Falls back to mock
const response = await fetch('/mock/fiscal-sample.json');

// To use API (when backend available):
const response = await fetch('/api/spend/transactions');
```

---

## 📊 Data Contract

### Required JSON Structure
```json
{
  "summary": {
    "total_transactions": 45231,
    "total_spend": 987654321,
    "departments_analyzed": 24
  },
  "transactions_sample": [
    {
      "id": "TX-1001",
      "date": "2024-06-12",
      "department": "Education",
      "amount": 9900,
      "vendor": "Stationery Pvt Ltd",
      "purpose": "Stationery Purchase"
    }
  ],
  "departments": [...]
}
```

### Transaction Interface
```typescript
interface Transaction {
  id: string;
  date: string;
  department: string;
  amount: number;
  vendor?: string;
  purpose?: string;
}
```

---

## 🎨 Visual Rules

### Anomaly Detection Logic
- **Normal (Blue Bar)**: Deviation < 5 percentage points from Benford expectation
- **Anomaly (Red Bar)**: Deviation ≥ 5 percentage points
- **Red Line**: Benford's Law expected distribution (global standard)

### Example
- Expected for digit '9': 4.6%
- Observed: 22%
- Deviation: +17.4 percentage points → **RED BAR**
- Interpretation: "4× more frequent than expected"

---

## 🧪 Key Functions

### `getFirstDigit(amount: number): number | null`
Extracts first non-zero digit from transaction amount.

```typescript
getFirstDigit(9900)   // Returns 9
getFirstDigit(12345)  // Returns 1
getFirstDigit(0.567)  // Returns 5
```

### `analyzeBenfordDeviations(transactions: Transaction[]): BenfordAnalysisResult`
Main analysis function that:
1. Calculates observed frequencies
2. Compares to Benford expectations
3. Flags anomalies (>5% deviation)
4. Generates plain-language interpretation

Returns:
```typescript
{
  observed: { 1: 28.5, 2: 18.2, ..., 9: 22.1 },
  expected: { 1: 30.1, 2: 17.6, ..., 9: 4.6 },
  deviations: [
    { digit: 9, deviation: 17.5, isAnomaly: true },
    ...
  ],
  sampleSize: 4520,
  interpretation: "Transactions starting with digit '9'...",
  requiresReview: true
}
```

---

## ⚠️ Important Constraints

### ❌ What This Dashboard Does NOT Do
- No backend services or APIs
- No legal conclusions or enforcement
- No "fraud" accusations (uses "statistical anomaly")
- No ML model training or prediction pipelines

### ✅ What This Dashboard DOES
- Frontend visual analytics only
- Client-side math for visualization
- Policy-safe language throughout
- Indicators for review, not definitive proof

---

## 🎓 Research Foundation

### Benford's Law Expected Distribution
| Digit | Expected % |
|-------|-----------|
| 1     | 30.1%     |
| 2     | 17.6%     |
| 3     | 12.5%     |
| 4     | 9.7%      |
| 5     | 7.9%      |
| 6     | 6.7%      |
| 7     | 5.8%      |
| 8     | 5.1%      |
| 9     | 4.6%      |

### Sources
- Comptroller & Auditor General (CAG) methodology
- Nigrini, M. (1996) - Digital Analysis in Auditing
- Adopted by IRS, FBI, and global audit bodies

---

## 📝 Sample Interpretation Output

### When Anomaly Detected:
> "Transactions starting with digit '9' appear 4.8× more frequently than expected (22.1% observed vs 4.6% expected). This pattern is consistent with spending clustered just below approval thresholds (e.g., ₹10,000 / ₹1,00,000). This does not prove wrongdoing but indicates a high-priority audit signal."

### When No Anomaly:
> "Digit distribution conforms to Benford's Law expectations. No significant anomalies detected."

---

## 🚀 Testing

### Quick Test
1. Open http://localhost:3000/fiscal
2. Verify all 4 steps render:
   - Research Explanation Card (blue)
   - Data Mapping section (green) 
   - Anomaly Graph (chart with bars + line)
   - Interpretation Panel (purple)
3. Hover over bars → tooltips appear
4. Check for red bars if anomalies exist

### Sample Size Warning
If transactions < 50, dashboard shows:
> "Sample size too small for reliable Benford analysis (minimum 50 transactions recommended)."

---

## 📞 Support

### Common Issues

**Issue**: Chart shows no data
- Check `/mock/fiscal-sample.json` exists and has `transactions_sample` array
- Verify `public/mock/fiscal-sample.json` is accessible

**Issue**: All bars are blue (no anomalies)
- This is expected if data conforms to Benford's Law
- Try adding more transactions with digit '9' to test red bar rendering

**Issue**: TypeScript errors
- Run `npm install recharts`
- Verify `src/lib/benford.ts` exports are correct

---

**Last Updated**: January 3, 2026  
**Version**: 1.0.0  
**Framework**: Research → Data → Anomaly
