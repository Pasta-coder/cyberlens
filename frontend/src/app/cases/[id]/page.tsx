"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

type Entity = { kind: string; value: string; confidence?: number };
type Osint = { source: string; url: string; snippet: string; confidence: number };
type Category = { category: string; confidence: number; reason: string };

export default function CasePage() {
  const { id } = useParams<{ id: string }>();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [osintHits, setOsintHits] = useState<Osint[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [risk, setRisk] = useState<number>(0);
  const [textPreview, setTextPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const form = new FormData();
      form.append("file_id", id!);
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/analyze`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res.data;
      setEntities(data.entities || []);
      setOsintHits(data.osint_hits || []);
      setCategory(data.category);
      setRisk(data.risk_score || 0);
      setTextPreview(data.raw_text || "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchAnalysis(); }, [id]);

  const riskColor = risk < 0.4 ? "bg-green-500" : risk < 0.7 ? "bg-yellow-500" : "bg-red-600";

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Case Intelligence Report</h1>

      {loading && <p className="text-gray-600">Analyzing...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <>
          {/* Classification Summary */}
          <div className="p-4 border rounded-lg shadow-sm bg-white">
            <h2 className="text-lg font-semibold mb-2">Incident Classification</h2>
            <p><b>Category:</b> {category?.category}</p>
            <p><b>Reason:</b> {category?.reason}</p>
            <div className="mt-3">
              <div className="text-sm font-medium mb-1">Risk Score: {(risk * 100).toFixed(0)}%</div>
              <div className="w-full h-3 bg-gray-200 rounded-full">
                <div className={`h-3 rounded-full ${riskColor}`} style={{ width: `${risk * 100}%` }}></div>
              </div>
            </div>
          </div>

          {/* Entities */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Extracted Entities</h2>
            {entities.length === 0 ? <p>No entities found.</p> :
              <table className="w-full text-sm border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2 w-1/5 text-left">Type</th>
                    <th className="border p-2 text-left">Value</th>
                    <th className="border p-2 text-right w-1/6">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {entities.map((e, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="border p-2 font-medium">{e.kind}</td>
                      <td className="border p-2">{e.value}</td>
                      <td className="border p-2 text-right">{e.confidence ? `${(e.confidence * 100).toFixed(1)}%` : "--"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>}
          </div>

          {/* OSINT Results */}
          <div>
            <h2 className="text-xl font-semibold mb-2">OSINT Findings</h2>
            {osintHits.length === 0 ? <p>No OSINT evidence found.</p> :
              <ul className="space-y-3">
                {osintHits.map((o, i) => (
                  <li key={i} className="border rounded p-3 bg-gray-50">
                    <a href={o.url} target="_blank" className="font-medium text-blue-600">{o.source}</a>
                    <p className="text-sm text-gray-700">{o.snippet}</p>
                    <p className="text-xs text-gray-500 mt-1">Confidence: {(o.confidence * 100).toFixed(0)}%</p>
                  </li>
                ))}
              </ul>}
          </div>

          {/* Text Preview */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Text Preview</h2>
            <div className="border rounded p-3 bg-gray-50 text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
              {textPreview || "No text extracted."}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
