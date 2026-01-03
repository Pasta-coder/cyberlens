"use client";

import { AlertTriangle, CheckCircle, Info, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface FraudSignal {
  signal_type: string;
  description: string;
  severity: "high" | "medium" | "low";
}

interface ExplainPanelProps {
  entityName: string;
  entityType: "buyer" | "supplier";
  riskScore: number;
  totalContracts: number;
  totalSpend: number;
  fraudSignals: FraudSignal[];
  sampleContracts?: Array<{
    id: string;
    title: string;
    value: number;
  }>;
}

export default function ExplainPanel({
  entityName,
  entityType,
  riskScore,
  totalContracts,
  totalSpend,
  fraudSignals,
  sampleContracts = [],
}: ExplainPanelProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70)
      return {
        level: "High Risk",
        color: "text-red-600 bg-red-50 border-red-200",
        icon: AlertTriangle,
      };
    if (score >= 40)
      return {
        level: "Medium Risk",
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
        icon: Info,
      };
    return {
      level: "Low Risk",
      color: "text-green-600 bg-green-50 border-green-200",
      icon: CheckCircle,
    };
  };

  const risk = getRiskLevel(riskScore);
  const RiskIcon = risk.icon;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-700 border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const generateNarrative = () => {
    const narrativeParts = [];

    // Risk level statement
    if (riskScore >= 70) {
      narrativeParts.push(
        `This ${entityType} shows high fraud risk indicators and requires immediate audit attention.`
      );
    } else if (riskScore >= 40) {
      narrativeParts.push(
        `This ${entityType} exhibits moderate risk patterns worth monitoring.`
      );
    } else {
      narrativeParts.push(
        `This ${entityType} appears to follow normal procurement practices.`
      );
    }

    // Contract patterns
    if (fraudSignals.some((s) => s.signal_type === "single_bid")) {
      narrativeParts.push(
        "High proportion of contracts awarded with single bid, indicating limited competition."
      );
    }

    // Specifications
    if (fraudSignals.some((s) => s.signal_type === "golden_param")) {
      narrativeParts.push(
        "Tender specifications appear tailored to favor specific suppliers."
      );
    }

    // Timeline issues
    if (fraudSignals.some((s) => s.signal_type === "short_window")) {
      narrativeParts.push(
        "Multiple tenders had unusually short submission windows."
      );
    }

    // Repeat supplier pattern
    if (fraudSignals.some((s) => s.signal_type === "repeat_supplier")) {
      narrativeParts.push(
        `Concentrated awarding pattern with ${entityType === "buyer" ? "limited supplier diversity" : "repeat buyer relationships"}.`
      );
    }

    // Recommendation
    if (riskScore >= 70) {
      narrativeParts.push(
        "**Recommended Action:** Conduct comprehensive audit including document review, interview stakeholders, and verify supplier independence."
      );
    } else if (riskScore >= 40) {
      narrativeParts.push(
        "**Recommended Action:** Enhanced monitoring and periodic spot-checks of high-value contracts."
      );
    }

    return narrativeParts;
  };

  const narrative = generateNarrative();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-md"
      role="complementary"
      aria-label={`Evidence panel for ${entityName}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{entityName}</h3>
          <p className="text-sm text-gray-500 capitalize">{entityType}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${risk.color}`}>
          <RiskIcon className="w-4 h-4" />
          <span className="text-sm font-semibold">{riskScore}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">Total Contracts</p>
          <p className="text-xl font-bold text-gray-900">{totalContracts}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">Total Value</p>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(totalSpend)}
          </p>
        </div>
      </div>

      {/* AI-Generated Narrative */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-600" />
          Why This Matters
        </h4>
        <div className="space-y-3">
          {narrative.map((sentence, index) => (
            <p
              key={index}
              className={`text-sm leading-relaxed ${
                sentence.startsWith("**")
                  ? "font-semibold text-cyan-700 bg-cyan-50 p-2 rounded-md border border-cyan-200"
                  : "text-gray-700"
              }`}
            >
              {sentence.replace(/\*\*/g, "")}
            </p>
          ))}
        </div>
      </div>

      {/* Fraud Signals */}
      {fraudSignals.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">
            Red Flags Detected ({fraudSignals.length})
          </h4>
          <div className="space-y-2">
            {fraudSignals.slice(0, 3).map((signal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border text-sm ${getSeverityColor(
                  signal.severity
                )}`}
              >
                <p className="font-medium mb-1">{signal.signal_type.replace(/_/g, " ").toUpperCase()}</p>
                <p className="text-xs leading-relaxed">{signal.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Sample Contracts */}
      {sampleContracts.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Sample Contracts</h4>
          <div className="space-y-2">
            {sampleContracts.slice(0, 3).map((contract) => (
              <div
                key={contract.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {contract.title}
                  </p>
                  <p className="text-xs text-gray-500">{contract.id}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(contract.value)}
                  </span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg font-medium text-sm transition">
          Full Report
        </button>
        <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium text-sm transition">
          Flag for Review
        </button>
      </div>
    </motion.div>
  );
}
