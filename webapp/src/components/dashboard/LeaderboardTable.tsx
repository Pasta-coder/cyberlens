"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface LeaderboardEntry {
  entity_id: string;
  name: string;
  total_spend: number;
  risk_score: number;
  single_bid_pct: number;
}

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
}

type SortField = "name" | "total_spend" | "risk_score" | "single_bid_pct";
type SortDirection = "asc" | "desc";

export default function LeaderboardTable({ data }: LeaderboardTableProps) {
  const [sortField, setSortField] = useState<SortField>("risk_score");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [showCount, setShowCount] = useState(10);

  // Add safety check
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No leaderboard data available</p>
      </div>
    );
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return sorted.slice(0, showCount);
  }, [data, sortField, sortDirection, showCount]);

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-600 bg-red-50";
    if (score >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  // Generate mini sparkline data
  const generateSparklineData = (singleBidPct: number) => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: singleBidPct + (Math.random() - 0.5) * 10,
    }));
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 text-cyan-600" />
    ) : (
      <ArrowDown className="w-4 h-4 text-cyan-600" />
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            High-Risk Entities Leaderboard
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Top entities by risk score and suspicious patterns
          </p>
        </div>
        <select
          value={showCount}
          onChange={(e) => setShowCount(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
          aria-label="Number of entries to display"
        >
          <option value={10}>Top 10</option>
          <option value={20}>Top 20</option>
          <option value={50}>Top 50</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Rank
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-cyan-600 transition"
                  aria-label="Sort by entity name"
                >
                  Entity
                  <SortIcon field="name" />
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => handleSort("total_spend")}
                  className="flex items-center gap-2 ml-auto text-sm font-semibold text-gray-700 hover:text-cyan-600 transition"
                  aria-label="Sort by total spend"
                >
                  Total Spend
                  <SortIcon field="total_spend" />
                </button>
              </th>
              <th className="text-center py-3 px-4">
                <button
                  onClick={() => handleSort("risk_score")}
                  className="flex items-center gap-2 mx-auto text-sm font-semibold text-gray-700 hover:text-cyan-600 transition"
                  aria-label="Sort by risk score"
                >
                  Risk Score
                  <SortIcon field="risk_score" />
                </button>
              </th>
              <th className="text-center py-3 px-4">
                <button
                  onClick={() => handleSort("single_bid_pct")}
                  className="flex items-center gap-2 mx-auto text-sm font-semibold text-gray-700 hover:text-cyan-600 transition"
                  aria-label="Sort by single bid percentage"
                >
                  Single-Bid %
                  <SortIcon field="single_bid_pct" />
                </button>
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                Trend
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((entry, index) => (
              <tr
                key={entry.entity_id}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
                role="row"
              >
                <td className="py-4 px-4">
                  <span className="font-semibold text-gray-700">{index + 1}</span>
                </td>
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-gray-900">{entry.name}</p>
                    <p className="text-xs text-gray-500">{entry.entity_id}</p>
                  </div>
                </td>
                <td className="py-4 px-4 text-right font-medium text-gray-900">
                  {formatCurrency(entry.total_spend)}
                </td>
                <td className="py-4 px-4 text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(
                      entry.risk_score
                    )}`}
                  >
                    {entry.risk_score}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span
                    className={`text-sm font-medium ${
                      entry.single_bid_pct > 60
                        ? "text-red-600"
                        : entry.single_bid_pct > 40
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {entry.single_bid_pct}%
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="w-24 h-8" aria-label={`Trend for ${entry.name}`}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={generateSparklineData(entry.single_bid_pct)}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={entry.risk_score >= 70 ? "#ef4444" : "#3b82f6"}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <button
                    className="inline-flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700 font-medium transition"
                    aria-label={`View evidence for ${entry.name}`}
                  >
                    View
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > showCount && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowCount(showCount + 10)}
            className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
          >
            Show more ({data.length - showCount} remaining)
          </button>
        </div>
      )}

      <div className="mt-6 border-t border-gray-200 pt-4">
        <p className="text-sm text-gray-700">
          <strong>How to read this table:</strong> Higher risk scores and single-bid percentages
          indicate entities requiring immediate audit attention. Entities with consistent high
          single-bid rates may indicate cartel behavior or specification manipulation.
        </p>
      </div>
    </div>
  );
}
