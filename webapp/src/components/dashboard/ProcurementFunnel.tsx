"use client";

import { motion } from "framer-motion";

interface FunnelData {
  published: number;
  bids_received: number;
  contracts_awarded: number;
}

interface ProcurementFunnelProps {
  data: FunnelData;
}

export default function ProcurementFunnel({ data }: ProcurementFunnelProps) {
  // Add safety check
  if (!data || typeof data.published !== 'number') {
    return null;
  }

  const stages = [
    {
      name: "Tenders Published",
      count: data.published || 0,
      color: "bg-blue-500",
      width: 100,
    },
    {
      name: "Bids Received",
      count: data.bids_received || 0,
      color: "bg-cyan-500",
      width: ((data.bids_received || 0) / (data.published || 1)) * 100,
    },
    {
      name: "Contracts Awarded",
      count: data.contracts_awarded || 0,
      color: "bg-green-500",
      width: ((data.contracts_awarded || 0) / (data.published || 1)) * 100,
    },
  ];

  const dropoffRate1 = (
    (((data.published || 0) - (data.bids_received || 0)) / (data.published || 1)) *
    100
  ).toFixed(1);
  const dropoffRate2 = (
    (((data.bids_received || 0) - (data.contracts_awarded || 0)) / (data.bids_received || 1)) *
    100
  ).toFixed(1);

  const competitionRate = (((data.bids_received || 0) / (data.published || 1)) * 100).toFixed(1);
  const awardRate = (((data.contracts_awarded || 0) / (data.published || 1)) * 100).toFixed(1);

  // Calculate average bidders per tender
  const avgBidders = ((data.bids_received || 0) / (data.published || 1)).toFixed(1);

  const getTakeaway = () => {
    const avgBiddersNum = parseFloat(avgBidders);
    if (avgBiddersNum < 2) {
      return {
        level: "Critical",
        color: "text-red-600 bg-red-50 border-red-200",
        message: `Very low competition: Average ${avgBidders} bidders per tender. This indicates severe lack of competition, possibly due to restrictive specifications or limited supplier base.`,
      };
    } else if (avgBiddersNum < 3) {
      return {
        level: "Warning",
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
        message: `${Math.round((1 - parseFloat(competitionRate) / 100) * 100)}% of tenders had fewer than 3 bidders. Recommend review of tender specifications and outreach.`,
      };
    } else {
      return {
        level: "Healthy",
        color: "text-green-600 bg-green-50 border-green-200",
        message: `Good competition with average ${avgBidders} bidders per tender. Procurement process shows healthy market participation.`,
      };
    }
  };

  const takeaway = getTakeaway();

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Procurement Competition Funnel
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Tender lifecycle from publication to contract award
        </p>
      </div>

      {/* Funnel Visualization */}
      <div className="space-y-4 mb-6" role="img" aria-label="Procurement funnel showing tender progression">
        {stages.map((stage, index) => (
          <motion.div
            key={stage.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="relative"
          >
            <div className="flex items-center gap-4 mb-2">
              <span className="text-sm font-medium text-gray-700 w-40">
                {stage.name}
              </span>
              <span className="text-lg font-bold text-gray-900">
                {stage.count.toLocaleString("en-IN")}
              </span>
              {index > 0 && (
                <span className="text-xs text-gray-500">
                  ({stage.width.toFixed(1)}% of published)
                </span>
              )}
            </div>
            <div className="relative h-16 bg-gray-100 rounded-lg overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stage.width}%` }}
                transition={{ duration: 1, delay: index * 0.2 }}
                className={`h-full ${stage.color} flex items-center justify-center`}
                style={{ minWidth: "60px" }}
              >
                <span className="text-white font-semibold text-sm">
                  {stage.width.toFixed(0)}%
                </span>
              </motion.div>
            </div>

            {/* Drop-off indicator */}
            {index < stages.length - 1 && (
              <div className="flex items-center gap-2 mt-2 ml-44">
                <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200">
                  ↓ {index === 0 ? dropoffRate1 : dropoffRate2}% drop-off
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-xs text-blue-600 mb-1">Published</p>
          <p className="text-2xl font-bold text-blue-900">
            {data.published.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
          <p className="text-xs text-cyan-600 mb-1">Competition Rate</p>
          <p className="text-2xl font-bold text-cyan-900">{competitionRate}%</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-xs text-green-600 mb-1">Award Rate</p>
          <p className="text-2xl font-bold text-green-900">{awardRate}%</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-xs text-purple-600 mb-1">Avg. Bidders</p>
          <p className="text-2xl font-bold text-purple-900">{avgBidders}</p>
        </div>
      </div>

      {/* Takeaway */}
      <div className={`rounded-lg p-4 border ${takeaway.color}`}>
        <h3 className="font-semibold mb-2">{takeaway.level} Competition Level</h3>
        <p className="text-sm leading-relaxed">{takeaway.message}</p>
      </div>

      {/* Explanation */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h3 className="font-semibold text-gray-900 mb-2">How to read this funnel</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          The funnel shows drop-offs in procurement competition. Healthy markets should see
          at least 3-5 bidders per tender. High drop-off rates or low bidder counts may indicate:
          restrictive specifications, limited supplier outreach, or anti-competitive practices.
        </p>
      </div>
    </div>
  );
}
