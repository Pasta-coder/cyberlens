"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

type Entity = {
  kind: string;
  value: string;
  confidence: number;
};

export default function CasePage() {
  const { id } = useParams<{ id: string }>();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [textPreview, setTextPreview] = useState<string>("");

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`http://localhost:8000/api/analyze?file_id=${id}`);
      setEntities(res.data.entities || []);
      setTextPreview(res.data.text_preview || "");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze evidence");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchAnalysis();
  }, [id]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Case Analysis</h1>

      {loading && <p className="text-gray-600">Analyzing evidence...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Extracted Entities</h2>
            <button
              onClick={fetchAnalysis}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
            >
              🔁 Re-run Analysis
            </button>
          </div>

          {entities.length === 0 ? (
            <p>No entities detected in this evidence.</p>
          ) : (
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left w-1/5">Type</th>
                  <th className="border p-2 text-left">Value</th>
                  <th className="border p-2 text-right w-1/6">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {entities.map((e, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border p-2 font-medium">{e.kind}</td>
                    <td className="border p-2">{e.value}</td>
                    <td className="border p-2 text-right">{Math.round(e.confidence * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">Text Preview</h2>
            <div className="border rounded p-3 text-sm bg-gray-50 whitespace-pre-wrap max-h-64 overflow-y-auto">
              {textPreview || "No text extracted."}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
