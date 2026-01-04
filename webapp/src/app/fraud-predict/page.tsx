"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Upload, Database, Info } from "lucide-react";

// Helper to get the API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function FraudPredictPage() {
  const [singleMode, setSingleMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);

  // Single contract form state
  const [formData, setFormData] = useState({
    contract_name: "",
    amount: "",
    date: "", // dd-mm-yyyy
    bidders: "3", // Default to 3 to avoid accidental single-bidder flags
    department: "",
  });

  // Batch mode state
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchResults, setBatchResults] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const predictSingle = async () => {
    setLoading(true);
    setResult(null);
    try {
      // 1. Parse Date to get Month and Sunday status
      let award_month = 6;
      let is_sunday = false;
      let is_december = false;

      if (formData.date) {
        const parts = formData.date.split("-");
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]);
          const year = parseInt(parts[2]);
          const dateObj = new Date(year, month - 1, day);

          award_month = month;
          is_sunday = dateObj.getDay() === 0; // 0 is Sunday
          is_december = month === 12;
        }
      }

      // 2. Prepare Payload matching Backend Schema (ContractInput)
      const payload = {
        name: formData.contract_name || "Unknown Contract",
        department: formData.department || "General",
        estimated_price: parseFloat(formData.amount) || 0,
        final_price: parseFloat(formData.amount) || 0, // Assuming fixed price for now
        bidders: parseInt(formData.bidders) || 1,
        award_month: award_month,
        is_sunday: is_sunday,
        is_december: is_december
      };

      const res = await fetch(`${API_URL}/api/fraud-predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Server error");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Prediction failed: " + (err as Error).message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const predictBatch = async () => {
    if (!batchFile) {
      alert("Please upload a JSON file");
      return;
    }
    setLoading(true);
    setBatchResults(null);
    try {
      const fileContent = await batchFile.text();
      const contracts = JSON.parse(fileContent);

      const res = await fetch(`${API_URL}/api/fraud-predict/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contracts }),
      });
      const data = await res.json();
      setBatchResults(data);
    } catch (err) {
      alert("Batch prediction failed: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchModelInfo = async () => {
    try {
      const res = await fetch(`${API_URL}/api/fraud-predict/model-info`);
      const data = await res.json();
      setModelInfo(data);
    } catch (err) {
      alert("Failed to fetch model info");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            ⚖️ Fraud Detection & Prediction
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            AI-powered contract analysis to detect fraudulent patterns using machine learning models
          </p>
        </motion.div>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setSingleMode(true)}
            className={`px-6 py-2 rounded-lg font-medium transition ${singleMode
                ? "bg-cyan-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300"
              }`}
          >
            Single Contract
          </button>
          <button
            onClick={() => setSingleMode(false)}
            className={`px-6 py-2 rounded-lg font-medium transition ${!singleMode
                ? "bg-cyan-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300"
              }`}
          >
            Batch Upload
          </button>
          <button
            onClick={fetchModelInfo}
            className="px-6 py-2 rounded-lg font-medium bg-gray-900 text-white hover:bg-gray-800 transition flex items-center gap-2"
          >
            <Info className="w-4 h-4" /> Model Info
          </button>
        </div>

        {/* Single Contract Form */}
        {singleMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Enter Contract Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <InputField
                  label="Contract Name / Title *"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Construction of Highway Bypass Section A-12"
                />
              </div>

              <InputField
                label="Contract Title"
                name="contract_name"
                value={formData.contract_name}
                onChange={handleInputChange}
                placeholder="e.g., Road Construction Project Phase 1"
              />
              <InputField
                label="Department / Agency"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="e.g., Ministry of Transport"
              />
              <InputField
                label="Contract Value (Amount)"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="e.g., 50000"
              />
              <InputField
                label="Number of Bidders"
                name="bidders"
                type="number"
                value={formData.bidders}
                onChange={handleInputChange}
                placeholder="e.g., 3"
              />
              <InputField
                label="Award Date (dd-mm-yyyy)"
                name="date"
                type="text"
                value={formData.date}
                onChange={handleInputChange}
                placeholder="e.g., 25-12-2023"
              />
            </div>
            <button
              onClick={predictSingle}
              disabled={loading}
              className="mt-8 w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 transition"
            >
              {loading ? "Analyzing..." : "🔍 Predict Fraud Risk"}
            </button>
          </motion.div>
        )}

        {/* Batch Upload */}
        {!singleMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Upload Batch Contracts (JSON)
            </h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-cyan-500 transition">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <input
                type="file"
                accept=".json"
                onChange={(e) => setBatchFile(e.target.files?.[0] || null)}
                className="hidden"
                id="batch-upload"
              />
              <label
                htmlFor="batch-upload"
                className="cursor-pointer text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Click to upload JSON file
              </label>
              {batchFile && (
                <p className="mt-3 text-sm text-gray-600">
                  Selected: <span className="font-medium">{batchFile.name}</span>
                </p>
              )}
            </div>
            <button
              onClick={predictBatch}
              disabled={loading || !batchFile}
              className="mt-6 w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 transition"
            >
              {loading ? "Processing..." : "📊 Analyze Batch"}
            </button>
          </motion.div>
        )}

        {/* Single Result Display */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              {result.risk_level === "CRITICAL" || result.risk_level === "HIGH" ? (
                <AlertTriangle className="w-8 h-8 text-red-500" />
              ) : (
                <CheckCircle className="w-8 h-8 text-green-500" />
              )}
              <h2 className="text-2xl font-bold">
                Risk Level:{" "}
                <span style={{ color: result.risk_level === "LOW" ? "green" : "red" }}>
                  {result.risk_level} {result.risk_color}
                </span>
              </h2>
            </div>

            <p className="mb-4 text-gray-700">
              <strong>Recommendation:</strong> {result.recommendation}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Risk Score (CRI)</p>
                <p className="text-2xl font-semibold">{(result.predicted_cri * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Contract Value</p>
                {/* Safe access to feature breakdown */}
                <p className="text-2xl font-semibold">
                  {result.feature_breakdown?.price_efficiency
                    ? "Efficiency: " + result.feature_breakdown.price_efficiency
                    : "N/A"}
                </p>
              </div>
            </div>

            {result.fraud_signals && result.fraud_signals.length > 0 ? (
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-3">🚩 Fraud Signals Detected</h3>
                <div className="space-y-2">
                  {result.fraud_signals.map((signal: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-red-50 border border-red-200 rounded-lg p-4"
                    >
                      <p className="font-medium text-red-800">{signal.signal}</p>
                      <p className="text-sm text-gray-700 mt-1">{signal.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Severity: <span className="font-medium">{signal.severity}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 bg-green-50 border border-green-200 p-4 rounded-lg text-green-800">
                No specific fraud signals detected.
              </div>
            )}
          </motion.div>
        )}

        {/* Batch Results */}
        {batchResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6">Batch Analysis Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Total Contracts</p>
                <p className="text-3xl font-bold text-blue-600">
                  {batchResults.total_contracts}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">High/Critical Risk</p>
                <p className="text-3xl font-bold text-red-600">
                  {(batchResults.risk_distribution.high || 0) + (batchResults.risk_distribution.critical || 0)}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Low Risk</p>
                <p className="text-3xl font-bold text-green-600">
                  {batchResults.risk_distribution.low || 0}
                </p>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {batchResults.predictions.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className={`border rounded-lg p-4 ${["HIGH", "CRITICAL"].includes(item.risk_level)
                      ? "bg-red-50 border-red-200"
                      : "bg-green-50 border-green-200"
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate max-w-xs">{item.contract_name}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${["HIGH", "CRITICAL"].includes(item.risk_level)
                          ? "bg-red-200 text-red-800"
                          : "bg-green-200 text-green-800"
                        }`}
                    >
                      {item.risk_level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Risk Score: {(item.predicted_cri * 100).toFixed(1)}% | Recommendation: {item.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Model Info Display */}
        {modelInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 mt-8"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Database className="w-6 h-6" /> Model Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard label="Model Type" value={modelInfo.model_type || "Unknown"} />
              <InfoCard label="Training Data" value={modelInfo.training_data || "N/A"} />
              <InfoCard label="Accuracy (R²)" value={modelInfo.model_performance?.r2_score || "N/A"} />
              <InfoCard label="Test RMSE" value={modelInfo.model_performance?.test_rmse || "N/A"} />
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-3">Detectable Fraud Signals</h3>
              <div className="flex flex-wrap gap-2">
                {modelInfo.fraud_signals_detected?.map((sig: string, idx: number) => (
                  <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {sig}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
}: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
      />
    </div>
  );
}

// Fixed InfoCard to handle safe rendering
function InfoCard({ label, value }: { label: string; value: any }) {
  const displayValue =
    typeof value === 'boolean'
      ? (value ? "Yes" : "No")
      : String(value);

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-lg font-semibold text-gray-900 mt-1">{displayValue}</p>
    </div>
  );
}