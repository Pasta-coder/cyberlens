'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';

interface TimelinePoint {
  year: number;
  growth_index: number;
  expected: number;
  actual: number;
  note: string;
}

interface GapChartProps {
  data?: TimelinePoint[];
}

export default function GapChart({ data }: GapChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const chartData = data.map(point => ({
    ...point,
    gap: point.actual - point.expected,
    gapPercentage: ((point.actual - point.expected) / point.expected * 100).toFixed(1)
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-900 mb-2">{data.year}</p>
          <p className="text-sm text-blue-600 mb-1">
            Expected: {data.expected.toLocaleString()}
          </p>
          <p className="text-sm text-purple-600 mb-1">
            Actual: {data.actual.toLocaleString()}
          </p>
          <p className="text-sm text-orange-600 mb-1">
            Gap: +{data.gap.toLocaleString()} ({data.gapPercentage}%)
          </p>
          <p className="text-sm text-gray-600 mb-1">
            Growth Index: {data.growth_index}
          </p>
          <p className="text-xs text-gray-500 italic mt-2">{data.note}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Expected vs Actual Beneficiaries (2018-2026)
        </h2>
        <p className="text-sm text-gray-600">
          As Delhi's economy grew 35%, expected beneficiaries should have declined. 
          The gap shows where reality diverged from projections.
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="year" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }}
          />
          
          {/* Gap shading */}
          <Area
            type="monotone"
            dataKey="actual"
            fill="#fbbf24"
            fillOpacity={0.2}
            stroke="none"
            name="Mismatch Area"
          />
          <Area
            type="monotone"
            dataKey="expected"
            fill="#ffffff"
            fillOpacity={1}
            stroke="none"
          />
          
          {/* Lines */}
          <Line
            type="monotone"
            dataKey="expected"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 5, fill: '#3b82f6' }}
            name="Expected (Economic Model)"
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#a855f7"
            strokeWidth={3}
            dot={{ r: 5, fill: '#a855f7' }}
            name="Actual Enrollment"
            activeDot={{ r: 7 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-700">
            <strong>Blue line:</strong> Economic model projection
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span className="text-gray-700">
            <strong>Purple line:</strong> Government enrollment data
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          <span className="text-gray-700">
            <strong>Yellow area:</strong> Policy review zone
          </span>
        </div>
      </div>
    </div>
  );
}
