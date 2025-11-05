import axios from "axios";

const BASE_URL = "http://localhost:8000/api";

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
  const resp = await axios.get(`${BASE_URL}/analyze?file_id=${file_id}`);
  return resp.data;
}
