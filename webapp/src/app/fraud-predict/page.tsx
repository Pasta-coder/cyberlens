"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Upload, Database, Info } from "lucide-react";

export default function FraudPredictPage() {
  const [singleMode, setSingleMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);

  // Single contract form state
  const [formData, setFormData] = useState({
    contract_type: "",
    amount: "",
    date: "",
    counterparty_name: "",
    counterparty_country: "",
    industry: "",
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
      const res = await fetch("http://127.0.0.1:8000/api/fraud-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          duration_days: parseInt(formData.date),
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Prediction failed: " + (err as Error).message);
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

      const res = await fetch("http://127.0.0.1:8000/api/fraud-predict/batch", {
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
      const res = await fetch("http://127.0.0.1:8000/api/fraud-predict/model-info");
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
            🚨 Fraud Detection & Prediction
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            AI-powered contract analysis to detect fraudulent patterns using machine learning models
          </p>
        </motion.div>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setSingleMode(true)}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              singleMode
                ? "bg-cyan-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Single Contract
          </button>
          <button
            onClick={() => setSingleMode(false)}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              !singleMode
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
              <InputField
                label="Contract Type"
                name="contract_type"
                value={formData.contract_type}
                onChange={handleInputChange}
                placeholder="e.g., service_agreement"
              />
              <InputField
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="e.g., 50000"
              />
              <InputField
                label="Date (dd-mm-yyyy)"
                name="date"
                type="text"
                value={formData.date}
                onChange={handleInputChange}
                placeholder="e.g., 01-01-2023"
              />
              <InputField
                label="Counterparty Name"
                name="counterparty_name"
                value={formData.counterparty_name}
                onChange={handleInputChange}
                placeholder="e.g., ABC Corp"
              />
              <InputField
                label="Counterparty Country"
                name="counterparty_country"
                value={formData.counterparty_country}
                onChange={handleInputChange}
                placeholder="e.g., USA"
              />

              <InputField
                label="Industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                placeholder="e.g., technology"
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
              {loading ? "Processing..." : "🔍 Analyze Batch"}
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
              {result.prediction === "fraud" ? (
                <AlertTriangle className="w-8 h-8 text-red-500" />
              ) : (
                <CheckCircle className="w-8 h-8 text-green-500" />
              )}
              <h2 className="text-2xl font-bold">
                Prediction:{" "}
                <span
                  className={
                    result.prediction === "fraud" ? "text-red-600" : "text-green-600"
                  }
                >
                  {result.prediction.toUpperCase()}
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Confidence</p>
                <p className="text-2xl font-semibold">{(result.confidence * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Risk Score</p>
                <p className="text-2xl font-semibold text-red-600">
                  {(result.fraud_probability * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            {result.fraud_signals && result.fraud_signals.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-3">🚩 Fraud Signals Detected</h3>
                <div className="space-y-2">
                  {result.fraud_signals.map((signal: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-red-50 border border-red-200 rounded-lg p-4"
                    >
                      <p className="font-medium text-red-800">{signal.signal_type}</p>
                      <p className="text-sm text-gray-700 mt-1">{signal.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Severity: <span className="font-medium">{signal.severity}</span>
                      </p>
                    </div>
                  ))}
                </div>
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
                <p className="text-sm text-gray-600">Flagged as Fraud</p>
                <p className="text-3xl font-bold text-red-600">
                  {batchResults.fraud_count}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Legitimate</p>
                <p className="text-3xl font-bold text-green-600">
                  {batchResults.legitimate_count}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {batchResults.results.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className={`border rounded-lg p-4 ${
                    item.prediction === "fraud"
                      ? "bg-red-50 border-red-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Contract #{idx + 1}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        item.prediction === "fraud"
                          ? "bg-red-200 text-red-800"
                          : "bg-green-200 text-green-800"
                      }`}
                    >
                      {item.prediction.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Confidence: {(item.confidence * 100).toFixed(1)}% | Risk:{" "}
                    {(item.fraud_probability * 100).toFixed(1)}%
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
              <InfoCard label="Model Type" value={modelInfo.model_type} />
              <InfoCard label="Version" value={modelInfo.version} />
              <InfoCard label="Accuracy" value={`${(modelInfo.metrics?.accuracy * 100).toFixed(1)}%`} />
              <InfoCard label="Precision" value={`${(modelInfo.metrics?.precision * 100).toFixed(1)}%`} />
              <InfoCard label="Recall" value={`${(modelInfo.metrics?.recall * 100).toFixed(1)}%`} />
              <InfoCard label="F1 Score" value={`${(modelInfo.metrics?.f1_score * 100).toFixed(1)}%`} />
            </div>
            {modelInfo.feature_importance && (
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-3">Feature Importance</h3>
                <div className="space-y-2">
                  {modelInfo.feature_importance.slice(0, 5).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-32">{item.feature}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-cyan-600 h-3 rounded-full"
                          style={{ width: `${item.importance * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{(item.importance * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-lg font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
