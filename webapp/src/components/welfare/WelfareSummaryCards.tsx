'use client';

import React from 'react';
import { TrendingUp, Users, AlertTriangle, Calendar } from 'lucide-react';

interface SummaryData {
  expected_beneficiaries: number;
  actual_beneficiaries: number;
  gap: number;
  gap_percentage: number;
  risk_level: string;
  last_updated: string;
}

interface WelfareSummaryCardsProps {
  data?: SummaryData;
}

export default function WelfareSummaryCards({ data }: WelfareSummaryCardsProps) {
  if (!data) {
    return null;
  }

  const riskColor = 
    data.risk_level === 'critical' ? 'text-red-600 bg-red-50' :
    data.risk_level === 'high' ? 'text-orange-600 bg-orange-50' :
    data.risk_level === 'moderate' ? 'text-yellow-600 bg-yellow-50' :
    'text-green-600 bg-green-50';

  const cards = [
    {
      title: 'Expected Beneficiaries',
      value: data.expected_beneficiaries.toLocaleString(),
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
      description: 'Projected based on economic growth trends',
      subtext: 'If welfare exits matched income growth'
    },
    {
      title: 'Actual Beneficiaries',
      value: data.actual_beneficiaries.toLocaleString(),
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-50',
      description: 'Current enrollment in welfare schemes',
      subtext: 'As per government records'
    },
    {
      title: 'Enrollment Mismatch',
      value: `+${data.gap.toLocaleString()}`,
      icon: AlertTriangle,
      color: riskColor,
      description: `${data.gap_percentage}% above expected levels`,
      subtext: 'Warrants policy review'
    },
    {
      title: 'Last Updated',
      value: new Date(data.last_updated).toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric'
      }),
      icon: Calendar,
      color: 'text-gray-600 bg-gray-50',
      description: 'Data freshness indicator',
      subtext: 'Regular updates ensure accuracy'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
          </div>
          
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            {card.title}
          </h3>
          
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {card.value}
          </p>
          
          <p className="text-sm text-gray-700 font-medium mb-1">
            {card.description}
          </p>
          
          <p className="text-xs text-gray-500 italic">
            {card.subtext}
          </p>
        </div>
      ))}
    </div>
  );
}
