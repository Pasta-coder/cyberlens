"use client";

import { motion } from "framer-motion";
import { TrendingUp, FileText, AlertTriangle, Building2 } from "lucide-react";

interface SummaryData {
  total_spend: number;
  tenders_analyzed: number;
  high_risk_tenders: number;
  departments_flagged: number;
}

interface SummaryCardsProps {
  data: SummaryData;
}

export default function SummaryCards({ data }: SummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value || 0);
  };

  // Add safety check
  if (!data) {
    return null;
  }

  const cards = [
    {
      title: "Total Spend",
      value: formatCurrency(data.total_spend),
      subtitle: "Last 12 months",
      icon: TrendingUp,
      color: "bg-blue-50 text-blue-600 border-blue-200",
      explainer: "Total government procurement spending tracked in the system",
    },
    {
      title: "Tenders Analyzed",
      value: (data.tenders_analyzed || 0).toLocaleString("en-IN"),
      subtitle: "Across all departments",
      icon: FileText,
      color: "bg-cyan-50 text-cyan-600 border-cyan-200",
      explainer: "Number of procurement tenders analyzed for fraud indicators",
    },
    {
      title: "High-Risk Tenders",
      value: (data.high_risk_tenders || 0).toLocaleString("en-IN"),
      subtitle: `${(((data.high_risk_tenders || 0) / (data.tenders_analyzed || 1)) * 100).toFixed(1)}% of total`,
      icon: AlertTriangle,
      color: "bg-red-50 text-red-600 border-red-200",
      explainer:
        (data.high_risk_tenders || 0) > 200
          ? "Significant number show single-bid patterns — recommended audit"
          : "Moderate risk detected — continue monitoring",
    },
    {
      title: "Departments Flagged",
      value: (data.departments_flagged || 0).toString(),
      subtitle: "Require review",
      icon: Building2,
      color: "bg-yellow-50 text-yellow-600 border-yellow-200",
      explainer:
        (data.departments_flagged || 0) > 10
          ? "Multiple departments show recurring risk patterns"
          : "Few departments flagged — normal variation",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          role="article"
          aria-label={`${card.title}: ${card.value}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`p-3 rounded-lg border ${card.color}`}
              aria-hidden="true"
            >
              <card.icon className="w-6 h-6" />
            </div>
          </div>

          <h3 className="text-sm font-medium text-gray-600 mb-1">
            {card.title}
          </h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">{card.value}</p>
          <p className="text-xs text-gray-500 mb-3">{card.subtitle}</p>

          <div
            className="text-xs text-gray-700 bg-gray-50 rounded-md p-2 border border-gray-200"
            role="note"
          >
            <p className="leading-relaxed">{card.explainer}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
