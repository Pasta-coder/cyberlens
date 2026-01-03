'use client';

import React from 'react';
import { TrendingUp, Users, AlertCircle, CheckCircle } from 'lucide-react';

interface TimelinePoint {
  year: number;
  growth_index: number;
  expected: number;
  actual: number;
  note: string;
}

interface TimelineNarrativeProps {
  data?: TimelinePoint[];
}

export default function TimelineNarrative({ data }: TimelineNarrativeProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const keyYears = [
    data[0], // 2018 - Baseline
    data[2], // 2020 - COVID
    data[data.length - 1] // 2026 - Latest
  ];

  const getIcon = (year: number) => {
    if (year === 2018) return Users;
    if (year === 2020) return AlertCircle;
    return TrendingUp;
  };

  const getColor = (year: number) => {
    if (year === 2018) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (year === 2020) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-purple-600 bg-purple-50 border-purple-200';
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          The Story Behind the Numbers
        </h2>
        <p className="text-sm text-gray-600">
          How economic growth and welfare enrollment diverged over 8 years in Delhi.
        </p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-orange-300 to-purple-300 hidden md:block"></div>

        <div className="space-y-6">
          {keyYears.map((point, idx) => {
            const Icon = getIcon(point.year);
            const gap = point.actual - point.expected;
            const gapPercentage = ((gap / point.expected) * 100).toFixed(1);
            
            return (
              <div key={idx} className="relative">
                <div className="flex gap-4 md:gap-6">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-full border-4 ${getColor(point.year)} flex items-center justify-center z-10 bg-white`}>
                    <Icon className="h-7 w-7" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {point.year}
                      </h3>
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Growth Index: {point.growth_index}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-3 italic">
                      {point.note}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Expected</p>
                        <p className="font-semibold text-blue-600">
                          {point.expected.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Actual</p>
                        <p className="font-semibold text-purple-600">
                          {point.actual.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Gap</p>
                        <p className="font-semibold text-orange-600">
                          +{gap.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Gap %</p>
                        <p className={`font-semibold ${
                          parseFloat(gapPercentage) > 15 ? 'text-red-600' :
                          parseFloat(gapPercentage) > 10 ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          +{gapPercentage}%
                        </p>
                      </div>
                    </div>

                    {point.year === 2026 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600 flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Policy Insight:</strong> Despite 35% income growth, welfare beneficiaries 
                            remain 18% above expected levels. This suggests either systemic exit barriers 
                            or legitimate demographic shifts requiring verification.
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">
          Timeline Interpretation Guide
        </h4>
        <ul className="space-y-1 text-xs text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span><strong>2018 Baseline:</strong> Economy and welfare enrollment aligned at 1 million beneficiaries</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-600 font-bold">•</span>
            <span><strong>2020 COVID Impact:</strong> Legitimate increase due to pandemic — economic model expected this</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">•</span>
            <span><strong>2022-2026 Divergence:</strong> Economy recovered strongly, but welfare exits slowed significantly</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
