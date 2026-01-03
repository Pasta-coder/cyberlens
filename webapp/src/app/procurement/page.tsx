"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, HelpCircle, RefreshCw } from "lucide-react";
import { getDashboardData, type DashboardData } from "@/lib/api";

// Import all dashboard components
import SummaryCards from "@/components/dashboard/SummaryCards";
import BenfordChart from "@/components/dashboard/BenfordChart";
import ProcurementFunnel from "@/components/dashboard/ProcurementFunnel";
import LeaderboardTable from "@/components/dashboard/LeaderboardTable";
import TrendChart from "@/components/dashboard/TrendChart";
import IntegrityHeatmap from "@/components/dashboard/IntegrityHeatmap";
import CartelRadar from "@/components/dashboard/CartelRadar";
import ExportControls from "@/components/dashboard/ExportControls";
import HowToReadModal from "@/components/ui/HowToReadModal";

export default function ProcurementDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getDashboardData();
      setDashboardData(data);
      
      // Check if we're using mock data (rough heuristic)
      if (data.summary?.tenders_analyzed === 4523) {
        setUsingMockData(true);
      }
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 py-12 px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Loading Fraud Detection Dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Analyzing procurement data</p>
        </div>
      </main>
    );
  }

  if (error || !dashboardData) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 py-12 px-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 text-red-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadDashboard}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-medium transition inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 py-6 md:py-12 px-4 md:px-6">
        <div className="max-w-[1600px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-2 md:gap-3">
                  <Shield className="w-8 h-8 md:w-10 md:h-10 text-cyan-600" />
                  Government Procurement Fraud Detection
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-2">
                  AI-powered analysis of procurement patterns and fraud indicators
                </p>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={() => setShowHelpModal(true)}
                  className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 md:px-4 py-2 rounded-lg font-medium transition text-sm md:text-base"
                  aria-label="How to read this dashboard"
                >
                  <HelpCircle className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">How to Read</span>
                  <span className="sm:hidden">Help</span>
                </button>

                <button
                  onClick={loadDashboard}
                  className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-3 md:px-4 py-2 rounded-lg font-medium transition text-sm md:text-base"
                  aria-label="Refresh dashboard"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* Mock Data Warning */}
            {usingMockData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4"
              >
                <p className="text-xs md:text-sm text-yellow-800">
                  <strong>Note:</strong> Displaying mock data for demonstration. Connect to
                  backend API for real procurement analysis.
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Summary Cards */}
          <SummaryCards data={dashboardData.summary} />

          {/* Main Content Grid */}
          <div className="space-y-8">
            {/* Row 1: Heatmap + Funnel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <IntegrityHeatmap regions={dashboardData.regions} />
              <ProcurementFunnel data={dashboardData.funnel} />
            </div>

            {/* Row 2: Benford Analysis */}
            <BenfordChart data={dashboardData.benford} />

            {/* Row 3: Trend Chart */}
            <TrendChart data={dashboardData.time_series} />

            {/* Row 4: Cartel Network */}
            <CartelRadar
              buyers={dashboardData.network.buyers}
              suppliers={dashboardData.network.suppliers}
              edges={dashboardData.network.edges}
            />

            {/* Row 5: Leaderboard */}
            <LeaderboardTable data={dashboardData.leaderboard} />

            {/* Row 6: Export Controls */}
            <ExportControls
              dashboardData={dashboardData}
              onExport={(format) => {
                console.log(`Exported as ${format}`);
              }}
            />
          </div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center text-sm text-gray-600 border-t border-gray-200 pt-8"
          >
            <p>
              Built with CyberLens AI Forensics Platform | Data updated:{" "}
              {new Date().toLocaleDateString("en-IN")}
            </p>
            <p className="mt-2">
              For transparency and accountability in government procurement
            </p>
          </motion.footer>
        </div>
      </main>

      {/* Help Modal */}
      <HowToReadModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </>
  );
}
