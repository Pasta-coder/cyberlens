"use client";

import React, { useCallback, useState } from "react";
import axios from "axios";

type UploadResult = {
  file_id: string;
  filename: string;
  sha256: string;
  stored_at: string;
};

export default function EvidenceUploader({
  onUploaded,
}: {
  onUploaded?: (res: UploadResult) => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mockUpload = async (file: File): Promise<UploadResult> => {
    await new Promise((r) => setTimeout(r, 800));
    return {
      file_id: `${crypto.randomUUID()}-${file.name}`,
      filename: file.name,
      sha256: btoa(file.name).slice(0, 24),
      stored_at: `app/data/uploads/${file.name}`,
    };
  };

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setProgress(0);
      try {
        const mock = process.env.NEXT_PUBLIC_MOCK_API === "true";

        if (mock) {
          const res = await mockUpload(file);
          setProgress(100);
          onUploaded?.(res);
          return;
        }

        const form = new FormData();
        form.append("file", file);

        const resp = await axios.post<UploadResult>(
          "http://localhost:8000/api/upload-evidence",
          form,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (evt) => {
              if (evt.total) {
                setProgress(Math.round((evt.loaded * 100) / evt.total));
              }
            },
          }
        );

        setProgress(100);
        onUploaded?.(resp.data);
      } catch (e: any) {
        setError(e.message || "Upload failed");
        setProgress(null);
      }
    },
    [onUploaded]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  return (
    <div className="p-4">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed p-6 rounded-lg block text-center cursor-pointer ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        <div className="font-semibold">Drag & Drop file here</div>
        <div className="text-sm text-gray-600">or click to select</div>
        <input type="file" onChange={onFileChange} className="hidden" />
      </label>

      {progress !== null && (
        <div className="mt-3">
          <div className="text-sm mb-1">Upload: {progress}%</div>
          <div className="h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-blue-600 rounded"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
