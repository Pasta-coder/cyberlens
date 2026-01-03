'use client';

import React, { useState, useMemo } from 'react';
import { ArrowUpDown, AlertTriangle } from 'lucide-react';

interface DistrictData {
  name: string;
  expected: number;
  actual: number;
  gap: number;
  gap_percentage: number;
  risk: string;
}

interface DistrictTableProps {
  data?: DistrictData[];
}

export default function DistrictTable({ data }: DistrictTableProps) {
  const [sortBy, setSortBy] = useState<'gap_percentage' | 'gap' | 'actual'>('gap_percentage');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  if (!data || data.length === 0) {
    return null;
  }

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [data, sortBy, sortOrder]);

  const handleSort = (column: 'gap_percentage' | 'gap' | 'actual') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getRiskBadge = (risk: string) => {
    const styles = {
      critical: 'bg-red-100 text-red-700 border-red-300',
      high: 'bg-orange-100 text-orange-700 border-orange-300',
      moderate: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-green-100 text-green-700 border-green-300'
    };
    return styles[risk as keyof typeof styles] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          District-Level Analysis
        </h2>
        <p className="text-sm text-gray-600">
          Central Delhi shows the highest mismatch (38% excess). Click column headers to sort.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                District
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Expected
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('actual')}
              >
                <div className="flex items-center justify-end gap-1">
                  Actual
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('gap')}
              >
                <div className="flex items-center justify-end gap-1">
                  Gap
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('gap_percentage')}
              >
                <div className="flex items-center justify-end gap-1">
                  Gap %
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Risk Level
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedData.map((district, idx) => (
              <tr 
                key={idx}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {district.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 text-right font-mono">
                  {district.expected.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right font-mono font-semibold">
                  {district.actual.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-orange-600 text-right font-mono font-semibold">
                  +{district.gap.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded font-semibold text-sm ${
                    district.gap_percentage > 25 ? 'bg-red-100 text-red-700' :
                    district.gap_percentage > 15 ? 'bg-orange-100 text-orange-700' :
                    district.gap_percentage > 10 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {district.gap_percentage > 20 && <AlertTriangle className="h-3 w-3" />}
                    +{district.gap_percentage.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase border ${getRiskBadge(district.risk)}`}>
                    {district.risk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
            <span>Critical (&gt;25%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-orange-500"></span>
            <span>High (15-25%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-500"></span>
            <span>Moderate (10-15%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
            <span>Low (&lt;10%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
