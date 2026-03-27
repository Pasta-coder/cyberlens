'use client';

import React, { useState } from 'react';
import { Zap, Eye, ChevronDown, ChevronUp, Banknote } from 'lucide-react';

interface AnomalousTransaction {
  id: string;
  department: string;
  amount: number;
  purpose: string;
  vendor?: string;
  date?: string;
  proximity_to?: number;
  proximity_pct?: number;
}

interface AnomalySpotlightProps {
  transactions: AnomalousTransaction[];
  benfordAnomalies?: Array<{
    digit: number;
    observed: number;
    expected: number;
    deviation: number;
  }>;
}

export default function AnomalySpotlight({ transactions, benfordAnomalies = [] }: AnomalySpotlightProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleTx = expanded ? transactions : transactions.slice(0, 5);

  if (transactions.length === 0 && benfordAnomalies.length === 0) return null;

  // Find the most anomalous digits
  const topAnomalies = benfordAnomalies
    .filter(a => Math.abs(a.deviation) > 3)
    .sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));

  return (
    <div className="bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 rounded-xl border-2 border-red-200 shadow-sm overflow-hidden">
      {/* Animated header */}
      <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-orange-500 p-5 text-white overflow-hidden">
        {/* Subtle pulse animation */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-24 h-24 bg-white/20 rounded-full -translate-x-8 -translate-y-8 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 translate-y-12 animate-pulse" style={{ animationDelay: '500ms' }} />
        </div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Anomaly Spotlight</h3>
              <p className="text-sm text-red-100">
                {transactions.length} flagged transactions · {topAnomalies.length} digit anomalies
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black">{transactions.length}</p>
            <p className="text-xs text-red-200">Alerts</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Benford digit anomaly cards */}
        {topAnomalies.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4 text-red-500" />
              Benford's Law Digit Anomalies
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {topAnomalies.slice(0, 3).map((anomaly, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg p-4 border border-red-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                      Digit {anomaly.digit}
                    </span>
                    <span className="text-xs text-gray-400">
                      {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation.toFixed(1)}pp
                    </span>
                  </div>
                  <div className="flex justify-between items-end mt-3">
                    <div>
                      <p className="text-xs text-gray-500">Observed</p>
                      <p className="text-xl font-black text-red-600">{anomaly.observed.toFixed(1)}%</p>
                    </div>
                    <div className="text-2xl text-gray-300 font-light">→</div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Expected</p>
                      <p className="text-xl font-black text-green-600">{anomaly.expected.toFixed(1)}%</p>
                    </div>
                  </div>
                  {/* Deviation bar */}
                  <div className="mt-3 h-1.5 bg-green-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(Math.abs(anomaly.deviation) * 5, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    {anomaly.deviation > 0
                      ? `Over-represented by ${Math.abs(anomaly.deviation).toFixed(1)} percentage points`
                      : `Under-represented by ${Math.abs(anomaly.deviation).toFixed(1)} percentage points`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flagged transaction list */}
        {transactions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Banknote className="h-4 w-4 text-orange-500" />
              Suspicious Transactions
            </h4>
            <div className="space-y-2">
              {visibleTx.map((tx, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg p-3 border border-gray-200 hover:border-red-300 transition-colors flex items-center gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-red-600">!{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-500">{tx.id}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-600">{tx.department}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{tx.purpose}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono font-bold text-red-600 text-sm">
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </p>
                    {tx.proximity_pct && (
                      <p className="text-[10px] text-orange-500 font-medium">
                        {tx.proximity_pct}% of {tx.proximity_to && tx.proximity_to >= 10000000 ? '₹1Cr' : '₹50L'} limit
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {transactions.length > 5 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-3 w-full py-2 text-sm font-medium text-red-600 hover:text-red-700 flex items-center justify-center gap-1 transition-colors"
              >
                {expanded ? (
                  <>Show Less <ChevronUp className="h-4 w-4" /></>
                ) : (
                  <>Show All {transactions.length} Transactions <ChevronDown className="h-4 w-4" /></>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
