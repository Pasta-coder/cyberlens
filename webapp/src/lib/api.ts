import axios from "axios";

// 🌍 Base URL — Logic to ensure it always ends in '/api'
let envUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

// Remove trailing slash if present (e.g., "...onrender.com/")
envUrl = envUrl.replace(/\/$/, "");

// Append '/api' if it's not already there
const BASE_URL = envUrl.endsWith("/api") ? envUrl : `${envUrl}/api`;

console.log("🔗 API Base URL set to:", BASE_URL); // Debug log

// Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 2 minutes - OCR + NER + Scam analysis can take time
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔁 Interceptor for unified error logging
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const errorData = err.response?.data || {};
    const status = err.response?.status;
    const url = err.config?.url;

    // If entity not found, just warn instead of crashing
    if (status === 404) {
      console.warn(`⚠️ Entity not found at ${url}`);
      return Promise.reject({ message: "Entity not found", status, url });
    }

    console.error("🚨 API Error Details:", errorData);
    throw new Error(
      JSON.stringify({
        url,
        status,
        data: errorData,
      })
    );
  }
);


// ===================================================================
// 🧱 CORE ENDPOINTS
// ===================================================================

// 1️⃣ Upload Evidence (multipart)
export async function uploadEvidence(file: File) {
  const form = new FormData();
  form.append("file", file);

  const res = await api.post("/upload-evidence", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  // Expected Response: { file_id, sha256 }
  return res.data;
}

// 2️⃣ Analyze Evidence (OCR + NER + Classifier + OSINT)
export async function analyzeEvidence(file_id: string) {
  const form = new FormData();
  form.append("file_id", file_id);

  const res = await api.post("/analyze", form, {
    headers: { "Content-Type": "multipart/form-data" }, // 👈 add this
  });

  return res.data;
}


// 3️⃣ Generate Case Report (PDF)
export async function generateReport(file_id: string) {
  const form = new FormData();
  form.append("file_id", file_id);

  const res = await api.post("/report", form, {
    headers: { "Content-Type": "multipart/form-data" },
    responseType: "blob", // important
  });

  return res.data; // blob data
}

export async function batchAnalyze(files: File[]) {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));

  const res = await api.post("/batch-analyze", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function generateUnifiedReport(batch_id: string) {
  const form = new FormData();
  form.append("batch_id", batch_id);

  const res = await api.post("/unified-report", form, { responseType: "blob" });
  return res.data;
}


// 6️⃣ Search Cases
export async function searchCases(query: string) {
  const res = await api.get(`/cases/search?q=${encodeURIComponent(query)}`);
  return res.data;
}

// 8️⃣ Fetch Case Clusters (for Dashboard visualization)
export async function getCaseClusters() {
  const res = await api.get("/cases/clusters");
  return res.data;
}


// 🔟 Health Check (Basic connectivity)
export async function healthCheck() {
  const res = await axios.get("http://127.0.0.1:8000/");
  return res.data;
}

// ===================================================================
// ⚙️ UTILITY HELPERS
// ===================================================================

// 🧾 Open PDF Blob in new tab
export function openPdfBlob(blobData: Blob, filename = "report.pdf") {
  const blob = new Blob([blobData], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// 🧩 Simplified wrapper to call multiple endpoints together
export async function analyzeAndReport(file: File) {
  const upload = await uploadEvidence(file);
  const analysis = await analyzeEvidence(upload.file_id);
  return { ...analysis, file_id: upload.file_id };
}

// ===================================================================
// 🧠 CASE DATA ACCESS (Local Cache / API Bridge)
// ===================================================================

// Fetch a single analyzed case from cache
export async function getCaseFromCache(file_id: string) {
  try {
    const res = await api.get(`/data/analysis_cache/${file_id}.json`, {
      baseURL: "http://127.0.0.1:8000", // direct static path
    });
    return res.data;
  } catch (err) {
    console.warn("⚠️ Could not fetch cached case:", file_id, err);
    throw new Error("Cached case not found");
  }
}

// Fetch all analyzed cases from cache
export async function getAllCases() {
  try {
    const res = await api.get("/cases/search?q=");
    // backend may return { query, total_hits, cases: [...] } OR an array
    if (Array.isArray(res.data)) return res.data;
    if (res.data?.cases) return res.data.cases;
    // fallback: if backend returned single object with case info, wrap it
    return res.data ? [res.data] : [];
  } catch (err) {
    console.warn("⚠️ Could not fetch case list:", err);
    return [];
  }
}

/** Fetch top entities; normalize to return simple array of {entity, count, avg_risk} */
export async function getTopEntities() {
  try {
    const res = await api.get("/cases/top-entities");
    // backend returns { total_entities, top: [...] } or an array -> normalize
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.top)) return res.data.top;
    // older backend: might return { top_entities: [...] }
    if (Array.isArray(res.data?.top_entities)) return res.data.top_entities;
    return [];
  } catch (err) {
    console.warn("⚠️ Failed to fetch top entities:", err);
    return [];
  }
}

export async function getEntityProfile(entity: string) {
  // make sure we call with the 'entity' param to match backend's primary param
  const res = await api.get(`/entities/profile?entity=${encodeURIComponent(entity)}`);
  return res.data;
}

// ===================================================================
// 🚨 FRAUD PREDICTION ENDPOINTS
// ===================================================================

export interface ContractInput {
  contract_type: string;
  amount: number;
  duration_days: number;
  counterparty_name: string;
  counterparty_country: string;
  payment_method: string;
  industry: string;
}

export interface FraudPredictionResult {
  prediction: "fraud" | "legitimate";
  fraud_probability: number;
  confidence: number;
  fraud_signals: Array<{
    signal_type: string;
    description: string;
    severity: string;
  }>;
  timestamp: string;
}

// Predict single contract
export async function predictFraud(contract: ContractInput): Promise<FraudPredictionResult> {
  const res = await api.post("/fraud-predict", contract);
  return res.data;
}

// Predict batch contracts
export async function predictFraudBatch(contracts: ContractInput[]) {
  const res = await api.post("/fraud-predict/batch", { contracts });
  return res.data;
}

// Get model information
export async function getFraudModelInfo() {
  const res = await api.get("/fraud-predict/model-info");
  return res.data;
}

// ===================================================================
// 📊 PROCUREMENT DASHBOARD ENDPOINTS
// ===================================================================

export interface DashboardData {
  summary: {
    total_spend: number;
    tenders_analyzed: number;
    high_risk_tenders: number;
    departments_flagged: number;
  };
  regions: Array<{
    region_code: string;
    region_name: string;
    cri_score: number;
    total_spend: number;
    red_flags: string[];
  }>;
  benford: {
    counts: Record<string, number>;
    mad: number;
    chi2: number;
  };
  network: {
    buyers: Array<{
      id: string;
      name: string;
      contracts: number;
      total_spend: number;
      risk_score: number;
    }>;
    suppliers: Array<{
      id: string;
      name: string;
      contracts: number;
      total_spend: number;
      risk_score: number;
    }>;
    edges: Array<{
      buyer_id: string;
      supplier_id: string;
      contracts: number;
      value: number;
    }>;
  };
  leaderboard: Array<{
    entity_id: string;
    name: string;
    total_spend: number;
    risk_score: number;
    single_bid_pct: number;
  }>;
  time_series: Array<{
    month: string;
    cri_avg: number;
    tenders: number;
    single_bid_rate?: number;
  }>;
  funnel: {
    published: number;
    bids_received: number;
    contracts_awarded: number;
  };
}

// Load dashboard data - falls back to mock if API unavailable
export async function getDashboardData(): Promise<DashboardData> {
  try {
    // Try to fetch from API endpoints
    const [summary, regions, benford, network, leaderboard, timeSeries, funnel] = await Promise.all([
      api.get("/cases/top-entities").catch(() => null),
      api.get("/cases/regions").catch(() => null),
      api.get("/cases/benford").catch(() => null),
      api.get("/cases/clusters").catch(() => null),
      api.get("/cases/top-entities").catch(() => null),
      api.get("/cases/time-series").catch(() => null),
      api.get("/cases/funnel").catch(() => null),
    ]);

    // If any API call succeeded, use that data
    if (summary || regions || benford || network) {
      return {
        summary: summary?.data || {},
        regions: regions?.data || [],
        benford: benford?.data || {},
        network: network?.data || { buyers: [], suppliers: [], edges: [] },
        leaderboard: leaderboard?.data || [],
        time_series: timeSeries?.data || [],
        funnel: funnel?.data || {},
      };
    }

    // Fall back to mock data
    throw new Error("No API data available");
  } catch (error) {
    console.warn("⚠️ API unavailable, loading mock dashboard data");
    // Import mock data dynamically
    const mockData = await import("../../mock/dashboard-sample.json");
    return mockData as unknown as DashboardData;
  }
}

// Export Axios instance (for debugging)
export default api;
