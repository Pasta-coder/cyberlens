"use client";
import React, { useState } from "react";
import EvidenceUploader from "@/components/EvidenceUploader";

export default function UploadPage() {
  const [uploaded, setUploaded] = useState<any | null>(null);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Digital Evidence</h1>
      <EvidenceUploader onUploaded={(res) => setUploaded(res)} />
      {uploaded && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="font-semibold mb-2">Uploaded File Info</h2>
          <div className="text-sm">Filename: {uploaded.filename}</div>
          <div className="text-sm">SHA256: {uploaded.sha256}</div>
          <div className="text-sm">File ID: {uploaded.file_id}</div>
          <a
            href={`/cases/${uploaded.file_id}`}
            className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
          >
            View Analysis →
          </a>
        </div>
      )}
    </div>
  );
}
