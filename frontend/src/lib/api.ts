import axios from "axios";

// Your backend base URL
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;

export async function uploadEvidence(file: File, onProgress?: (p: number) => void) {
  const form = new FormData();
  form.append("file", file);

  const resp = await axios.post(`${BASE_URL}/upload-evidence`, form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (e.total && onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });

  return resp.data;
}

export async function analyzeEvidence(file_id: string) {
  const form = new FormData();
  form.append("file_id", file_id);

  const resp = await axios.post(`${BASE_URL}/analyze`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return resp.data;
}
