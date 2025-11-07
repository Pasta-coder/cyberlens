"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [reportURL, setReportURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    const form = new FormData();
    form.append("file_id", id!);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/report`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setReportURL(res.data.pdf_path);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Case Report</h1>

      <button
        onClick={generateReport}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Generating..." : "🧾 Generate PDF Report"}
      </button>

      {reportURL && (
        <div className="mt-6">
          <a
            href={`http://127.0.0.1:8000/${reportURL}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            📄 Open Generated Report
          </a>
        </div>
      )}
    </div>
  );
}
