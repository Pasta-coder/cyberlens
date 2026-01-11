"use client";

import { useState } from "react";
import { batchAnalyze, generateUnifiedReport, openPdfBlob } from "@/lib/api";
import { useSatyaSetuAIStore } from "@/lib/store";

export default function BatchPage() {
  const { setNotification } = useSatyaSetuAIStore();
  const [files, setFiles] = useState<FileList | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleBatchAnalyze() {
    if (!files) return alert("Please select files first.");
    setLoading(true);
    try {
      const result = await batchAnalyze(Array.from(files));
      setBatchId(result.batch_id);
      setNotification(`Batch created: ${result.batch_id}`);
    } catch (e) {
      console.error(e);
      setNotification("Batch analysis failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadUnified() {
    if (!batchId) return alert("No batch ID yet.");
    setLoading(true);
    try {
      const blob = await generateUnifiedReport(batchId);
      openPdfBlob(blob, `unified_${batchId}.pdf`);
      setNotification("Unified report downloaded ✅");
    } catch (e) {
      console.error(e);
      setNotification("Failed to generate unified report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-4">🧩 Batch Analyzer</h1>
      <p className="text-gray-600 mb-6">
        Upload multiple scam evidence files to create a unified intelligence batch.
      </p>

      <input
        type="file"
        multiple
        className="mb-4 block w-full border p-2 rounded"
        onChange={(e) => setFiles(e.target.files)}
      />

      <button
        onClick={handleBatchAnalyze}
        disabled={loading}
        className="bg-cyan-600 text-white px-4 py-2 rounded hover:opacity-90 mr-3"
      >
        {loading ? "Analyzing..." : "Create Batch"}
      </button>

      {batchId && (
        <button
          onClick={handleDownloadUnified}
          className="bg-green-600 text-white px-4 py-2 rounded hover:opacity-90"
        >
          Download Unified Report
        </button>
      )}

      {batchId && (
        <p className="mt-4 text-sm text-gray-600">
          Current Batch ID: <b>{batchId}</b>
        </p>
      )}
    </main>
  );
}
