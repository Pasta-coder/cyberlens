"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import EvidenceUploader from "@/components/EvidenceUploader";
import RiskMeter from "@/components/RiskMeter";
import EntityCard from "@/components/EntityCard";
import { useSatyaSetuAIStore } from "@/lib/store";
import { uploadEvidence, analyzeEvidence } from "@/lib/api";


export default function UploadPage() {
  const router = useRouter();
  const { setLoading, setNotification, setAnalysis, setCaseId, isLoading } =
    useSatyaSetuAIStore();

  const [result, setResult] = useState<any | null>(null);

  // 🧩 Handle upload + analyze
  async function handleUpload(file: File) {
    try {
      setLoading(true);
      setNotification("Uploading evidence...");

      // 1️⃣ Upload Evidence
      const uploadRes = await uploadEvidence(file);
      const file_id = uploadRes.file_id;
      setCaseId(file_id);
      setNotification("Analyzing evidence with AI pipeline...");

      // 2️⃣ Analyze
      const analysis = await analyzeEvidence(file_id);

      setAnalysis(file_id, analysis);
      setResult(analysis);
      setNotification("Analysis complete ✅");
      router.push(`/cases/${uploadRes.file_id}`);
    } catch (err: any) {
      console.error(err);
      setNotification("❌ Analysis failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        🧠 SatyaSetu.AI Evidence Analyzer
      </h1>
      <p className="text-gray-600 mb-8">
        Upload any digital evidence (image, document, or screenshot).
        SatyaSetu.AI automatically extracts text, detects scams, classifies risks,
        and performs OSINT + QR/URL intelligence analysis.
      </p>
       <p className="text-red-600 mb-8">
        BACKEND DEPLOYED ON AWS BUT CURRENTLY INACTIVE.
      </p>
      <EvidenceUploader onUpload={handleUpload} disabled={isLoading} />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="text-center mt-6 text-cyan-600 font-medium animate-pulse">
          Processing evidence... Please wait 🔍
        </div>
      )}

      {/* Results */}
      {result && (
        <section className="mt-10 space-y-8">
          {/* SCAM CLASS */}
          <div className="bg-white shadow-md rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-2">🧩 Scam Classification</h2>
            <p>
              <b>Category:</b> {result.scam_class?.category || "Unknown"}
            </p>
            <p>
              <b>Confidence:</b>{" "}
              {Math.round((result.scam_class?.confidence ?? 0) * 100)}%
            </p>
            {result.scam_class?.keywords?.length > 0 && (
              <p>
                <b>Keywords:</b> {result.scam_class.keywords.join(", ")}
              </p>
            )}
          </div>

          {/* RISK ASSESSMENT */}
          <div className="bg-white shadow-md rounded-lg p-6 border">
            <h2 className="text-xl font-semibold mb-3">🚨 Risk Assessment</h2>
            <RiskMeter score={result.risk?.score ?? 0} />
            <p className="text-sm mt-2 text-gray-700">
              <b>Level:</b> {result.risk?.risk_level || "Unknown"}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <b>Rationale:</b> {result.risk?.rationale || "No detailed reason provided."}
            </p>
          </div>

          {/* ENTITIES */}
          {result.entities?.length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-6 border">
              <h2 className="text-xl font-semibold mb-4">🧾 Extracted Entities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {result.entities.map((e: any, i: number) => (
                  <EntityCard
                    key={i}
                    type={e.type}
                    value={e.value}
                    riskLevel={e.risk_level}
                  />
                ))}
              </div>
            </div>
          )}

          {/* URL / QR Findings */}
          {result.url_qr_findings?.length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-6 border">
              <h2 className="text-xl font-semibold mb-3">
                🌐 URL & QR Code Findings
              </h2>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {result.url_qr_findings.map((f: any, i: number) => (
                  <li key={i}>
                    {f.url} → <b>{f.risk_level}</b> ({f.combined_risk}%)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
