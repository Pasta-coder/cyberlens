"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    Brain,
    Landmark,
    Users,
    Loader2,
    CheckCircle2,
    XCircle,
    FileUp,
    AlertTriangle,
    X,
    LogIn,
    LogOut,
    Shield,
    Database,
    BarChart3,
    ShoppingCart,
} from "lucide-react";
import { login as apiLogin, logout as apiLogout, isAuthenticated, getStoredUser, adminUpload, getUploadHistory } from "@/lib/api";

// ─── Types ───────────────────────────────────────────
type TabId = "fiscal" | "procurement" | "welfare";

interface TabConfig {
    id: TabId;
    label: string;
    emoji: string;
    icon: React.ElementType;
    headline: string;
    note: string;
    accept: string;
    acceptLabel: string;
}

interface ToastData {
    id: number;
    type: "success" | "error" | "info";
    title: string;
    message: string;
}

interface UploadLog {
    batch_id: string;
    data_type: string;
    filename: string;
    rows_count: number;
    uploaded_by: string;
    created_at: string;
}

// ─── Tab Definitions ─────────────────────────────────
const TABS: TabConfig[] = [
    {
        id: "fiscal",
        label: "Fiscal Logs",
        emoji: "💰",
        icon: Landmark,
        headline: "Ingest Government Spending Data",
        note: "Required columns: transaction_id, amount. Optional: department, purpose, vendor, date",
        accept: ".csv,.json",
        acceptLabel: "CSV / JSON",
    },
    {
        id: "procurement",
        label: "Procurement Contracts",
        emoji: "📋",
        icon: ShoppingCart,
        headline: "Upload Procurement Contract Data",
        note: "Required columns: contract_title, final_price. Optional: estimated_price, bidders_count, department, winner_name, award_month, is_sunday",
        accept: ".csv,.json",
        acceptLabel: "CSV / JSON",
    },
    {
        id: "welfare",
        label: "Welfare Stats",
        emoji: "👥",
        icon: Users,
        headline: "Upload Census vs. Beneficiary Data",
        note: "Required columns: district_name, population_bpl, active_beneficiaries. Optional: scheme_name, year",
        accept: ".csv,.json",
        acceptLabel: "CSV / JSON",
    },
];

// ─── Animation Variants ──────────────────────────────
const formVariants = {
    initial: { opacity: 0, y: 24, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" as const } },
    exit: { opacity: 0, y: -16, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" as const } },
};

const toastVariants = {
    initial: { opacity: 0, x: 80, scale: 0.9 },
    animate: { opacity: 1, x: 0, scale: 1, transition: { type: "spring" as const, damping: 20, stiffness: 300 } },
    exit: { opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.2 } },
};


// ═════════════════════════════════════════════════════
// Component
// ═════════════════════════════════════════════════════
export default function AdminPage() {
    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [user, setUser] = useState<Record<string, string> | null>(null);

    // Upload State
    const [activeTab, setActiveTab] = useState<TabId>("fiscal");
    const [isUploading, setIsUploading] = useState(false);
    const [toasts, setToasts] = useState<ToastData[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const toastCounter = useRef(0);

    // Upload History
    const [uploadHistory, setUploadHistory] = useState<UploadLog[]>([]);
    const [dbStats, setDbStats] = useState<Record<string, number>>({});

    const activeConfig = TABS.find((t) => t.id === activeTab)!;

    // Check auth on mount
    useEffect(() => {
        if (isAuthenticated()) {
            setIsLoggedIn(true);
            setUser(getStoredUser());
            loadUploadHistory();
        }
    }, []);

    // ── Auth handlers ─────────────────────────────
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError("");
        try {
            const result = await apiLogin(username, password);
            setIsLoggedIn(true);
            setUser(result.user);
            loadUploadHistory();
        } catch (err: unknown) {
            setLoginError("Invalid credentials. Try admin / satyasetu2026");
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = () => {
        apiLogout();
        setIsLoggedIn(false);
        setUser(null);
    };

    // ── Upload History ────────────────────────────
    const loadUploadHistory = async () => {
        try {
            const data = await getUploadHistory();
            setUploadHistory(data.uploads || []);
            setDbStats(data.database_stats || {});
        } catch {
            console.warn("Could not load upload history");
        }
    };

    // ── Toast helpers ──────────────────────────────
    const addToast = useCallback((type: ToastData["type"], title: string, message: string) => {
        const id = ++toastCounter.current;
        setToasts((prev) => [...prev, { id, type, title, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // ── File handling ──────────────────────────────
    const handleFileSelect = (file: File) => {
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        const allowed = activeConfig.accept.split(",").map((a) => a.replace(".", ""));
        if (!allowed.includes(ext)) {
            addToast("error", "Invalid File Type", `Expected ${activeConfig.acceptLabel} but got .${ext}`);
            return;
        }
        setSelectedFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    // ── Submit ─────────────────────────────────────
    const handleSubmit = async () => {
        if (!selectedFile) {
            addToast("error", "No File Selected", "Please select a file before uploading.");
            return;
        }

        setIsUploading(true);

        try {
            const data = await adminUpload(selectedFile, activeTab);
            addToast("success", "Upload Successful", data.message || `${data.rows_inserted || 0} records stored to database.`);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            loadUploadHistory();
        } catch (err: unknown) {
            console.error("Admin ingest error:", err);
            const msg = err instanceof Error ? err.message : "Upload failed — check authentication.";
            addToast("error", "Upload Failed", msg);
        } finally {
            setIsUploading(false);
        }
    };

    // ═══════════════════════════════════════════════
    // LOGIN GATE
    // ═══════════════════════════════════════════════
    if (!isLoggedIn) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-cyan-50">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-4">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
                            <p className="text-sm text-gray-500 mt-1">SatyaSetu.AI — Restricted Access</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="admin"
                                    disabled={loginLoading}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-800
                                        placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40
                                        focus:border-cyan-500 disabled:opacity-50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••"
                                    disabled={loginLoading}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm text-gray-800
                                        placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40
                                        focus:border-cyan-500 disabled:opacity-50 transition-colors"
                                />
                            </div>

                            {loginError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <XCircle className="w-4 h-4 text-red-500" />
                                    <p className="text-sm text-red-600">{loginError}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loginLoading || !username || !password}
                                className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2
                                    bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500
                                    shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-[0.98]
                                    disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none
                                    transition-all duration-300"
                            >
                                {loginLoading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</>
                                ) : (
                                    <><LogIn className="w-5 h-5" /> Sign In</>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-400">Protected by JWT Authentication</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════
    // ADMIN DASHBOARD (Authenticated)
    // ═══════════════════════════════════════════════
    return (
        <div className="min-h-[calc(100vh-4rem)]">
            {/* Top Bar with user info */}
            <div className="border-b border-gray-200 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">
                                {user?.full_name || "Admin"}
                            </p>
                            <p className="text-xs text-gray-500">{user?.department || "Admin"} · {user?.role || "admin"}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600
                            hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Database Stats Bar */}
            <div className="bg-gradient-to-r from-slate-50 to-cyan-50 border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-cyan-600" />
                        <span className="text-xs font-medium text-gray-500">Database:</span>
                        <span className="text-xs font-bold text-cyan-700">PostgreSQL (Neon)</span>
                        <span className="relative flex h-2 w-2 ml-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <span className="text-gray-500">
                            <Landmark className="w-3 h-3 inline mr-1" />
                            {dbStats.fiscal_transactions || 0} fiscal tx
                        </span>
                        <span className="text-gray-500">
                            <ShoppingCart className="w-3 h-3 inline mr-1" />
                            {dbStats.procurement_contracts || 0} contracts
                        </span>
                        <span className="text-gray-500">
                            <Users className="w-3 h-3 inline mr-1" />
                            {dbStats.welfare_districts || 0} welfare records
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Capsule Tabs ────────────── */}
            <div className="border-b border-gray-200 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 flex justify-center py-4">
                    <div className="inline-flex items-center gap-1 p-1 rounded-full bg-gray-100">
                        {TABS.map((tab) => {
                            const isActive = tab.id === activeTab;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    role="tab"
                                    aria-selected={isActive}
                                    disabled={isUploading}
                                    onClick={() => {
                                        if (!isUploading) {
                                            setActiveTab(tab.id);
                                            setSelectedFile(null);
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                        }
                                    }}
                                    className={`
                    relative flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium
                    transition-colors duration-200 select-none whitespace-nowrap
                    ${isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                    ${isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-700"}
                  `}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="admin-tab-capsule"
                                            className="absolute inset-0 rounded-full bg-white shadow-sm border border-gray-200"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Dynamic Form Area ─────────────────── */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        variants={formVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        {/* Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
                            {/* Header */}
                            <div className="px-8 pt-8 pb-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-100">
                                        <activeConfig.icon className="w-6 h-6 text-cyan-600" />
                                    </div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">
                                        {activeConfig.headline}
                                    </h1>
                                </div>

                                <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                    <p className="text-sm text-amber-700">{activeConfig.note}</p>
                                </div>

                                <div className="flex items-start gap-2 mt-2 p-3 rounded-lg bg-green-50 border border-green-200">
                                    <Database className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                    <p className="text-sm text-green-700">
                                        Data will be stored to <strong>PostgreSQL</strong> and immediately available on the dashboard.
                                    </p>
                                </div>
                            </div>

                            {/* Upload Zone */}
                            <div className="px-8 pb-8 pt-4">
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`
                    relative flex flex-col items-center justify-center gap-4
                    p-10 rounded-xl border-2 border-dashed cursor-pointer
                    transition-all duration-300 group
                    ${dragOver
                                            ? "border-cyan-400 bg-cyan-50 scale-[1.01]"
                                            : selectedFile
                                                ? "border-emerald-400 bg-emerald-50"
                                                : "border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100"
                                        }
                  `}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept={activeConfig.accept}
                                        onChange={handleInputChange}
                                        className="hidden"
                                    />

                                    {selectedFile ? (
                                        <>
                                            <div className="p-3 rounded-full bg-emerald-100">
                                                <FileUp className="w-8 h-8 text-emerald-600" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-gray-800 font-semibold">{selectedFile.name}</p>
                                                <p className="text-gray-500 text-sm mt-1">
                                                    {(selectedFile.size / 1024).toFixed(1)} KB · Click to change
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="p-3 rounded-full bg-gray-200 group-hover:bg-gray-300 transition-colors">
                                                <Upload className="w-8 h-8 text-gray-500 group-hover:text-cyan-600 transition-colors" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-gray-600 font-medium">
                                                    Drop your file here or <span className="text-cyan-600 underline underline-offset-2">browse</span>
                                                </p>
                                                <p className="text-gray-400 text-sm mt-1">Accepted: {activeConfig.acceptLabel}</p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={!selectedFile || isUploading}
                                    className={`
                    w-full mt-6 py-3.5 rounded-xl font-semibold text-sm
                    flex items-center justify-center gap-2
                    transition-all duration-300 select-none
                    ${selectedFile && !isUploading
                                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-[0.98]"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        }
                  `}
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Uploading to Database…
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            Upload & Store to Database
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* ── Upload History ─────────────────────── */}
                {uploadHistory.length > 0 && (
                    <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-cyan-600" />
                            Upload Audit Log
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Batch ID</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Type</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">File</th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Rows</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Uploaded By</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {uploadHistory.slice(0, 10).map((log, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 font-mono text-xs text-cyan-700">{log.batch_id}</td>
                                            <td className="px-4 py-2">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                    log.data_type === 'fiscal' ? 'bg-yellow-100 text-yellow-700' :
                                                    log.data_type === 'procurement' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-purple-100 text-purple-700'
                                                }`}>
                                                    {log.data_type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-xs text-gray-600">{log.filename}</td>
                                            <td className="px-4 py-2 text-right text-xs font-semibold">{log.rows_count}</td>
                                            <td className="px-4 py-2 text-xs text-gray-600">{log.uploaded_by}</td>
                                            <td className="px-4 py-2 text-xs text-gray-500">
                                                {log.created_at ? new Date(log.created_at).toLocaleDateString() : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Toast Notifications ───────────────── */}
            <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 max-w-sm">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            variants={toastVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className={`
                flex items-start gap-3 p-4 rounded-xl border shadow-lg bg-white
                ${toast.type === "success"
                                    ? "border-emerald-200 text-emerald-700"
                                    : toast.type === "error"
                                        ? "border-red-200 text-red-700"
                                        : "border-blue-200 text-blue-700"
                                }
              `}
                        >
                            {toast.type === "success" ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            ) : toast.type === "error" ? (
                                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            ) : (
                                <AlertTriangle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm">{toast.title}</p>
                                <p className="text-xs mt-0.5 opacity-80 break-words">{toast.message}</p>
                            </div>
                            <button onClick={() => removeToast(toast.id)} className="opacity-40 hover:opacity-100 transition-opacity text-gray-500">
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
