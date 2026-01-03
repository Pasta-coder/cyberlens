# Government Procurement Fraud Detection Dashboard Components

## Overview

This directory contains React components for visualizing and analyzing government procurement data for fraud detection. All components are **frontend-only** and consume data from APIs or mock JSON files. No ML models or algorithmic logic is implemented in these components.

## Components

### 1. `SummaryCards.tsx`
**Purpose:** Display top-line KPIs at a glance

**Props:**
```typescript
{
  data: {
    total_spend: number;
    tenders_analyzed: number;
    high_risk_tenders: number;
    departments_flagged: number;
  }
}
```

**Features:**
- Four cards showing key metrics
- Plain-language explainers for each metric
- Color-coded indicators
- Responsive grid layout

---

### 2. `BenfordChart.tsx`
**Purpose:** Statistical analysis visualization using Benford's Law

**Props:**
```typescript
{
  data: {
    counts: Record<string, number>; // Digit frequencies
    mad: number; // Mean Absolute Deviation
    chi2: number; // Chi-square statistic
  }
}
```

**Features:**
- Bar chart comparing observed vs expected digit frequencies
- MAD score interpretation with traffic-light indicators
- Interactive tooltips with examples
- "How to read" help panel

**Interpretation Logic:**
- MAD < 0.006: Normal (Green)
- MAD 0.006-0.015: Moderate (Yellow)
- MAD > 0.015: High Risk (Red)

---

### 3. `ProcurementFunnel.tsx`
**Purpose:** Visualize tender lifecycle drop-offs

**Props:**
```typescript
{
  data: {
    published: number;
    bids_received: number;
    contracts_awarded: number;
  }
}
```

**Features:**
- Three-stage funnel visualization
- Drop-off percentages between stages
- Average bidders calculation
- Plain-language takeaways

**Red Flags:**
- Average bidders < 2: Critical
- Average bidders < 3: Warning

---

### 4. `LeaderboardTable.tsx`
**Purpose:** Sortable table of high-risk entities

**Props:**
```typescript
{
  data: Array<{
    entity_id: string;
    name: string;
    total_spend: number;
    risk_score: number;
    single_bid_pct: number;
  }>
}
```

**Features:**
- Sortable columns
- Mini sparkline charts
- Risk color-coding
- "View evidence" buttons
- Show more/less functionality

---

### 5. `TrendChart.tsx`
**Purpose:** Time series visualization of risk metrics

**Props:**
```typescript
{
  data: Array<{
    month: string;
    cri_avg: number;
    tenders: number;
    single_bid_rate?: number;
  }>
}
```

**Features:**
- Multi-line chart with toggleable metrics
- Trend summary cards
- Dual Y-axis support
- Month-over-month comparison

---

### 6. `IntegrityHeatmap.tsx`
**Purpose:** Regional risk visualization (simplified choropleth)

**Props:**
```typescript
{
  regions: Array<{
    region_code: string;
    region_name: string;
    cri_score: number;
    total_spend: number;
    red_flags: string[];
  }>
}
```

**Features:**
- Grid-based regional visualization
- Color-coded by risk level
- Click-to-expand details panel
- Red flag indicators

**Color Scheme:**
- Green: 0-29
- Yellow: 30-49
- Orange: 50-69
- Red: 70+

---

### 7. `CartelRadar.tsx`
**Purpose:** Network relationship visualization

**Props:**
```typescript
{
  buyers: Array<{
    id: string;
    name: string;
    contracts: number;
    total_spend: number;
    risk_score: number;
  }>;
  suppliers: Array<{ /* same structure */ }>;
  edges: Array<{
    buyer_id: string;
    supplier_id: string;
    contracts: number;
    value: number;
  }>;
}
```

**Features:**
- Buyer-supplier relationship mapping
- Monopoly pattern detection (70%+ concentration)
- Interactive entity selection
- Integrated ExplainPanel

---

### 8. `ExplainPanel.tsx`
**Purpose:** AI-generated narrative explanations

**Props:**
```typescript
{
  entityName: string;
  entityType: "buyer" | "supplier";
  riskScore: number;
  totalContracts: number;
  totalSpend: number;
  fraudSignals: Array<{
    signal_type: string;
    description: string;
    severity: "high" | "medium" | "low";
  }>;
  sampleContracts?: Array<{
    id: string;
    title: string;
    value: number;
  }>;
}
```

**Features:**
- Plain-language narrative generation
- Fraud signal display
- Sample contract list
- Action buttons

---

### 9. `ExportControls.tsx`
**Purpose:** Export dashboard data/reports

**Props:**
```typescript
{
  dashboardData: any;
  onExport?: (format: "pdf" | "json") => void;
}
```

**Features:**
- PDF/TXT report export (UI only)
- JSON data export
- Export status indicators
- Open data compliance notes

---

### 10. `HowToReadModal.tsx` (in `src/components/ui/`)
**Purpose:** User guidance and documentation

**Props:**
```typescript
{
  isOpen: boolean;
  onClose: () => void;
}
```

**Features:**
- Risk level explanations
- Visualization guides
- Common red flags list
- Action recommendations

---

## Usage Example

```tsx
import SummaryCards from "@/components/dashboard/SummaryCards";
import BenfordChart from "@/components/dashboard/BenfordChart";
import mockData from "@/mock/dashboard-sample.json";

export default function DashboardPage() {
  return (
    <div>
      <SummaryCards data={mockData.summary} />
      <BenfordChart data={mockData.benford} />
      {/* ... other components */}
    </div>
  );
}
```

## Running with Mock Data

If the backend is unavailable, components fall back to mock data:

```typescript
import mockData from "@/mock/dashboard-sample.json";

// Use in your page
<SummaryCards data={mockData.summary} />
```

## Accessibility

All components include:
- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly text
- High contrast mode support

## Styling

Components use:
- Tailwind CSS utility classes
- Framer Motion for animations
- Recharts for charts
- Consistent color palette:
  - Primary: #00C8FF (Cyan)
  - Danger: #EF4444 (Red)
  - Warning: #F59E0B (Yellow)
  - Success: #10B981 (Green)

## Testing

Run component tests:
```bash
npm test
```

## Development

Start Storybook (if available):
```bash
npm run storybook
```

## Notes

- **No ML Logic:** All risk scores, CRI values, and fraud signals come from API responses or mock data
- **Plain Language:** All technical indicators are translated to citizen-friendly explanations
- **Mobile-First:** All components are responsive and work on mobile devices
- **Open Data:** Export functionality supports open data initiatives

## Contributing

When adding new components:
1. Include TypeScript interfaces
2. Add accessibility labels
3. Provide plain-language explainers
4. Update this README
5. Add unit tests

---

**Last Updated:** January 2026  
**Version:** 1.0.0
