"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ComposedChart, ResponsiveContainer } from "recharts";
import { Info } from "lucide-react";
import { useState } from "react";

interface BenfordData {
  counts: Record<string, number>;
  mad: number;
  chi2: number;
}

interface BenfordChartProps {
  data: BenfordData;
}

export default function BenfordChart({ data }: BenfordChartProps) {
  const [showInfo, setShowInfo] = useState(false);

  // Add safety check
  if (!data || !data.counts) {
    return null;
  }

  // Benford's Law expected frequencies
  const benfordExpected = {
    "1": 30.1,
    "2": 17.6,
    "3": 12.5,
    "4": 9.7,
    "5": 7.9,
    "6": 6.7,
    "7": 5.8,
    "8": 5.1,
    "9": 4.6,
  };

  // Calculate total for percentage
  const total = Object.values(data.counts).reduce((sum, val) => sum + val, 0);

  // Transform data for chart
  const chartData = Object.keys(benfordExpected).map((digit) => {
    const observed = ((data.counts[digit] || 0) / total) * 100;
    const expected = benfordExpected[digit as keyof typeof benfordExpected];
    return {
      digit,
      observed: parseFloat(observed.toFixed(2)),
      expected: parseFloat(expected.toFixed(2)),
    };
  });

  // Interpret MAD score
  const getMADInterpretation = (mad: number) => {
    if (mad < 0.006) {
      return {
        level: "Normal",
        color: "text-green-600 bg-green-50 border-green-200",
        message: "Data conforms closely to Benford's Law — no significant irregularities detected",
      };
    } else if (mad < 0.015) {
      return {
        level: "Moderate",
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
        message: "Moderate deviation from expected pattern — recommend detailed review",
      };
    } else {
      return {
        level: "High Risk",
        color: "text-red-600 bg-red-50 border-red-200",
        message: "Strong deviation detected — high likelihood of data manipulation or fraud",
      };
    }
  };

  const interpretation = getMADInterpretation(data.mad);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const digit = payload[0].payload.digit;
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">Leading Digit: {digit}</p>
          <p className="text-sm text-blue-600">
            Observed: {payload[0].value}%
          </p>
          <p className="text-sm text-gray-600">
            Expected: {payload[1].value}%
          </p>
          <p className="text-xs text-gray-500 mt-2 max-w-xs">
            Example: If amounts like ₹{digit}42,500 appear more or less frequently than expected,
            it may indicate rounded figures or manipulation.
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Benford's Law Analysis
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            First-digit frequency distribution test
          </p>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          aria-label="Show information about Benford's Law"
        >
          <Info className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {showInfo && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">How to read this chart</h3>
          <p className="text-sm text-blue-800 leading-relaxed">
            Benford's Law states that in naturally occurring numbers, the digit "1" appears
            as the first digit about 30% of the time, "2" about 18%, and so on. Significant
            deviations suggest artificial or manipulated data, such as fabricated invoices.
          </p>
        </div>
      )}

      {/* MAD and Chi-Square Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className={`border rounded-lg p-4 ${interpretation.color}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">MAD Score</span>
            <span className="text-2xl font-bold">{data.mad.toFixed(4)}</span>
          </div>
          <p className="text-xs">{interpretation.message}</p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">χ² (Chi-Square)</span>
            <span className="text-2xl font-bold text-gray-900">{data.chi2.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-600">
            {data.chi2 > 15.5
              ? "Statistically significant deviation (p < 0.05)"
              : "Within normal statistical variation"}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-80" role="img" aria-label="Benford's Law digit frequency chart">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="digit"
              label={{ value: "Leading Digit", position: "insideBottom", offset: -10 }}
              tick={{ fill: "#6b7280" }}
            />
            <YAxis
              label={{ value: "Frequency (%)", angle: -90, position: "insideLeft" }}
              tick={{ fill: "#6b7280" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="rect"
            />
            <Bar
              dataKey="observed"
              fill="#3b82f6"
              name="Observed Frequency"
              radius={[8, 8, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="expected"
              stroke="#ef4444"
              strokeWidth={2}
              name="Benford Expected"
              dot={{ fill: "#ef4444", r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Interpretation */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h3 className="font-semibold text-gray-900 mb-2">Interpretation</h3>
        <div className={`rounded-lg p-4 border ${interpretation.color}`}>
          <p className="text-sm font-medium mb-1">{interpretation.level}</p>
          <p className="text-sm">{interpretation.message}</p>
        </div>
      </div>
    </div>
  );
}
