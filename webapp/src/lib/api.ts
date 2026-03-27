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

// 🔐 Auth token interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("satyasetu_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 🔁 Interceptor for unified error logging
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const errorData = err.response?.data || {};
    const status = err.response?.status;
    const url = err.config?.url;

    // If 401, clear token
    if (status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("satyasetu_token");
    }

    // Silent fail for dashboard endpoints
    const isDashboardEndpoint = url?.includes('/cases/') ||
      url?.includes('/dashboard') ||
      url?.includes('/regions') ||
      url?.includes('/benford') ||
      url?.includes('/clusters') ||
      url?.includes('/time-series') ||
      url?.includes('/funnel');

    if (status === 404 && isDashboardEndpoint) {
      return Promise.reject({ message: "Endpoint not available", status, url, silent: true });
    }

    if (status === 404) {
      console.warn(`⚠️ Entity not found at ${url}`);
      return Promise.reject({ message: "Entity not found", status, url });
    }

    console.error("🚨 API Error Details:", errorData);
    throw new Error(
      JSON.stringify({ url, status, data: errorData })
    );
  }
);


// ===================================================================
// 🔐 AUTHENTICATION
// ===================================================================

export async function login(username: string, password: string) {
  const res = await api.post("/auth/login", { username, password });
  if (res.data.access_token) {
    localStorage.setItem("satyasetu_token", res.data.access_token);
    localStorage.setItem("satyasetu_user", JSON.stringify(res.data.user));
  }
  return res.data;
}

export function logout() {
  localStorage.removeItem("satyasetu_token");
  localStorage.removeItem("satyasetu_user");
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("satyasetu_user");
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("satyasetu_token");
}


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

  return res.data;
}

// 2️⃣ Analyze Evidence (OCR + NER + Classifier + OSINT)
export async function analyzeEvidence(file_id: string) {
  const form = new FormData();
  form.append("file_id", file_id);

  const res = await api.post("/analyze", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

// 3️⃣ Generate Case Report (PDF)
export async function generateReport(file_id: string) {
  const form = new FormData();
  form.append("file_id", file_id);

  const res = await api.post("/report", form, {
    headers: { "Content-Type": "multipart/form-data" },
    responseType: "blob",
  });

  return res.data;
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


// 🔟 Health Check
export async function healthCheck() {
  const res = await axios.get(BASE_URL.replace("/api", "/"));
  return res.data;
}

// ===================================================================
// ⚙️ UTILITY HELPERS
// ===================================================================

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

export async function analyzeAndReport(file: File) {
  const upload = await uploadEvidence(file);
  const analysis = await analyzeEvidence(upload.file_id);
  return { ...analysis, file_id: upload.file_id };
}


// ===================================================================
// 🧠 CASE DATA ACCESS (Local Cache / API Bridge)
// ===================================================================

export async function getCaseFromCache(file_id: string) {
  try {
    const res = await api.get(`/data/analysis_cache/${file_id}.json`, {
      baseURL: BASE_URL.replace("/api", ""),
    });
    return res.data;
  } catch (err) {
    console.warn("⚠️ Could not fetch cached case:", file_id, err);
    throw new Error("Cached case not found");
  }
}

export async function getAllCases() {
  try {
    const res = await api.get("/cases/search?q=");
    if (Array.isArray(res.data)) return res.data;
    if (res.data?.cases) return res.data.cases;
    return res.data ? [res.data] : [];
  } catch (err) {
    console.warn("⚠️ Could not fetch case list:", err);
    return [];
  }
}

export async function getTopEntities() {
  try {
    const res = await api.get("/cases/top-entities");
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.top)) return res.data.top;
    if (Array.isArray(res.data?.top_entities)) return res.data.top_entities;
    return [];
  } catch (err) {
    console.warn("⚠️ Failed to fetch top entities:", err);
    return [];
  }
}

export async function getEntityProfile(entity: string) {
  const res = await api.get(`/entities/profile?entity=${encodeURIComponent(entity)}`);
  return res.data;
}


// ===================================================================
// 🚨 FRAUD PREDICTION ENDPOINTS
// ===================================================================

export interface ContractInput {
  name: string;
  department?: string;
  estimated_price: number;
  final_price: number;
  bidders: number;
  award_month?: number;
  is_sunday?: boolean;
  is_december?: boolean;
}

export interface FraudPredictionResult {
  contract_name: string;
  predicted_cri: number;
  risk_level: string;
  risk_color: string;
  recommendation: string;
  fraud_signals: Array<{
    signal: string;
    description: string;
    severity: string;
  }>;
  feature_breakdown: Record<string, unknown>;
}

export async function predictFraud(contract: ContractInput): Promise<FraudPredictionResult> {
  const res = await api.post("/fraud-predict", contract);
  return res.data;
}

export async function predictFraudBatch(contracts: ContractInput[]) {
  const res = await api.post("/fraud-predict/batch", { contracts });
  return res.data;
}

export async function getFraudModelInfo() {
  const res = await api.get("/fraud-predict/model-info");
  return res.data;
}


// ===================================================================
// 📊 DASHBOARD ENDPOINTS (Real Database)
// ===================================================================

export async function getFiscalDashboard() {
  const res = await api.get("/fiscal/dashboard");
  return res.data;
}

export async function getProcurementDashboard() {
  const res = await api.get("/procurement/dashboard");
  return res.data;
}

export async function getWelfareDashboard() {
  const res = await api.get("/welfare/dashboard");
  return res.data;
}

export async function getAdminStats() {
  const res = await api.get("/admin/stats");
  return res.data;
}


// ===================================================================
// 🛡️ ADMIN ENDPOINTS (Auth Required)
// ===================================================================

export async function adminUpload(
  file: File,
  dataType: string,
) {
  const form = new FormData();
  form.append("file", file);
  form.append("data_type", dataType);
  form.append("uploader_name", "Admin");
  form.append("uploader_department", "IT");

  const res = await api.post("/admin/ingest", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getUploadHistory() {
  const res = await api.get("/admin/uploads");
  return res.data;
}


// ===================================================================
// 📊 LEGACY PROCUREMENT DASHBOARD (compatibility shim)
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

// Load dashboard data from real backend API
export async function getDashboardData(): Promise<DashboardData> {
  try {
    console.log("📊 Fetching live procurement dashboard data from database...");
    const data = await getProcurementDashboard();
    console.log("✅ Live procurement data loaded from PostgreSQL");
    return data as DashboardData;
  } catch (error) {
    console.warn("⚠️ Backend unavailable, loading mock data as fallback");
    const mockData = await import("../../mock/dashboard-sample.json");
    return mockData as unknown as DashboardData;
  }
}


// ===================================================================
// 🤖 AI COPILOT ENDPOINTS
// ===================================================================

export interface CopilotMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CopilotResponse {
  response: string;
  language: string;
  model: string;
  tokens_used: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export async function copilotChat(
  message: string,
  history: CopilotMessage[] = [],
  language: string = 'auto',
): Promise<CopilotResponse> {
  const res = await api.post('/copilot/chat', { message, history, language });
  return res.data;
}

export async function getCopilotCapabilities() {
  const res = await api.get('/copilot/capabilities');
  return res.data;
}


// Export Axios instance (for debugging)
export default api;
