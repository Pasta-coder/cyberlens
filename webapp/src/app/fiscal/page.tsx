'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, AlertTriangle } from 'lucide-react';
import ResearchExplanationCard from '@/components/fiscal/ResearchExplanationCard';
import BenfordAnomalyGraph from '@/components/fiscal/BenfordAnomalyGraph';
import InterpretationPanel from '@/components/fiscal/InterpretationPanel';
import { Transaction } from '@/lib/benford';

interface FiscalData {
  summary: {
    total_transactions: number;
    total_spend: number;
    departments_analyzed: number;
  };
  transactions_sample: Transaction[];
  departments: Array<{
    dept_id: string;
    name: string;
    total_spend: number;
    transactions_count: number;
  }>;
}

export default function FiscalPage() {
  const [data, setData] = useState<FiscalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFiscalData();
  }, []);

  const loadFiscalData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try API first (will 404), then fallback to mock
      const response = await fetch('/mock/fiscal-sample.json');
      if (!response.ok) {
        throw new Error('Failed to load fiscal data');
      }
      const fiscalData = await response.json();
      setData(fiscalData);
    } catch (err) {
      console.error('Error loading fiscal data:', err);
      setError('Unable to load fiscal data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading fiscal leakage analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-red-200 p-8 max-w-md text-center shadow-lg">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Data Unavailable</h2>
          <p className="text-gray-600 mb-4">{error || 'Unable to load fiscal data'}</p>
          <button
            onClick={loadFiscalData}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 md:py-16 px-4 md:px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-4 mb-4">
            <BarChart3 className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0" />
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
                Fiscal Leakage Detection
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-2">
                Research → Data Mapping → Anomaly Visualization Framework
              </p>
              <p className="text-sm md:text-base text-blue-200 max-w-3xl">
                Applying Benford's Law to Delhi government spending data to identify statistical 
                deviations that warrant audit review. Not a fraud accusation — a data-driven signal.
              </p>
            </div>
          </div>
          
          {/* Stats Banner */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-blue-200 mb-1">Total Transactions</p>
              <p className="text-2xl font-bold">{data.summary.total_transactions.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-blue-200 mb-1">Total Spend</p>
              <p className="text-2xl font-bold">₹{(data.summary.total_spend / 10000000).toFixed(2)} Cr</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-blue-200 mb-1">Departments Analyzed</p>
              <p className="text-2xl font-bold">{data.summary.departments_analyzed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8 md:space-y-12">
        {/* Step 1: Research Expectation */}
        <section>
          <ResearchExplanationCard domain="fiscal" />
        </section>

        {/* Step 2: Data Mapping (Implicit - handled in utility) */}
        <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-green-600 rounded-lg p-2">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Data Mapping
                <span className="text-xs font-normal text-green-600 bg-green-100 px-2 py-1 rounded">
                  Step 2: Delhi Government Data
                </span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Extracted <strong>{data.transactions_sample.length}</strong> transaction amounts → 
                Computed first non-zero digit → Calculated frequency distribution
              </p>
            </div>
          </div>
          
          {/* Sample Transactions Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">TX ID</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Department</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Amount</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">First Digit</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.transactions_sample.slice(0, 5).map((tx) => {
                  const firstDigit = tx.amount.toString()[0];
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs">{tx.id}</td>
                      <td className="px-4 py-2 text-xs">{tx.department}</td>
                      <td className="px-4 py-2 text-right font-mono font-semibold">₹{tx.amount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2 text-center">
                        <span className="inline-block w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                          {firstDigit}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-600">{tx.purpose}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Showing 5 of {data.transactions_sample.length} transactions
            </p>
          </div>
        </section>

        {/* Step 3: Anomaly Graph */}
        <section>
          <BenfordAnomalyGraph transactions={data.transactions_sample} />
        </section>

        {/* Step 4: Interpretation Panel */}
        <section>
          <InterpretationPanel transactions={data.transactions_sample} />
        </section>

        {/* Footer Note */}
        <section className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">About This Framework</h3>
          <p className="text-sm text-gray-700 mb-3">
            This dashboard follows a consistent <strong>Research → Data → Anomaly</strong> pattern 
            that can be applied across multiple governance domains (spending, procurement, welfare). 
            It visually demonstrates when real government data deviates from well-established 
            statistical or economic expectations.
          </p>
          <p className="text-sm text-gray-700 mb-3">
            <strong>Key Principle:</strong> The goal is not to prove fraud, but to help auditors, 
            policymakers, and judges immediately understand why something deserves review.
          </p>
          <p className="text-xs text-gray-600 italic">
            This is a frontend-only analytical tool. No backend services, no enforcement actions, 
            no legal conclusions. All language is policy-safe: "statistical anomaly," "requires review."
          </p>
        </section>
      </div>
    </div>
  );
}
