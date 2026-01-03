'use client';

import React, { useMemo } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { analyzeBenfordDeviations, Transaction } from '@/lib/benford';

interface BenfordAnomalyGraphProps {
  transactions: Transaction[];
  title?: string;
}

export default function BenfordAnomalyGraph({ transactions, title = "Benford's Law Anomaly Detection" }: BenfordAnomalyGraphProps) {
  const analysis = useMemo(() => {
    return analyzeBenfordDeviations(transactions);
  }, [transactions]);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-gray-600">No transaction data available</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = Array.from({ length: 9 }, (_, i) => {
    const digit = i + 1;
    const deviation = analysis.deviations.find(d => d.digit === digit);
    const observedValue = analysis.observed[digit] || 0;
    const expectedValue = analysis.expected[digit] || 0;
    
    return {
      digit: digit.toString(),
      observed: parseFloat(observedValue.toFixed(2)),
      expected: parseFloat(expectedValue.toFixed(2)),
      isAnomaly: deviation?.isAnomaly || false,
    };
  });

  // Debug log (remove in production)
  if (typeof window !== 'undefined') {
    console.log('Benford Analysis:', {
      sampleSize: analysis.sampleSize,
      chartData: chartData,
      requiresReview: analysis.requiresReview
    });
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const diff = data.observed - data.expected;
      return (
        <div className="bg-white p-4 border-2 border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-900 mb-2">Leading Digit: {data.digit}</p>
          <div className="space-y-1">
            <p className="text-sm text-blue-600">
              <strong>Observed:</strong> {data.observed.toFixed(2)}%
            </p>
            <p className="text-sm text-red-600">
              <strong>Expected (Benford):</strong> {data.expected.toFixed(2)}%
            </p>
            <p className={`text-sm font-semibold ${Math.abs(diff) > 5 ? 'text-orange-600' : 'text-gray-600'}`}>
              <strong>Deviation:</strong> {diff > 0 ? '+' : ''}{diff.toFixed(2)}%
            </p>
          </div>
          {Math.abs(diff) > 5 && (
            <p className="text-xs text-orange-600 mt-2 font-semibold">
              ⚠️ Significant anomaly detected
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              {title}
              <span className="text-xs font-normal text-green-600 bg-green-100 px-2 py-1 rounded">
                Step 3: Anomaly Visualization
              </span>
            </h2>
            <p className="text-sm text-gray-600">
              Comparing observed digit frequencies to Benford's Law expectations
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Sample Size</p>
            <p className="text-2xl font-bold text-gray-900">{analysis.sampleSize}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="digit" 
            stroke="#6b7280"
            style={{ fontSize: '14px', fontWeight: '600' }}
            label={{ value: 'Leading Digit', position: 'insideBottom', offset: -5, style: { fontWeight: 'bold', fontSize: 14 } }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{ value: 'Frequency (%)', angle: -90, position: 'insideLeft', style: { fontWeight: 'bold', fontSize: 14 } }}
            domain={[0, 'auto']}
            allowDataOverflow={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '13px', paddingTop: '20px', fontWeight: '500' }}
            verticalAlign="top"
            height={36}
          />
          
          {/* Observed bars - colored based on anomaly status */}
          <Bar
            dataKey="observed"
            name="Observed Frequency"
            radius={[6, 6, 0, 0]}
            barSize={40}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isAnomaly ? '#ef4444' : '#3b82f6'} 
              />
            ))}
          </Bar>
          
          {/* Expected line (Benford) */}
          <Line
            type="monotone"
            dataKey="expected"
            stroke="#dc2626"
            strokeWidth={3}
            dot={{ r: 6, fill: '#dc2626', strokeWidth: 2, stroke: '#fff' }}
            name="Expected (Benford's Law)"
            activeDot={{ r: 8 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Visual Rule Legend */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Visual Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-500 rounded"></div>
            <div>
              <p className="font-medium text-gray-900">Blue Bar</p>
              <p className="text-xs text-gray-600">Normal - within expected range</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-red-500 rounded"></div>
            <div>
              <p className="font-medium text-gray-900">Red Bar</p>
              <p className="text-xs text-gray-600">Anomaly - exceeds expected by &gt;5%</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-1 w-6 bg-red-600 rounded"></div>
            <div>
              <p className="font-medium text-gray-900">Red Line</p>
              <p className="text-xs text-gray-600">Benford's Law expectation (global standard)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-orange-500" />
            <div>
              <p className="font-medium text-gray-900">Deviation Rule</p>
              <p className="text-xs text-gray-600">If bar exceeds line significantly → Flag for review</p>
            </div>
          </div>
        </div>
      </div>

      {/* Percentage Labels (above bars) */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Hover over bars to see exact percentage values and deviation amounts</p>
      </div>
    </div>
  );
}
