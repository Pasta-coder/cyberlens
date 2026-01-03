"use client";

import { X, Shield, TrendingUp, AlertTriangle, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HowToReadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToReadModal({ isOpen, onClose }: HowToReadModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 id="modal-title" className="text-2xl font-bold text-gray-900">
                  📖 How to Read This Dashboard
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Introduction */}
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-5">
                  <h3 className="font-semibold text-cyan-900 mb-2 text-lg">
                    Welcome to the Procurement Fraud Detection Dashboard
                  </h3>
                  <p className="text-sm text-cyan-800 leading-relaxed">
                    This dashboard uses artificial intelligence and statistical analysis to
                    identify suspicious patterns in government procurement. All risk scores
                    and fraud indicators come from automated analysis of tender data. This
                    guide will help you understand what each visualization means and how to
                    act on the insights.
                  </p>
                </div>

                {/* Risk Levels */}
                <section>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Understanding Risk Levels
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="w-3 h-3 rounded-full bg-red-500 mt-1"></div>
                      <div>
                        <p className="font-semibold text-red-900 text-sm">High Risk (70-100)</p>
                        <p className="text-xs text-red-700">
                          Strong fraud indicators detected. Requires immediate audit and
                          investigation. Common patterns: single-bid awards, specification
                          manipulation, repeat supplier concentration.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1"></div>
                      <div>
                        <p className="font-semibold text-yellow-900 text-sm">
                          Medium Risk (40-69)
                        </p>
                        <p className="text-xs text-yellow-700">
                          Moderate irregularities that warrant enhanced monitoring. May be
                          explained by legitimate factors but should be reviewed periodically.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
                      <div>
                        <p className="font-semibold text-green-900 text-sm">Low Risk (0-39)</p>
                        <p className="text-xs text-green-700">
                          Normal procurement patterns. Competitive bidding and standard
                          processes observed. Continue routine oversight.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Key Visualizations */}
                <section>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Key Visualizations Explained
                  </h3>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Summary Cards (Top)
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Shows overall procurement volume and risk counts. Use these to
                        understand the scale of analysis.
                      </p>
                      <p className="text-xs text-gray-600 italic">
                        Example: "231 high-risk tenders" means 231 tenders show multiple
                        fraud indicators and need review.
                      </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Benford's Law Chart
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">
                        A statistical test that detects unnatural number patterns. In real
                        data, numbers starting with "1" appear ~30% of the time. Large
                        deviations suggest fabricated amounts.
                      </p>
                      <p className="text-xs text-gray-600 italic">
                        Look at: MAD score above 0.015 indicates manipulation.
                      </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Procurement Funnel
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Shows how many tenders move from publication → bids → awards. Healthy
                        markets have 3-5 bidders per tender.
                      </p>
                      <p className="text-xs text-gray-600 italic">
                        Red flag: High drop-off rate or average bidders below 2 suggests
                        limited competition.
                      </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Cartel Radar (Network)</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Visual map showing relationships between buyers and suppliers. Look
                        for star patterns (one buyer, one dominant supplier) or tight
                        clusters.
                      </p>
                      <p className="text-xs text-gray-600 italic">
                        Click nodes to see details. Red glow = suspicious concentration.
                      </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Leaderboard Table</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Lists entities with highest risk scores. Sortable by spend, risk,
                        single-bid percentage. Use "View evidence" to drill down.
                      </p>
                      <p className="text-xs text-gray-600 italic">
                        Priority: Start investigation with entities at rank 1-5.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Common Red Flags */}
                <section>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    Common Red Flags to Watch For
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">1.</span>
                      <span>
                        <strong>Single-Bid Pattern:</strong> More than 50% of contracts
                        awarded with only one bidder suggests specification manipulation or
                        supplier collusion.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">2.</span>
                      <span>
                        <strong>Short Submission Windows:</strong> Less than 5 days to submit
                        bids prevents fair competition and may favor insiders.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">3.</span>
                      <span>
                        <strong>Golden Parameters:</strong> Overly specific requirements that
                        only one supplier can meet (e.g., exact model numbers).
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">4.</span>
                      <span>
                        <strong>Repeat Supplier Dominance:</strong> One supplier winning 70%+
                        of contracts from a buyer indicates potential favoritism.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">5.</span>
                      <span>
                        <strong>Split Contracts:</strong> Large procurements split into
                        smaller amounts to avoid oversight thresholds.
                      </span>
                    </li>
                  </ul>
                </section>

                {/* Actions */}
                <section className="bg-cyan-50 border border-cyan-200 rounded-xl p-5">
                  <h3 className="font-bold text-cyan-900 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    What Actions Should I Take?
                  </h3>
                  <ol className="space-y-3 text-sm text-cyan-800">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">1.</span>
                      <span>
                        <strong>High-Risk Entities:</strong> Flag for immediate audit. Request
                        supporting documents, interview procurement officers, verify supplier
                        independence.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">2.</span>
                      <span>
                        <strong>Medium-Risk Patterns:</strong> Set up enhanced monitoring.
                        Review high-value contracts manually. Conduct surprise spot-checks.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">3.</span>
                      <span>
                        <strong>Low Competition:</strong> Review tender specifications for
                        unnecessary restrictions. Expand supplier outreach. Consider
                        increasing submission windows.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">4.</span>
                      <span>
                        <strong>Export & Share:</strong> Use export buttons to generate reports
                        for senior management or public transparency portals.
                      </span>
                    </li>
                  </ol>
                </section>

                {/* Footer */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    <strong>Disclaimer:</strong> This dashboard provides automated risk
                    indicators based on statistical analysis and machine learning models.
                    All flags should be verified through proper investigation procedures.
                    High risk scores do not automatically prove fraud — they indicate patterns
                    worth investigating. Always follow due process and presumption of innocence.
                  </p>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition"
                >
                  Got it, thanks!
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
