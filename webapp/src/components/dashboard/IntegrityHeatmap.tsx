"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RegionData {
  region_code: string;
  region_name: string;
  cri_score: number;
  total_spend: number;
  red_flags: string[];
}

interface IntegrityHeatmapProps {
  regions: RegionData[];
}

export default function IntegrityHeatmap({ regions }: IntegrityHeatmapProps) {
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);

  const getRiskColor = (score: number) => {
    if (score >= 70) return "bg-red-500 border-red-600";
    if (score >= 50) return "bg-orange-500 border-orange-600";
    if (score >= 30) return "bg-yellow-500 border-yellow-600";
    return "bg-green-500 border-green-600";
  };

  const getRiskLabel = (score: number) => {
    if (score >= 70) return "High Risk";
    if (score >= 50) return "Elevated Risk";
    if (score >= 30) return "Moderate Risk";
    return "Low Risk";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const redFlagLabels: Record<string, string> = {
    single_bid: "Single-bid pattern",
    short_window: "Short submission window",
    golden_param: "Tailored specifications",
    split_contract: "Contract splitting",
    repeat_supplier: "Supplier concentration",
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Regional Integrity Heatmap
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Procurement risk levels across Delhi regions
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Info className="w-4 h-4" />
          <span>Click a region for details</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 flex flex-wrap items-center gap-4 text-sm">
        <span className="font-medium text-gray-700">Risk Level:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600">Low (0-29)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-gray-600">Moderate (30-49)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span className="text-gray-600">Elevated (50-69)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-600">High (70+)</span>
        </div>
      </div>

      {/* Simplified Grid Visualization */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {regions.map((region, index) => (
          <motion.button
            key={region.region_code}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedRegion(region)}
            className={`relative p-6 rounded-lg border-2 transition-all hover:scale-105 ${getRiskColor(
              region.cri_score
            )} ${
              selectedRegion?.region_code === region.region_code
                ? "ring-4 ring-cyan-400"
                : ""
            }`}
            aria-label={`${region.region_name}: ${getRiskLabel(region.cri_score)}`}
          >
            <div className="text-white text-center">
              <p className="text-xs font-medium mb-2 opacity-90">
                {region.region_name}
              </p>
              <p className="text-2xl font-bold">{region.cri_score.toFixed(1)}</p>
              <p className="text-xs mt-1 opacity-90">{getRiskLabel(region.cri_score)}</p>
            </div>
            {region.red_flags.length > 0 && (
              <div className="absolute top-2 right-2 bg-white text-gray-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {region.red_flags.length}
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Selected Region Panel */}
      <AnimatePresence>
        {selectedRegion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {selectedRegion.region_name}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedRegion.region_code}</p>
                  </div>
                  <button
                    onClick={() => setSelectedRegion(null)}
                    className="p-1 hover:bg-gray-200 rounded transition"
                    aria-label="Close details"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">CRI Risk Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedRegion.cri_score.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {getRiskLabel(selectedRegion.cri_score)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Total Spend</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(selectedRegion.total_spend)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Last 12 months</p>
                  </div>
                </div>

                {selectedRegion.red_flags.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Red Flags ({selectedRegion.red_flags.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedRegion.red_flags.map((flag, idx) => (
                        <div
                          key={idx}
                          className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm"
                        >
                          <p className="font-medium text-red-900">
                            {redFlagLabels[flag] || flag}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRegion.cri_score >= 70 && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">
                      <strong>Recommendation:</strong> This region shows high fraud risk.
                      Conduct comprehensive audit including document review and stakeholder
                      interviews.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 border-t border-gray-200 pt-4">
        <p className="text-sm text-gray-700">
          <strong>How to read this map:</strong> Colors indicate corruption risk index (CRI)
          scores. Green regions show normal procurement patterns. Red regions require
          immediate attention. Click any region to see detailed breakdown.
        </p>
      </div>
    </div>
  );
}
