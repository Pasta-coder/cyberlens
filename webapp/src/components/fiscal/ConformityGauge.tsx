'use client';

import React, { useMemo } from 'react';
import { Activity } from 'lucide-react';

interface RiskGaugeProps {
  conformityScore: number; // 0 to 100
  mad: number;
  chi2: number;
  label?: string;
}

export default function ConformityGauge({ conformityScore, mad, chi2, label = "Benford Conformity" }: RiskGaugeProps) {
  const { color, status, description } = useMemo(() => {
    if (conformityScore >= 80) return { 
      color: '#22c55e', 
      status: 'CONFORMING', 
      description: 'Digit distribution follows natural patterns' 
    };
    if (conformityScore >= 50) return { 
      color: '#f59e0b', 
      status: 'MODERATE DEVIATION', 
      description: 'Some unnatural clustering detected' 
    };
    if (conformityScore >= 20) return { 
      color: '#f97316', 
      status: 'SIGNIFICANT ANOMALY', 
      description: 'Strong deviation from Benford\'s Law' 
    };
    return { 
      color: '#ef4444', 
      status: 'CRITICAL DEVIATION', 
      description: 'Extreme manipulation signal detected' 
    };
  }, [conformityScore]);

  // SVG arc calculations
  const radius = 80;
  const strokeWidth = 14;
  const cx = 100;
  const cy = 100;
  const startAngle = -210;
  const endAngle = 30;
  const totalAngle = endAngle - startAngle; // 240 degrees

  const polarToCartesian = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  const describeArc = (start: number, end: number) => {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const largeArcFlag = Math.abs(end - start) > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${e.x} ${e.y}`;
  };

  const filledAngle = startAngle + (totalAngle * Math.min(Math.max(conformityScore, 0), 100)) / 100;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-indigo-600 rounded-lg p-2">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">{label}</h3>
      </div>

      <div className="flex flex-col items-center">
        {/* SVG Gauge */}
        <svg width="200" height="140" viewBox="0 0 200 150">
          {/* Background track */}
          <path
            d={describeArc(startAngle, endAngle)}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <path
            d={describeArc(startAngle, filledAngle)}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{
              transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 0 6px ${color}40)`,
            }}
          />
          {/* Score text */}
          <text x={cx} y={cy - 5} textAnchor="middle" className="text-3xl font-black" fill={color}>
            {Math.round(conformityScore)}%
          </text>
          <text x={cx} y={cy + 16} textAnchor="middle" className="text-xs font-medium" fill="#6b7280">
            Conformity Score
          </text>
        </svg>

        {/* Status badge */}
        <div
          className="mt-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide"
          style={{
            backgroundColor: `${color}15`,
            color: color,
            border: `1.5px solid ${color}40`,
          }}
        >
          {status}
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center max-w-[220px]">{description}</p>
      </div>

      {/* Metrics */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-0.5">MAD Score</p>
          <p className="text-lg font-bold text-gray-900">{mad.toFixed(4)}</p>
          <p className="text-[10px] text-gray-400">{mad > 0.015 ? '> 0.015 threshold' : 'Within normal'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-0.5">Chi² Statistic</p>
          <p className="text-lg font-bold text-gray-900">{chi2.toFixed(2)}</p>
          <p className="text-[10px] text-gray-400">{chi2 > 15.51 ? 'Exceeds critical' : 'Within range'}</p>
        </div>
      </div>
    </div>
  );
}
