'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, AlertTriangle, Database, Shield, Clock, TrendingUp } from 'lucide-react';
import ResearchExplanationCard from '@/components/fiscal/ResearchExplanationCard';
import BenfordAnomalyGraph from '@/components/fiscal/BenfordAnomalyGraph';
import InterpretationPanel from '@/components/fiscal/InterpretationPanel';
import ConformityGauge from '@/components/fiscal/ConformityGauge';
import ThresholdHeatmap from '@/components/fiscal/ThresholdHeatmap';
import DepartmentBreakdown from '@/components/fiscal/DepartmentBreakdown';
import AnomalySpotlight from '@/components/fiscal/AnomalySpotlight';
import DualLanguageAudio from '@/components/DualLanguageAudio';
import { Transaction } from '@/lib/benford';
import { getFiscalDashboard } from '@/lib/api';

interface BenfordData {
  counts: Record<string, number>;
  observed: Record<string, number>;
  expected: Record<string, number>;
  mad: number;
  chi2: number;
  total_analyzed: number;
  conformity_score: number;
}

interface ThresholdCluster {
  threshold: number;
  threshold_label: string;
  count: number;
  percentage: number;
}

interface AnomalousTransaction {
  id: string;
  department: string;
  amount: number;
  purpose: string;
  proximity_to: number;
  proximity_pct: number;
}

interface FiscalData {
  summary: {
    total_transactions: number;
    total_spend: number;
    departments_analyzed: number;
    avg_transaction: number;
  };
  transactions_sample: Transaction[];
  departments: Array<{
    dept_id: string;
    name: string;
    total_spend: number;
    transactions_count: number;
  }>;
  benford: BenfordData;
  threshold_analysis: ThresholdCluster[];
  anomalous_transactions: AnomalousTransaction[];
}

export default function FiscalPage() {
  const [data, setData] = useState<FiscalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'live' | 'mock'>('live');

  useEffect(() => {
    loadFiscalData();
  }, []);

  const loadFiscalData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fiscalData = await getFiscalDashboard();
      setData(fiscalData);
      setDataSource('live');
      console.log('✅ Fiscal data loaded from PostgreSQL database');
    } catch (err) {
      console.warn('⚠️ Backend unavailable, trying mock data...');
      try {
        const response = await fetch('/mock/fiscal-sample.json');
        if (response.ok) {
          const mockData = await response.json();
          setData(mockData);
          setDataSource('mock');
        } else {
          throw new Error('Mock data also unavailable');
        }
      } catch {
        setError('Unable to load fiscal data. Please ensure the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <RefreshCw className="h-14 w-14 text-blue-400 animate-spin mx-auto mb-4" />
            <div className="absolute inset-0 h-14 w-14 mx-auto rounded-full animate-ping bg-blue-400/20" />
          </div>
          <p className="text-blue-200 font-medium text-lg">Analyzing fiscal data...</p>
          <p className="text-blue-400/60 text-sm mt-1">Running Benford&apos;s Law analysis</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-red-500/30 p-8 max-w-md text-center shadow-2xl">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Data Unavailable</h2>
          <p className="text-gray-300 mb-4">{error || 'Unable to load fiscal data'}</p>
          <button
            onClick={loadFiscalData}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Compute Benford anomalies from server data for spotlight
  const benfordAnomalies = data.benford ? Object.keys(data.benford.observed || {}).map(digit => {
    const obs = (data.benford.observed[digit] || 0) * 100;
    const exp = (data.benford.expected[digit] || 0) * 100;
    return {
      digit: parseInt(digit),
      observed: obs,
      expected: exp,
      deviation: obs - exp,
    };
  }).filter(a => Math.abs(a.deviation) > 3) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Dual Language Audio */}
      <DualLanguageAudio 
        englishSrc="/audio/fiscal-en.mp3"
        hindiSrc="/audio/fiscal-hi.mp3"
      />

      {/* ═══════════════════════════════════════════════════════════
          HERO HEADER
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl translate-x-48 -translate-y-24" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-400 rounded-full blur-3xl -translate-x-36 translate-y-20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-14">
          <div className="flex items-start gap-4 mb-5">
            <div className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-sm border border-blue-400/20">
              <BarChart3 className="h-8 w-8 md:h-10 md:w-10" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-2 tracking-tight">
                Fiscal Leakage Detection
              </h1>
              <p className="text-base md:text-lg text-blue-200 mb-1">
                Research → Data Mapping → Anomaly Visualization Framework
              </p>
              <p className="text-sm text-blue-300/70 max-w-3xl">
                Applying Benford&apos;s Law to Delhi government spending data to identify statistical 
                deviations that warrant audit review. Not a fraud accusation — a data-driven signal.
              </p>
              {dataSource === 'live' && (
                <div className="mt-3 inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Database className="h-3.5 w-3.5 text-emerald-300" />
                  <span className="text-xs text-emerald-200 font-medium">Live · PostgreSQL Database</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Stats Banner */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
              <p className="text-xs text-blue-300 mb-1 flex items-center gap-1.5">
                <Shield className="h-3 w-3" /> Total Transactions
              </p>
              <p className="text-2xl md:text-3xl font-black">{data.summary.total_transactions.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
              <p className="text-xs text-blue-300 mb-1 flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3" /> Total Spend
              </p>
              <p className="text-2xl md:text-3xl font-black">₹{(data.summary.total_spend / 10000000).toFixed(2)} Cr</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
              <p className="text-xs text-blue-300 mb-1 flex items-center gap-1.5">
                <BarChart3 className="h-3 w-3" /> Departments
              </p>
              <p className="text-2xl md:text-3xl font-black">{data.summary.departments_analyzed}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
              <p className="text-xs text-blue-300 mb-1 flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> Avg Transaction
              </p>
              <p className="text-2xl md:text-3xl font-black">₹{(data.summary.avg_transaction / 100000).toFixed(1)}L</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MAIN CONTENT
          ═══════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8 md:space-y-10">

        {/* ────────────────────────────────────────
            ROW 1: Risk Gauge + Research Card (side-by-side)
            ──────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conformity Gauge — left column */}
          {data.benford && (
            <div className="lg:col-span-1">
              <ConformityGauge
                conformityScore={data.benford.conformity_score ?? 50}
                mad={data.benford.mad}
                chi2={data.benford.chi2}
              />
            </div>
          )}
          {/* Research Card — right columns */}
          <div className="lg:col-span-2">
            <ResearchExplanationCard domain="fiscal" />
          </div>
        </section>

        {/* ────────────────────────────────────────
            ROW 2: Benford's Law Anomaly Graph
            ──────────────────────────────────────── */}
        <section>
          <BenfordAnomalyGraph transactions={data.transactions_sample} />
        </section>

        {/* ────────────────────────────────────────
            ROW 3: Threshold Gaming Detection (THE KILLER FEATURE)
            ──────────────────────────────────────── */}
        {data.threshold_analysis && data.threshold_analysis.length > 0 && (
          <section>
            <ThresholdHeatmap
              thresholdClusters={data.threshold_analysis}
              anomalousTransactions={data.anomalous_transactions || []}
              totalTransactions={data.summary.total_transactions}
            />
          </section>
        )}

        {/* ────────────────────────────────────────
            ROW 4: Anomaly Spotlight + Department Breakdown (side-by-side)
            ──────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Anomaly Spotlight */}
          {(data.anomalous_transactions?.length > 0 || benfordAnomalies.length > 0) && (
            <AnomalySpotlight
              transactions={data.anomalous_transactions || []}
              benfordAnomalies={benfordAnomalies}
            />
          )}
          {/* Department Breakdown */}
          {data.departments && data.departments.length > 0 && (
            <DepartmentBreakdown
              departments={data.departments}
              totalSpend={data.summary.total_spend}
            />
          )}
        </section>

        {/* ────────────────────────────────────────
            ROW 5: Data Mapping — Transaction Table
            ──────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-green-600 rounded-lg p-2">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Data Mapping
                <span className="text-xs font-normal text-green-600 bg-green-100 px-2 py-1 rounded">
                  Raw Transaction Log
                </span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Extracted <strong>{data.transactions_sample.length}</strong> transaction amounts → 
                Computed first non-zero digit → Calculated frequency distribution
              </p>
            </div>
          </div>
          
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">TX ID</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Department</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600">Amount</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600">First Digit</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Purpose</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">Vendor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.transactions_sample.slice(0, 10).map((tx) => {
                  const firstDigit = tx.amount.toString().replace('.', '').replace(/^0+/, '')[0];
                  const isNearThreshold = 
                    (tx.amount >= 4750000 && tx.amount <= 5000000) ||
                    (tx.amount >= 9500000 && tx.amount <= 10000000);
                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-gray-50 transition-colors ${isNearThreshold ? 'bg-red-50/50' : ''}`}
                    >
                      <td className="px-4 py-2.5 font-mono text-xs">{tx.id}</td>
                      <td className="px-4 py-2.5 text-xs">{tx.department}</td>
                      <td className={`px-4 py-2.5 text-right font-mono font-semibold ${isNearThreshold ? 'text-red-600' : 'text-gray-900'}`}>
                        ₹{tx.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          firstDigit === '4' || firstDigit === '9'
                            ? 'bg-red-100 text-red-700 ring-2 ring-red-300'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {firstDigit}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-600">{tx.purpose}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500">{(tx as any).vendor || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Showing 10 of {data.transactions_sample.length} transactions · 
              <span className="text-red-500 font-medium"> Red-highlighted rows</span> indicate amounts near approval thresholds
            </p>
          </div>
        </section>

        {/* ────────────────────────────────────────
            ROW 6: Interpretation Panel
            ──────────────────────────────────────── */}
        <section>
          <InterpretationPanel transactions={data.transactions_sample} />
        </section>

        {/* ────────────────────────────────────────
            ROW 7: Footer — Methodology Note
            ──────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-slate-50 to-blue-50 border border-gray-200 rounded-xl p-6 shadow-sm">
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
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Benford&apos;s Law</span>
            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Threshold Gaming</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Department Analysis</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">CAG Methodology</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">Anomaly Detection</span>
          </div>
        </section>
      </div>
    </div>
  );
}
