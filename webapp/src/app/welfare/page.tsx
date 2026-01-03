'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, RefreshCw } from 'lucide-react';
import WelfareSummaryCards from '@/components/welfare/WelfareSummaryCards';
import GapChart from '@/components/welfare/GapChart';
import GapNarrative from '@/components/welfare/GapNarrative';
import SchemeBreakdown from '@/components/welfare/SchemeBreakdown';
import DistrictTable from '@/components/welfare/DistrictTable';
import TimelineNarrative from '@/components/welfare/TimelineNarrative';
import MethodologyModal from '@/components/welfare/MethodologyModal';

interface WelfareData {
  summary: {
    expected_beneficiaries: number;
    actual_beneficiaries: number;
    gap: number;
    gap_percentage: number;
    risk_level: string;
    last_updated: string;
  };
  timeline: Array<{
    year: number;
    growth_index: number;
    expected: number;
    actual: number;
    note: string;
  }>;
  schemes: Array<{
    name: string;
    expected: number;
    actual: number;
    gap: number;
    gap_percentage: number;
    risk: string;
  }>;
  districts: Array<{
    name: string;
    expected: number;
    actual: number;
    gap: number;
    gap_percentage: number;
    risk: string;
  }>;
  narrative: {
    key_findings: string[];
    possible_reasons: string[];
    recommendations: string[];
  };
  methodology: {
    title: string;
    explanation: string;
    data_sources: string[];
    disclaimer: string;
  };
}

export default function WelforePage() {
  const [data, setData] = useState<WelfareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWelfareData();
  }, []);

  const loadWelfareData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load mock data (backend endpoint not implemented yet)
      const response = await fetch('/mock/welfare-gap.json');
      if (!response.ok) {
        throw new Error('Failed to load welfare data');
      }
      const welfareData = await response.json();
      setData(welfareData);
    } catch (err) {
      console.error('Error loading welfare data:', err);
      setError('Unable to load welfare forensics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading welfare forensics data...</p>
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
          <p className="text-gray-600 mb-4">{error || 'Unable to load welfare data'}</p>
          <button
            onClick={loadWelfareData}
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 md:py-16 px-4 md:px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-4 mb-4">
            <TrendingDown className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0" />
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
                Welfare Delivery Forensics
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-2">
                Economic Growth vs Welfare Enrollment Analysis — Delhi (2018-2026)
              </p>
              <p className="text-sm md:text-base text-blue-200 max-w-3xl">
                When per capita income rises, fewer people typically need welfare support. 
                This dashboard identifies system-level mismatches between economic growth and 
                welfare enrollment for policy review.
              </p>
            </div>
          </div>
          
          {/* Alert Banner */}
          <div className="mt-6 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-300 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-white">
                <strong>Policy-Friendly Language:</strong> This dashboard uses terms like 
                "mismatch," "anomaly," and "gap" instead of "fraud." All findings require 
                field verification before action. Individual beneficiaries may have legitimate reasons.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8 md:space-y-12">
        {/* Summary Cards */}
        <section>
          <WelfareSummaryCards data={data.summary} />
        </section>

        {/* Gap Chart */}
        <section>
          <GapChart data={data.timeline} />
        </section>

        {/* Gap Narrative */}
        <section>
          <GapNarrative data={data.narrative} />
        </section>

        {/* Scheme Breakdown */}
        <section>
          <SchemeBreakdown data={data.schemes} />
        </section>

        {/* District Table */}
        <section>
          <DistrictTable data={data.districts} />
        </section>

        {/* Timeline Narrative */}
        <section>
          <TimelineNarrative data={data.timeline} />
        </section>

        {/* Footer Note */}
        <section className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">
            About This Dashboard
          </h3>
          <p className="text-sm text-gray-700 mb-3">
            This forensics tool visualizes the relationship between Delhi's economic growth 
            (35% increase in per capita income, 2018-2026) and welfare enrollment patterns. 
            The "Expected" numbers are derived from established economic research linking income 
            growth to poverty reduction (World Bank methodology, Economic Survey of Delhi).
          </p>
          <p className="text-sm text-gray-700 mb-3">
            <strong>Key Insight:</strong> Despite strong economic growth, welfare beneficiaries 
            increased by 18% instead of declining. This 1.45 lakh beneficiary gap suggests either 
            systemic exit barriers or legitimate demographic shifts requiring administrative review.
          </p>
          <p className="text-xs text-gray-600 italic">
            No machine learning or complex economic models are implemented in this dashboard — 
            only research-backed assumptions and visual storytelling for policy-level insights.
          </p>
        </section>
      </div>

      {/* Methodology Modal */}
      <MethodologyModal data={data.methodology} />
    </div>
  );
}
