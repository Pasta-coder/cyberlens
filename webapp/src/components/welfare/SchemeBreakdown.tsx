'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface SchemeData {
  name: string;
  expected: number;
  actual: number;
  gap: number;
  gap_percentage: number;
  risk: string;
}

interface SchemeBreakdownProps {
  data?: SchemeData[];
}

export default function SchemeBreakdown({ data }: SchemeBreakdownProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return '#dc2626';
      case 'high': return '#f59e0b';
      case 'moderate': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const chartData = data.map(scheme => ({
    name: scheme.name,
    Expected: scheme.expected,
    Actual: scheme.actual,
    Gap: scheme.gap,
    gapPercentage: scheme.gap_percentage,
    risk: scheme.risk
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-900 mb-2">{data.name}</p>
          <p className="text-sm text-blue-600 mb-1">
            Expected: {data.Expected.toLocaleString()}
          </p>
          <p className="text-sm text-purple-600 mb-1">
            Actual: {data.Actual.toLocaleString()}
          </p>
          <p className="text-sm text-orange-600 mb-1">
            Gap: +{data.Gap.toLocaleString()} ({data.gapPercentage}%)
          </p>
          <p className="text-xs text-gray-500 mt-2 capitalize">
            Risk Level: <span className="font-semibold">{data.risk}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Scheme-wise Breakdown
        </h2>
        <p className="text-sm text-gray-600">
          Comparing expected vs actual beneficiaries across Delhi's major welfare programs. 
          Disability Pension shows the highest anomaly rate.
        </p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            stroke="#6b7280"
            style={{ fontSize: '11px' }}
            angle={-15}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }}
          />
          <Bar 
            dataKey="Expected" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]}
            name="Expected Beneficiaries"
          />
          <Bar 
            dataKey="Actual" 
            fill="#a855f7" 
            radius={[4, 4, 0, 0]}
            name="Actual Enrollment"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk)} fillOpacity={0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map((scheme, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-gray-600 mb-1">
              {scheme.name}
            </h4>
            <p className="text-lg font-bold text-gray-900">
              +{scheme.gap_percentage.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">
              {scheme.gap.toLocaleString()} excess
            </p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
              scheme.risk === 'critical' ? 'bg-red-100 text-red-700' :
              scheme.risk === 'high' ? 'bg-orange-100 text-orange-700' :
              scheme.risk === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {scheme.risk}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
