"use client";

import { useState, useRef, useCallback } from "react";
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
    User,
    Building2,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────
type TabId = "training" | "fiscal" | "welfare";

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

// ─── Tab Definitions ─────────────────────────────────
const TABS: TabConfig[] = [
    {
        id: "training",
        label: "AI Training Data",
        emoji: "🧠",
        icon: Brain,
        headline: "Upload Historical Audit Data (XGBoost Retraining)",
        note: "Required columns: contract_title, final_price, audit_outcome (0/1)",
        accept: ".csv",
        acceptLabel: "CSV only",
    },
    {
        id: "fiscal",
        label: "Fiscal Logs",
        emoji: "💰",
        icon: Landmark,
        headline: "Ingest Daily Treasury Logs",
        note: "Updates Benford Analysis & Cartel Radar",
        accept: ".csv,.json",
        acceptLabel: "CSV / JSON",
    },
    {
        id: "welfare",
        label: "Welfare Stats",
        emoji: "👥",
        icon: Users,
        headline: "Upload Census vs. Beneficiary Data",
        note: "Triggers Ghost Beneficiary Detection",
        accept: ".csv",
        acceptLabel: "CSV only",
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

// ─── API Base — must use 127.0.0.1 to match CORS allowlist ───
const API_URL = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "")
    : "http://127.0.0.1:8000";
const INGEST_ENDPOINT = `${API_URL}${API_URL.endsWith("/api") ? "" : "/api"}/admin/ingest`;

// ═════════════════════════════════════════════════════
// Component
// ═════════════════════════════════════════════════════
export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<TabId>("training");
    const [isUploading, setIsUploading] = useState(false);
    const [toasts, setToasts] = useState<ToastData[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const toastCounter = useRef(0);

    // Uploader metadata
    const [uploaderName, setUploaderName] = useState("");
    const [uploaderDept, setUploaderDept] = useState("");

    const activeConfig = TABS.find((t) => t.id === activeTab)!;

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
        if (!uploaderName.trim()) {
            addToast("error", "Name Required", "Please enter your name to identify the upload.");
            return;
        }
        if (!uploaderDept.trim()) {
            addToast("error", "Department Required", "Please enter your department.");
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("data_type", activeTab);
            formData.append("uploader_name", uploaderName.trim());
            formData.append("uploader_department", uploaderDept.trim());

            // Use raw fetch — do NOT set Content-Type manually;
            // the browser auto-sets it with the correct multipart boundary.
            const res = await fetch(INGEST_ENDPOINT, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                addToast("error", "Upload Failed", data.detail || `Server error (${res.status})`);
                return;
            }

            // Success toasts per data type
            if (activeTab === "training") {
                addToast("success", "Model Retraining Triggered", data.message || "XGBoost model update queued.");
            } else if (activeTab === "fiscal") {
                const summary = data.summary;
                addToast(
                    "success",
                    "Fiscal Data Ingested",
                    `${summary?.total_transactions ?? 0} transactions · ₹${(summary?.total_spend ?? 0).toLocaleString("en-IN")} total · Benford score: ${summary?.benford_conformity_score ?? "N/A"}`
                );
            } else if (activeTab === "welfare") {
                const districts = data.critical_districts || [];
                addToast(
                    districts.length > 0 ? "info" : "success",
                    "Ghost Beneficiary Scan Complete",
                    districts.length > 0
                        ? `⚠️ ${districts.length} critical district(s): ${districts.join(", ")}`
                        : "No anomalous districts found."
                );
            }

            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err: unknown) {
            console.error("Admin ingest error:", err);
            const msg = err instanceof Error ? err.message : "Network error — is the backend running?";
            addToast("error", "Upload Failed", msg);
        } finally {
            setIsUploading(false);
        }
    };

    // ═══════════════════════════════════════════════
    // Render
    // ═══════════════════════════════════════════════
    return (
        <div className="min-h-[calc(100vh-4rem)]">
            {/* ── Capsule Tabs — Centered ────────────── */}
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
                                    {/* Animated capsule background */}
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
                            </div>

                            {/* Uploader Metadata */}
                            <div className="px-8 pb-2 pt-2">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Uploader Details</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="uploaderName" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                            <User className="w-3.5 h-3.5 text-gray-400" />
                                            Full Name <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            id="uploaderName"
                                            type="text"
                                            placeholder="e.g. Rajesh Kumar"
                                            value={uploaderName}
                                            onChange={(e) => setUploaderName(e.target.value)}
                                            disabled={isUploading}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500
                        disabled:opacity-50 disabled:bg-gray-50 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="uploaderDept" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                            Department <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            id="uploaderDept"
                                            type="text"
                                            placeholder="e.g. Public Works Dept."
                                            value={uploaderDept}
                                            onChange={(e) => setUploaderDept(e.target.value)}
                                            disabled={isUploading}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500
                        disabled:opacity-50 disabled:bg-gray-50 transition-colors"
                                        />
                                    </div>
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
                                            Uploading & Processing…
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            Upload & Process
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
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
