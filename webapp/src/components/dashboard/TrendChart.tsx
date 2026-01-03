"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TimeSeriesData {
  month: string;
  cri_avg: number;
  tenders: number;
  single_bid_rate?: number;
}

interface TrendChartProps {
  data: TimeSeriesData[];
}

export default function TrendChart({ data }: TrendChartProps) {
  const [activeMetrics, setActiveMetrics] = useState({
    cri_avg: true,
    tenders: true,
    single_bid_rate: true,
  });

  // Add safety check
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No trend data available</p>
      </div>
    );
  }

  const toggleMetric = (metric: keyof typeof activeMetrics) => {
    setActiveMetrics((prev) => ({
      ...prev,
      [metric]: !prev[metric],
    }));
  };

  // Calculate trends
  const firstMonth = data[0] || { cri_avg: 0, tenders: 0 };
  const lastMonth = data[data.length - 1] || { cri_avg: 0, tenders: 0 };

  const criTrend = (lastMonth.cri_avg || 0) - (firstMonth.cri_avg || 0);
  const criTrendPercent = ((criTrend / (firstMonth.cri_avg || 1)) * 100).toFixed(1);

  const tendersTrend = (lastMonth.tenders || 0) - (firstMonth.tenders || 0);
  const tendersTrendPercent = ((tendersTrend / (firstMonth.tenders || 1)) * 100).toFixed(1);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}
              {entry.dataKey === "single_bid_rate" && "%"}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Risk Trends Over Time</h2>
          <p className="text-sm text-gray-600 mt-1">
            Monthly aggregate risk indicators and procurement volume
          </p>
        </div>
      </div>

      {/* Trend Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-700">CRI Score Trend</span>
            {criTrend > 0 ? (
              <TrendingUp className="w-5 h-5 text-red-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-green-600" />
            )}
          </div>
          <p className="text-2xl font-bold text-red-900">
            {criTrend > 0 ? "+" : ""}
            {criTrendPercent}%
          </p>
          <p className="text-xs text-red-600 mt-1">
            {criTrend > 0 ? "Increasing risk" : "Decreasing risk"} since Jan 2024
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Tender Volume</span>
            {tendersTrend > 0 ? (
              <TrendingUp className="w-5 h-5 text-blue-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {tendersTrend > 0 ? "+" : ""}
            {tendersTrendPercent}%
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {tendersTrend > 0 ? "Growing" : "Declining"} tender activity
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-yellow-700">Single-Bid Rate</span>
            <TrendingUp className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-900">
            {lastMonth.single_bid_rate?.toFixed(1)}%
          </p>
          <p className="text-xs text-yellow-600 mt-1">Current month average</p>
        </div>
      </div>

      {/* Metric Toggles */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => toggleMetric("cri_avg")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${
            activeMetrics.cri_avg
              ? "bg-red-100 text-red-700 border-red-300"
              : "bg-gray-100 text-gray-500 border-gray-300"
          }`}
        >
          <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
          CRI Score
        </button>
        <button
          onClick={() => toggleMetric("tenders")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${
            activeMetrics.tenders
              ? "bg-blue-100 text-blue-700 border-blue-300"
              : "bg-gray-100 text-gray-500 border-gray-300"
          }`}
        >
          <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
          Tender Count
        </button>
        <button
          onClick={() => toggleMetric("single_bid_rate")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${
            activeMetrics.single_bid_rate
              ? "bg-yellow-100 text-yellow-700 border-yellow-300"
              : "bg-gray-100 text-gray-500 border-gray-300"
          }`}
        >
          <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
          Single-Bid Rate
        </button>
      </div>

      {/* Chart */}
      <div className="w-full h-80" role="img" aria-label="Time series chart showing risk trends">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", { month: "short" });
              }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: "#6b7280" }}
              label={{ value: "CRI Score / Single-Bid %", angle: -90, position: "insideLeft" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "#6b7280" }}
              label={{ value: "Tender Count", angle: 90, position: "insideRight" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            {activeMetrics.cri_avg && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="cri_avg"
                stroke="#ef4444"
                strokeWidth={2}
                name="CRI Score"
                dot={{ fill: "#ef4444", r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            {activeMetrics.tenders && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="tenders"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Tender Count"
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            {activeMetrics.single_bid_rate && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="single_bid_rate"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Single-Bid Rate (%)"
                dot={{ fill: "#f59e0b", r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Interpretation */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h3 className="font-semibold text-gray-900 mb-2">Key Insights</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-red-500 font-bold">•</span>
            <span>
              CRI scores have {criTrend > 0 ? "increased" : "decreased"} by{" "}
              {Math.abs(parseFloat(criTrendPercent))}% over 12 months, indicating{" "}
              {criTrend > 0 ? "rising" : "declining"} fraud risk levels.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>
              Tender volume {tendersTrend > 0 ? "growth" : "decline"} of{" "}
              {Math.abs(parseFloat(tendersTrendPercent))}% suggests{" "}
              {tendersTrend > 0 ? "expanding" : "contracting"} procurement activity.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-500 font-bold">•</span>
            <span>
              Single-bid rates above 50% indicate insufficient competition — recommend
              market outreach and specification review.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
