/**
 * Benford's Law Utilities
 * Research → Data Mapping → Anomaly Detection
 * 
 * Frontend-only statistical calculations for visual analytics.
 * No ML models, no enforcement actions - indicators for review only.
 */

// ============================================================================
// 1️⃣ RESEARCH EXPECTATION: Benford's Law Distribution
// ============================================================================

/**
 * Benford's Law Expected Frequencies (Global Research Standard)
 * Used by auditors worldwide, including CAG-cited studies
 */
export const BENFORD_EXPECTED = {
  1: 30.1,
  2: 17.6,
  3: 12.5,
  4: 9.7,
  5: 7.9,
  6: 6.7,
  7: 5.8,
  8: 5.1,
  9: 4.6,
} as const;

// ============================================================================
// 2️⃣ DATA MAPPING: Transaction Interface
// ============================================================================

export interface Transaction {
  id: string;
  date: string;
  department: string;
  amount: number;
  vendor?: string;
  purpose?: string;
}

export interface BenfordAnalysisResult {
  observed: Record<number, number>; // Digit → percentage
  expected: Record<number, number>; // Digit → percentage (Benford)
  deviations: Array<{
    digit: number;
    deviation: number; // How much observed exceeds expected
    isAnomaly: boolean; // True if deviation is significant
  }>;
  sampleSize: number;
  interpretation: string; // Plain-language explanation
  requiresReview: boolean;
}

// ============================================================================
// 3️⃣ UTILITY FUNCTIONS: Extract First Digit
// ============================================================================

/**
 * Extract the first non-zero digit from a transaction amount
 * Example: 9900 → 9, 12345 → 1, 0.5 → 5
 */
export function getFirstDigit(amount: number): number | null {
  const absAmount = Math.abs(amount);
  if (absAmount === 0) return null;
  
  // Convert to string and remove decimal point
  const amountStr = absAmount.toString().replace('.', '');
  
  // Find first non-zero digit
  for (let i = 0; i < amountStr.length; i++) {
    const digit = parseInt(amountStr[i]);
    if (digit !== 0) return digit;
  }
  
  return null;
}

/**
 * Calculate observed frequency distribution of leading digits
 */
export function calculateObservedFrequency(transactions: Transaction[]): Record<number, number> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  let validCount = 0;

  transactions.forEach(tx => {
    const digit = getFirstDigit(tx.amount);
    if (digit && digit >= 1 && digit <= 9) {
      counts[digit]++;
      validCount++;
    }
  });

  // Convert to percentages
  const percentages: Record<number, number> = {};
  for (let d = 1; d <= 9; d++) {
    percentages[d] = validCount > 0 ? (counts[d] / validCount) * 100 : 0;
  }

  return percentages;
}

// ============================================================================
// 4️⃣ ANOMALY DETECTION: Deviation Analysis
// ============================================================================

/**
 * Analyze transactions for Benford's Law deviations
 * Returns visual anomaly data for charting
 */
export function analyzeBenfordDeviations(transactions: Transaction[]): BenfordAnalysisResult {
  const sampleSize = transactions.length;
  
  // Minimum sample size check
  if (sampleSize < 50) {
    return {
      observed: {},
      expected: BENFORD_EXPECTED,
      deviations: [],
      sampleSize,
      interpretation: 'Sample size too small for reliable Benford analysis (minimum 50 transactions recommended).',
      requiresReview: false,
    };
  }

  const observed = calculateObservedFrequency(transactions);
  const deviations: Array<{ digit: number; deviation: number; isAnomaly: boolean }> = [];
  
  let maxDeviation = 0;
  let maxDeviationDigit = 0;
  let anomalyCount = 0;

  // Calculate deviations for each digit
  for (let digit = 1; digit <= 9; digit++) {
    const obs = observed[digit] || 0;
    const exp = BENFORD_EXPECTED[digit as keyof typeof BENFORD_EXPECTED];
    const deviation = obs - exp;
    
    // Flag as anomaly if deviation exceeds 5 percentage points
    const isAnomaly = Math.abs(deviation) > 5;
    
    if (isAnomaly) anomalyCount++;
    
    if (Math.abs(deviation) > Math.abs(maxDeviation)) {
      maxDeviation = deviation;
      maxDeviationDigit = digit;
    }

    deviations.push({
      digit,
      deviation,
      isAnomaly,
    });
  }

  // Generate interpretation
  let interpretation = '';
  let requiresReview = false;

  if (anomalyCount === 0) {
    interpretation = 'Digit distribution conforms to Benford\'s Law expectations. No significant anomalies detected.';
    requiresReview = false;
  } else {
    const obsPercent = observed[maxDeviationDigit] || 0;
    const expPercent = BENFORD_EXPECTED[maxDeviationDigit as keyof typeof BENFORD_EXPECTED];
    const ratio = (obsPercent / expPercent).toFixed(1);
    
    interpretation = `Transactions starting with digit '${maxDeviationDigit}' appear ${ratio}× more frequently than expected (${obsPercent.toFixed(1)}% observed vs ${expPercent}% expected). `;
    interpretation += 'This pattern is consistent with spending clustered just below approval thresholds (e.g., ₹10,000 / ₹1,00,000). ';
    interpretation += 'This does not prove wrongdoing but indicates a high-priority audit signal.';
    requiresReview = true;
  }

  return {
    observed,
    expected: BENFORD_EXPECTED,
    deviations,
    sampleSize,
    interpretation,
    requiresReview,
  };
}

// ============================================================================
// 5️⃣ FORMATTING UTILITIES
// ============================================================================

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format large numbers in Indian numbering system (Lakhs/Crores)
 */
export function formatIndianNumber(num: number): string {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(2)} K`;
  }
  return `₹${num.toFixed(0)}`;
}
