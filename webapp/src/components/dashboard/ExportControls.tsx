"use client";

import { useState } from "react";
import { Download, FileText, FileJson, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ExportControlsProps {
  dashboardData: any;
  onExport?: (format: "pdf" | "json") => void;
}

export default function ExportControls({
  dashboardData,
  onExport,
}: ExportControlsProps) {
  const [exporting, setExporting] = useState<"pdf" | "json" | null>(null);

  const handleExportPDF = async () => {
    setExporting("pdf");
    try {
      // In a real implementation, this would use html2pdf or jsPDF
      // For now, we'll simulate the export
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create a simple text summary for demo
      const summary = `
CYBERLENS PROCUREMENT FRAUD DETECTION REPORT
============================================

EXECUTIVE SUMMARY
-----------------
Total Spend: ₹${dashboardData.summary?.total_spend?.toLocaleString("en-IN")}
Tenders Analyzed: ${dashboardData.summary?.tenders_analyzed}
High-Risk Tenders: ${dashboardData.summary?.high_risk_tenders}
Departments Flagged: ${dashboardData.summary?.departments_flagged}

BENFORD ANALYSIS
----------------
MAD Score: ${dashboardData.benford?.mad}
Status: ${
        dashboardData.benford?.mad > 0.015
          ? "High Risk - Strong deviation detected"
          : "Normal - Conforms to expected pattern"
      }

Generated: ${new Date().toLocaleString()}
`;

      // Create a blob and download
      const blob = new Blob([summary], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `procurement-fraud-report-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (onExport) onExport("pdf");
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  const handleExportJSON = () => {
    setExporting("json");
    try {
      // Export the dashboard data as JSON
      const dataStr = JSON.stringify(dashboardData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `procurement-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (onExport) onExport("json");
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Download className="w-5 h-5 text-gray-700" />
        <h3 className="text-lg font-bold text-gray-900">Export & Share</h3>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Download this dashboard as a report or export raw data for further analysis
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PDF Export */}
        <button
          onClick={handleExportPDF}
          disabled={exporting !== null}
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-6 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Export as PDF report"
        >
          {exporting === "pdf" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              <span>Export as Report</span>
            </>
          )}
        </button>

        {/* JSON Export */}
        <button
          onClick={handleExportJSON}
          disabled={exporting !== null}
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Export as JSON data"
        >
          {exporting === "json" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <FileJson className="w-5 h-5" />
              <span>Export as JSON</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">
          About these exports
        </h4>
        <ul className="space-y-2 text-xs text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-red-500">•</span>
            <span>
              <strong>Report (PDF/TXT):</strong> Human-readable summary with charts
              and plain-language explanations for stakeholders
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            <span>
              <strong>JSON Data:</strong> Machine-readable format for open data
              initiatives, further analysis, or integration with other systems
            </span>
          </li>
        </ul>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> All exported data follows open data standards and
          can be used for transparency initiatives, academic research, or
          investigative journalism.
        </p>
      </div>
    </motion.div>
  );
}
