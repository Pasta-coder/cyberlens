'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Building2, TrendingDown } from 'lucide-react';

interface DepartmentData {
  dept_id: string;
  name: string;
  total_spend: number;
  transactions_count: number;
}

interface DepartmentBreakdownProps {
  departments: DepartmentData[];
  totalSpend: number;
}

const DEPT_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
];

export default function DepartmentBreakdown({ departments, totalSpend }: DepartmentBreakdownProps) {
  const chartData = departments.slice(0, 10).map((dept, i) => ({
    name: dept.name.length > 20 ? dept.name.slice(0, 18) + '…' : dept.name,
    fullName: dept.name,
    spend: Math.round(dept.total_spend / 100000) / 100, // in Cr
    count: dept.transactions_count,
    avgTx: Math.round(dept.total_spend / dept.transactions_count / 100000) / 100, // avg in Cr
    pct: Math.round((dept.total_spend / totalSpend) * 1000) / 10,
    color: DEPT_COLORS[i % DEPT_COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.[0]) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-4 border-2 border-gray-200 rounded-lg shadow-lg text-sm">
          <p className="font-bold text-gray-900 mb-2">{d.fullName}</p>
          <div className="space-y-1">
            <p className="text-gray-600">Total Spend: <strong>₹{d.spend} Cr</strong></p>
            <p className="text-gray-600">Transactions: <strong>{d.count}</strong></p>
            <p className="text-gray-600">Avg Transaction: <strong>₹{d.avgTx} Cr</strong></p>
            <p className="text-gray-600">Share: <strong>{d.pct}%</strong></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-600 rounded-lg p-2">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Department-wise Spend Analysis</h3>
          <p className="text-sm text-gray-500">
            {departments.length} departments · ₹{(totalSpend / 10000000).toFixed(2)} Cr total
          </p>
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <ResponsiveContainer width="100%" height={Math.max(350, departments.slice(0, 10).length * 42)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            label={{ value: 'Spend (₹ Crore)', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#9ca3af' } }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: '#374151' }}
            width={95}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="spend" radius={[0, 6, 6, 0]} barSize={24}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Top spender highlights */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {chartData.slice(0, 4).map((dept, i) => (
          <div
            key={i}
            className="rounded-lg p-3 border"
            style={{ borderColor: `${dept.color}40`, backgroundColor: `${dept.color}08` }}
          >
            <p className="text-xs text-gray-500 truncate">{dept.fullName}</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">₹{dept.spend} Cr</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3 text-gray-400" />
              <span className="text-[10px] text-gray-500">{dept.count} transactions · {dept.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
