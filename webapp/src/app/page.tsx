"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Upload,
  BarChart3,
  FileText,
  AlertTriangle,
  Network,
  TrendingUp,
  Users,
  Building2,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Brain,
  Scale,
  Eye
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-cyan-500/10 rounded-2xl backdrop-blur-sm border border-cyan-500/20">
                <Shield className="w-16 h-16 text-cyan-400" />
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-blue-200">
              SatyaSetu.AI
            </h1>

            <p className="text-xl md:text-2xl font-semibold mb-4 text-cyan-100">
              Bridging the gap between data and truth
            </p>

            <p className="text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto mb-10">
              SatyaSetu.AI is a intelligence platform that uses AI and statistical forensics to turn government data and digital evidence into clear, explainable audit signals for fraud detection and public accountability.
            </p>

            <div className="flex flex-wrap justify-center gap-4">

              <Link
                href="/fraud-predict"
                className="group bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" />
                Contract Fraud Detector
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/upload"
                className="group bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" />
                Public Fraud Detector
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L50 110C100 100 200 80 300 70C400 60 500 60 600 65C700 70 800 80 900 85C1000 90 1100 90 1150 90L1200 90V120H1150C1100 120 1000 120 900 120C800 120 700 120 600 120C500 120 400 120 300 120C200 120 100 120 50 120H0V120Z" fill="rgb(248 250 252)" />
          </svg>
        </div>
      </section>

      {/* Governance Modules - Primary Feature */}
      <section id="governance-modules" className="py-20 px-6 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Governance Intelligence Modules
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Statistical forensics and AI-powered anomaly detection for three critical governance domains
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {governanceModules.map((module) => (
              <motion.div key={module.href} variants={fadeInUp}>
                <Link href={module.href}>
                  <div className="group h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-slate-200 hover:border-cyan-400 hover:-translate-y-2">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 rounded-xl ${module.bgColor} ${module.textColor}`}>
                        {module.icon}
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-cyan-600 transition-colors">
                      {module.title}
                    </h3>

                    <p className="text-slate-600 mb-4 leading-relaxed">
                      {module.description}
                    </p>

                    <div className="flex items-center text-sm font-semibold text-cyan-600 group-hover:text-cyan-700">
                      Open Dashboard
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Platform Capabilities
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Enterprise-grade forensics toolkit built for national-scale governance intelligence
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {capabilities.map((capability) => (
              <motion.div
                key={capability.title}
                variants={fadeInUp}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300"
              >
                <div className="text-cyan-400 mb-4">{capability.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{capability.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{capability.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* AI Fraud Prediction Feature Highlight */}
      <section className="py-20 px-6 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <AlertTriangle className="w-4 h-4" />
                AI-Powered Detection
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                XGBoost Fraud Prediction Engine
              </h2>

              <p className="text-lg text-slate-700 mb-6 leading-relaxed">
                Detect procurement fraud before it happens with our Romania-trained machine learning model
                achieving <span className="font-bold text-red-600">R² = 0.74</span> accuracy on corruption risk prediction.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-900">Rule-Based Fraud Signals</p>
                    <p className="text-slate-600 text-sm">Detects round number manipulation, single bidder patterns, cost overruns</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-900">Explainable AI Output</p>
                    <p className="text-slate-600 text-sm">Feature breakdown and fraud signal severity levels for transparency</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-900">Batch Processing</p>
                    <p className="text-slate-600 text-sm">Analyze multiple contracts simultaneously with aggregate statistics</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/fraud-predict"
                  className="group bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2"
                >
                  <AlertTriangle className="w-5 h-5" />
                  Launch Fraud Detector
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#governance-modules"
                  className="px-8 py-4 rounded-xl font-semibold border-2 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-all duration-300"
                >
                  View All Tools
                </a>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Risk Assessment</p>
                    <p className="text-2xl font-bold text-slate-900">Contract Analysis</p>
                  </div>
                  <div className="text-5xl">🚨</div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <div>
                      <p className="font-semibold text-slate-900">Single Bidder</p>
                      <p className="text-sm text-slate-600">High severity fraud signal</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-red-200 text-red-800">HIGH</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                    <div>
                      <p className="font-semibold text-slate-900">Cost Overrun 23%</p>
                      <p className="text-sm text-slate-600">Exceeds estimate significantly</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-yellow-200 text-yellow-800">MEDIUM</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                    <div>
                      <p className="font-semibold text-slate-900">Round Number</p>
                      <p className="text-sm text-slate-600">Price manipulation indicator</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-gray-200 text-gray-800">LOW</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-6 text-white">
                  <p className="text-sm mb-2 opacity-90">Corruption Risk Index</p>
                  <div className="flex items-center justify-between">
                    <p className="text-4xl font-bold">78.4%</p>
                    <div className="text-right">
                      <p className="text-2xl font-bold">🔴 CRITICAL</p>
                      <p className="text-sm opacity-90">Investigation Required</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-red-200 rounded-full blur-3xl opacity-50 -z-10"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-orange-200 rounded-full blur-3xl opacity-50 -z-10"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Built for Governance Professionals
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Trusted by auditors, investigators, and policymakers across government institutions
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {targetUsers.map((user) => (
              <motion.div
                key={user.title}
                variants={fadeInUp}
                className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-cyan-50 rounded-lg text-cyan-600">
                    {user.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900 mb-1">{user.title}</h3>
                    <p className="text-slate-600 text-sm">{user.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 text-white">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Access Governance Dashboards
          </h2>
          <p className="text-xl text-cyan-50 mb-10 leading-relaxed">
            Start analyzing public spending, procurement, and welfare delivery with statistical forensics and AI-powered insights
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/fiscal"
              className="bg-white text-cyan-600 hover:bg-cyan-50 px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Fiscal Leakage →
            </Link>
            <Link
              href="/procurement"
              className="bg-white text-cyan-600 hover:bg-cyan-50 px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Procurement Intelligence →
            </Link>
            <Link
              href="/welfare"
              className="bg-white text-cyan-600 hover:bg-cyan-50 px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Welfare Forensics →
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm mb-2">
            CyberLens © 2026 — AI-Powered Digital Forensics Pipeline
          </p>
          <p className="text-xs text-slate-500">
            Built with Next.js 16, FastAPI, and Machine Learning • For official use by authorized government agencies
          </p>
        </div>
      </footer>
    </main>
  );
}

// Governance Modules Data
const governanceModules = [
  {
    title: "Fiscal Leakage Analysis",
    description: "Benford's Law-based anomaly detection in government spending to identify threshold gaming and invoice manipulation patterns",
    href: "/fiscal",
    icon: <Wallet className="w-8 h-8" />,
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600"
  },
  {
    title: "Public Procurement Intelligence",
    description: "Bid-rigging and cartel detection in public tenders using statistical analysis and behavioral pattern recognition",
    href: "/procurement",
    icon: <Building2 className="w-8 h-8" />,
    bgColor: "bg-blue-50",
    textColor: "text-blue-600"
  },
  {
    title: "Welfare Delivery Forensics",
    description: "Beneficiary and disbursement anomaly detection to identify ghost beneficiaries and delivery gaps in social schemes",
    href: "/welfare",
    icon: <Users className="w-8 h-8" />,
    bgColor: "bg-purple-50",
    textColor: "text-purple-600"
  }
];

// Platform Capabilities
const capabilities = [
  {
    title: "Statistical Forensics",
    description: "Benford's Law and research-backed statistical methods for detecting financial anomalies",
    icon: <TrendingUp className="w-6 h-6" />
  },
  {
    title: "AI-Assisted Investigation",
    description: "Machine learning models for fraud prediction and scam classification with 94%+ accuracy",
    icon: <Brain className="w-6 h-6" />
  },
  {
    title: "Explainable Outputs",
    description: "Policy-safe language and plain-language findings suitable for judicial review",
    icon: <Eye className="w-6 h-6" />
  },
  {
    title: "Court-Ready Reports",
    description: "PDF generation with blockchain verification and chain of custody logging",
    icon: <FileText className="w-6 h-6" />
  },
  {
    title: "Multi-Source Analysis",
    description: "OCR, NER, OSINT, and regex-based entity extraction from diverse evidence formats",
    icon: <Network className="w-6 h-6" />
  },
  {
    title: "Audit Trail",
    description: "Immutable blockchain-based evidence logging for legal admissibility",
    icon: <Scale className="w-6 h-6" />
  }
];

// Target Users
const targetUsers = [
  {
    title: "Law Enforcement",
    description: "Cyber crime units and investigation agencies",
    icon: <Shield className="w-5 h-5" />
  },
  {
    title: "Government Auditors",
    description: "CAG, CVC, and audit departments",
    icon: <CheckCircle2 className="w-5 h-5" />
  },
  {
    title: "Anti-Corruption Units",
    description: "ACB and vigilance departments",
    icon: <AlertTriangle className="w-5 h-5" />
  },
  {
    title: "Judicial Officers",
    description: "Magistrates and court officials",
    icon: <Scale className="w-5 h-5" />
  },
  {
    title: "Policy Analysts",
    description: "Think tanks and research institutions",
    icon: <BarChart3 className="w-5 h-5" />
  },
  {
    title: "Procurement Officers",
    description: "Public procurement monitoring teams",
    icon: <Building2 className="w-5 h-5" />
  }
];

// Original Feature list (keeping for reference, not rendered)
const features = [
  {
    title: "OCR + NER Intelligence",
    desc: "Extract entities, URLs, and suspicious patterns from uploaded evidence using Optical Character Recognition and Named Entity Recognition.",
    icon: <Shield className="w-6 h-6" />,
  },
  {
    title: "Real-time Scam Classification",
    desc: "AI-powered text classifier detects potential fraud, phishing, and scam indicators across multiple case files in seconds.",
    icon: <BarChart3 className="w-6 h-6" />,
  },
  {
    title: "Heuristic + OSINT Risk Scoring",
    desc: "Integrates VirusTotal, OpenPhish, WHOIS, and heuristic checks to automatically assign cyber risk levels to domains and URLs.",
    icon: <FileText className="w-6 h-6" />,
  },
  {
    title: "ML-Powered Fraud Detection",
    desc: "Advanced machine learning models analyze contract patterns to predict fraud with confidence scores and explainable fraud signals.",
    icon: <AlertTriangle className="w-6 h-6" />,
  },
  {
    title: "Batch Intelligence Reports",
    desc: "Analyze multiple evidences simultaneously and generate unified reports that summarize patterns, risk clusters, and related entities.",
    icon: <Upload className="w-6 h-6" />,
  },
  {
    title: "Interactive Dashboard",
    desc: "Visualize clusters, top entities, and overall risk metrics to prioritize investigations efficiently.",
    icon: <Network className="w-6 h-6" />,
  },
];
