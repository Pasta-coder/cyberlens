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
  Eye,
  Languages
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

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

// Translations
const translations = {
  en: {
    hero: {
      title: "SatyaSetu.AI",
      subtitle: "Bridging the gap between data and truth",
      description: "SatyaSetu.AI is a intelligence platform that uses AI and statistical forensics to turn government data and digital evidence into clear, explainable audit signals for fraud detection and public accountability.",
      contractFraudBtn: "Contract Fraud Detector",
      publicFraudBtn: "Public Fraud Detector"
    },
    fraudPrediction: {
      badge: "AI-Powered Detection",
      title: "XGBoost Fraud Prediction Engine",
      description: "Detect procurement fraud before it happens with our Romania-trained machine learning model achieving",
      accuracy: "R² = 0.74",
      accuracyText: "accuracy on corruption risk prediction.",
      feature1Title: "Rule-Based Fraud Signals",
      feature1Desc: "Detects round number manipulation, single bidder patterns, cost overruns",
      feature2Title: "Explainable AI Output",
      feature2Desc: "Feature breakdown and fraud signal severity levels for transparency",
      feature3Title: "Batch Processing",
      feature3Desc: "Analyze multiple contracts simultaneously with aggregate statistics",
      launchBtn: "Launch Fraud Detector",
      viewAllBtn: "View All Tools",
      riskAssessment: "Risk Assessment",
      contractAnalysis: "Contract Analysis",
      singleBidder: "Single Bidder",
      singleBidderDesc: "High severity fraud signal",
      costOverrun: "Cost Overrun 23%",
      costOverrunDesc: "Exceeds estimate significantly",
      roundNumber: "Round Number",
      roundNumberDesc: "Price manipulation indicator",
      corruptionRisk: "Corruption Risk Index",
      critical: "CRITICAL",
      investigationRequired: "Investigation Required",
      high: "HIGH",
      medium: "MEDIUM",
      low: "LOW"
    },
    governanceModules: {
      title: "Governance Intelligence Modules",
      subtitle: "Statistical forensics and AI-powered anomaly detection for three critical governance domains"
    },
    modules: {
      fiscal: {
        title: "Fiscal Leakage Analysis",
        description: "Benford's Law-based anomaly detection in government spending to identify threshold gaming and invoice manipulation patterns",
        action: "Open Dashboard"
      },
      procurement: {
        title: "Public Procurement Intelligence",
        description: "Bid-rigging and cartel detection in public tenders using statistical analysis and behavioral pattern recognition",
        action: "Open Dashboard"
      },
      welfare: {
        title: "Welfare Delivery Forensics",
        description: "Beneficiary and disbursement anomaly detection to identify ghost beneficiaries and delivery gaps in social schemes",
        action: "Open Dashboard"
      }
    },
    capabilities: {
      title: "Platform Capabilities",
      subtitle: "Enterprise-grade forensics toolkit built for national-scale governance intelligence",
      items: [
        {
          title: "Statistical Forensics",
          description: "Benford's Law and research-backed statistical methods for detecting financial anomalies"
        },
        {
          title: "AI-Assisted Investigation",
          description: "Machine learning models for fraud prediction and scam classification with 94%+ accuracy"
        },
        {
          title: "Explainable Outputs",
          description: "Policy-safe language and plain-language findings suitable for judicial review"
        },
        {
          title: "Court-Ready Reports",
          description: "PDF generation with blockchain verification and chain of custody logging"
        },
        {
          title: "Multi-Source Analysis",
          description: "OCR, NER, OSINT, and regex-based entity extraction from diverse evidence formats"
        },
        {
          title: "Audit Trail",
          description: "Immutable blockchain-based evidence logging for legal admissibility"
        }
      ]
    },
    targetUsers: {
      title: "Built for Governance Professionals",
      subtitle: "Trusted by auditors, investigators, and policymakers across government institutions",
      roles: [
        {
          title: "Law Enforcement",
          description: "Cyber crime units and investigation agencies"
        },
        {
          title: "Government Auditors",
          description: "CAG, CVC, and audit departments"
        },
        {
          title: "Anti-Corruption Units",
          description: "ACB and vigilance departments"
        },
        {
          title: "Judicial Officers",
          description: "Magistrates and court officials"
        },
        {
          title: "Policy Analysts",
          description: "Think tanks and research institutions"
        },
        {
          title: "Procurement Officers",
          description: "Public procurement monitoring teams"
        }
      ]
    },
    footer: {
      copyright: "SatyaSetu.AI © 2026 — All rights reserved.",
      builtWith: "Built with Next.js 16, FastAPI, and Machine Learning Technologies"
    }
  },
  hi: {
    hero: {
      title: "सत्यसेतु.एआई",
      subtitle: "डेटा और सत्य के बीच पुल का निर्माण",
      description: "सत्यसेतु.एआई एक बुद्धिमत्ता प्लेटफ़ॉर्म है जो सरकारी डेटा और डिजिटल साक्ष्य को धोखाधड़ी का पता लगाने और सार्वजनिक जवाबदेही के लिए स्पष्ट, व्याख्यात्मक ऑडिट संकेतों में बदलने के लिए एआई और सांख्यिकीय फोरेंसिक का उपयोग करता है।",
      contractFraudBtn: "अनुबंध धोखाधड़ी डिटेक्टर",
      publicFraudBtn: "सार्वजनिक धोखाधड़ी डिटेक्टर"
    },
    fraudPrediction: {
      badge: "एआई-संचालित पहचान",
      title: "एक्सजीबूस्ट धोखाधड़ी भविष्यवाणी इंजन",
      description: "रोमानिया-प्रशिक्षित मशीन लर्निंग मॉडल के साथ खरीद धोखाधड़ी का पता लगाएं जो",
      accuracy: "R² = 0.74",
      accuracyText: "भ्रष्टाचार जोखिम भविष्यवाणी पर सटीकता प्राप्त करता है।",
      feature1Title: "नियम-आधारित धोखाधड़ी संकेत",
      feature1Desc: "गोल संख्या में हेरफेर, एकल बोलीदाता पैटर्न, लागत में वृद्धि का पता लगाता है",
      feature2Title: "व्याख्यात्मक एआई आउटपुट",
      feature2Desc: "पारदर्शिता के लिए फीचर ब्रेकडाउन और धोखाधड़ी संकेत गंभीरता स्तर",
      feature3Title: "बैच प्रोसेसिंग",
      feature3Desc: "समग्र आंकड़ों के साथ एक साथ कई अनुबंधों का विश्लेषण करें",
      launchBtn: "धोखाधड़ी डिटेक्टर लॉन्च करें",
      viewAllBtn: "सभी उपकरण देखें",
      riskAssessment: "जोखिम मूल्यांकन",
      contractAnalysis: "अनुबंध विश्लेषण",
      singleBidder: "एकल बोलीदाता",
      singleBidderDesc: "उच्च गंभीरता धोखाधड़ी संकेत",
      costOverrun: "लागत में वृद्धि 23%",
      costOverrunDesc: "अनुमान से काफी अधिक",
      roundNumber: "गोल संख्या",
      roundNumberDesc: "मूल्य हेरफेर संकेतक",
      corruptionRisk: "भ्रष्टाचार जोखिम सूचकांक",
      critical: "गंभीर",
      investigationRequired: "जांच आवश्यक",
      high: "उच्च",
      medium: "मध्यम",
      low: "निम्न"
    },
    governanceModules: {
      title: "शासन सूचना मॉड्यूल",
      subtitle: "तीन महत्वपूर्ण शासन डोमेन के लिए सांख्यिकीय फोरेंसिक और एआई-संचालित विसंगति पहचान"
    },
    modules: {
      fiscal: {
        title: "वित्तीय रिसाव विश्लेषण",
        description: "सीमा गेमिंग और चालान हेरफेर पैटर्न की पहचान करने के लिए सरकारी खर्च में बेनफोर्ड कानून-आधारित विसंगति पहचान",
        action: "डैशबोर्ड खोलें"
      },
      procurement: {
        title: "सार्वजनिक खरीद सूचना",
        description: "सांख्यिकीय विश्लेषण और व्यवहार पैटर्न पहचान का उपयोग करके सार्वजनिक निविदाओं में बोली-धांधली और कार्टेल का पता लगाना",
        action: "डैशबोर्ड खोलें"
      },
      welfare: {
        title: "कल्याण वितरण फोरेंसिक",
        description: "सामाजिक योजनाओं में भूत लाभार्थियों और वितरण अंतराल की पहचान करने के लिए लाभार्थी और वितरण विसंगति पहचान",
        action: "डैशबोर्ड खोलें"
      }
    },
    capabilities: {
      title: "प्लेटफ़ॉर्म क्षमताएं",
      subtitle: "राष्ट्रीय स्तर की शासन सूचना के लिए निर्मित उद्यम-ग्रेड फोरेंसिक टूलकिट",
      items: [
        {
          title: "सांख्यिकीय फोरेंसिक",
          description: "वित्तीय विसंगतियों का पता लगाने के लिए बेनफोर्ड का कानून और शोध-समर्थित सांख्यिकीय विधियां"
        },
        {
          title: "एआई-सहायता प्राप्त जांच",
          description: "94%+ सटीकता के साथ धोखाधड़ी भविष्यवाणी और घोटाला वर्गीकरण के लिए मशीन लर्निंग मॉडल"
        },
        {
          title: "व्याख्यात्मक आउटपुट",
          description: "न्यायिक समीक्षा के लिए उपयुक्त नीति-सुरक्षित भाषा और सरल-भाषा निष्कर्ष"
        },
        {
          title: "कोर्ट-रेडी रिपोर्ट",
          description: "ब्लॉकचेन सत्यापन और हिरासत की श्रृंखला लॉगिंग के साथ पीडीएफ पीढ़ी"
        },
        {
          title: "बहु-स्रोत विश्लेषण",
          description: "विविध साक्ष्य प्रारूपों से ओसीआर, एनईआर, ओएसआईएनटी, और रेगेक्स-आधारित इकाई निष्कर्षण"
        },
        {
          title: "ऑडिट ट्रेल",
          description: "कानूनी स्वीकार्यता के लिए अपरिवर्तनीय ब्लॉकचेन-आधारित साक्ष्य लॉगिंग"
        }
      ]
    },
    targetUsers: {
      title: "शासन पेशेवरों के लिए निर्मित",
      subtitle: "सरकारी संस्थानों में लेखा परीक्षकों, जांचकर्ताओं और नीति निर्माताओं द्वारा विश्वसनीय",
      roles: [
        {
          title: "कानून प्रवर्तन",
          description: "साइबर अपराध इकाइयां और जांच एजेंसियां"
        },
        {
          title: "सरकारी लेखा परीक्षक",
          description: "सीएजी, सीवीसी, और लेखा परीक्षा विभाग"
        },
        {
          title: "भ्रष्टाचार विरोधी इकाइयां",
          description: "एसीबी और सतर्कता विभाग"
        },
        {
          title: "न्यायिक अधिकारी",
          description: "मजिस्ट्रेट और न्यायालय अधिकारी"
        },
        {
          title: "नीति विश्लेषक",
          description: "थिंक टैंक और अनुसंधान संस्थान"
        },
        {
          title: "खरीद अधिकारी",
          description: "सार्वजनिक खरीद निगरानी टीम"
        }
      ]
    },
    footer: {
      copyright: "सत्यसेतु.एआई © 2026 — सर्वाधिकार सुरक्षित।",
      builtWith: "Next.js 16, FastAPI, और मशीन लर्निंग प्रौद्योगिकियों के साथ निर्मित"
    }
  }
};

export default function HomePage() {
  const [language, setLanguage] = useState<"en" | "hi">("en");

  useEffect(() => {
    // Load language preference from localStorage
    const savedLang = localStorage.getItem("homepage-language") as "en" | "hi" | null;
    if (savedLang && (savedLang === "en" || savedLang === "hi")) {
      setLanguage(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === "en" ? "hi" : "en";
    setLanguage(newLang);
    localStorage.setItem("homepage-language", newLang);
  };

  const t = translations[language];
  return (
    <main className="min-h-screen relative flex flex-col font-inter text-slate-200">

      {/* GLOBAL FIXED BACKGROUND - The "Scrolling Effect" */}
      <div className="fixed inset-0 w-full h-full z-0">
        <Image
          src="/back.png"
          alt="Viksit India 2047 - Bold Vision, Brighter Future"
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
        {/* Dark overlay to ensure text readability across the whole app */}
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px]"></div>
        {/* Subtle Grid overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-2"></div>
      </div>

      {/* CONTENT WRAPPER - Relative z-10 allows content to scroll OVER the fixed background */}
      <div className="relative z-10 flex-1 w-full">

        {/* Language Toggle Button - Fixed Position */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="fixed top-24 right-6 z-50"
        >
          <button
            onClick={toggleLanguage}
            className="group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-full font-semibold shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 flex items-center gap-3 border-2 border-white/20"
            aria-label="Toggle Language"
          >
            <Languages className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="font-bold">{language === "en" ? "हिन्दी में पढ़ें" : "Read in English"}</span>
          </button>
        </motion.div>

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 px-6">
          <div className="relative max-w-7xl mx-auto">
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
                {t.hero.title}
              </h1>

              <h2 className="text-xl md:text-2xl font-semibold mb-4 text-cyan-100">
                {t.hero.subtitle}
              </h2>

              <p className="text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto mb-10">
                {t.hero.description}
              </p>

              <div className="flex flex-wrap justify-center gap-4">

                <Link
                  href="/fraud-predict"
                  className="group bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2"
                >
                  <AlertTriangle className="w-5 h-5" />
                  {t.hero.contractFraudBtn}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/upload"
                  className="group bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2"
                >
                  <AlertTriangle className="w-5 h-5" />
                  {t.hero.publicFraudBtn}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>


        {/* AI Fraud Prediction Feature Highlight */}
        {/* Used a light semi-transparent background to ensure the dark text remains readable */}
        <section className="py-20 px-6 bg-slate-50/90 backdrop-blur-md">
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
                  {t.fraudPrediction.badge}
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                  {t.fraudPrediction.title}
                </h2>

                <p className="text-lg text-slate-700 mb-6 leading-relaxed">
                  {t.fraudPrediction.description} <span className="font-bold text-red-600">{t.fraudPrediction.accuracy}</span> {t.fraudPrediction.accuracyText}
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-slate-900">{t.fraudPrediction.feature1Title}</p>
                      <p className="text-slate-600 text-sm">{t.fraudPrediction.feature1Desc}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-slate-900">{t.fraudPrediction.feature2Title}</p>
                      <p className="text-slate-600 text-sm">{t.fraudPrediction.feature2Desc}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-slate-900">{t.fraudPrediction.feature3Title}</p>
                      <p className="text-slate-600 text-sm">{t.fraudPrediction.feature3Desc}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/fraud-predict"
                    className="group bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    {t.fraudPrediction.launchBtn}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <a
                    href="#governance-modules"
                    className="px-8 py-4 rounded-xl font-semibold border-2 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-all duration-300"
                  >
                    {t.fraudPrediction.viewAllBtn}
                  </a>
                </div>
              </div>

              {/* Right Visual */}
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">{t.fraudPrediction.riskAssessment}</p>
                      <p className="text-2xl font-bold text-slate-900">{t.fraudPrediction.contractAnalysis}</p>
                    </div>
                    <div className="text-5xl">🚨</div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <div>
                        <p className="font-semibold text-slate-900">{t.fraudPrediction.singleBidder}</p>
                        <p className="text-sm text-slate-600">{t.fraudPrediction.singleBidderDesc}</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-red-200 text-red-800">{t.fraudPrediction.high}</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                      <div>
                        <p className="font-semibold text-slate-900">{t.fraudPrediction.costOverrun}</p>
                        <p className="text-sm text-slate-600">{t.fraudPrediction.costOverrunDesc}</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-yellow-200 text-yellow-800">{t.fraudPrediction.medium}</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                      <div>
                        <p className="font-semibold text-slate-900">{t.fraudPrediction.roundNumber}</p>
                        <p className="text-sm text-slate-600">{t.fraudPrediction.roundNumberDesc}</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-gray-200 text-gray-800">{t.fraudPrediction.low}</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-6 text-white">
                    <p className="text-sm mb-2 opacity-90">{t.fraudPrediction.corruptionRisk}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-4xl font-bold">78.4%</p>
                      <div className="text-right">
                        <p className="text-2xl font-bold">🔴 {t.fraudPrediction.critical}</p>
                        <p className="text-sm opacity-90">{t.fraudPrediction.investigationRequired}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
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
              {/* Text color adjusted to slate-100 for dark background readability */}
              <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
                {t.governanceModules.title}
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                {t.governanceModules.subtitle}
              </p>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {governanceModules(t).map((module) => (
                <motion.div key={module.href} variants={fadeInUp}>
                  <Link href={module.href}>
                    {/* Kept card white but added transparency option if preferred. Keeping solid for contrast */}
                    <div className="group h-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-slate-200/50 hover:border-cyan-400 hover:-translate-y-2">
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
                        {module.action}
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
        {/* Replaced solid bg-slate-900 with semi-transparent to see background */}
        <section className="py-20 px-6 bg-slate-900/60 backdrop-blur-sm border-y border-slate-700/50 text-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                {t.capabilities.title}
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                {t.capabilities.subtitle}
              </p>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {capabilities(t).map((capability) => (
                <motion.div
                  key={capability.title}
                  variants={fadeInUp}
                  className="bg-slate-800/60 backdrop-blur-md rounded-xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300"
                >
                  <div className="text-cyan-400 mb-4">{capability.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{capability.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{capability.description}</p>
                </motion.div>
              ))}
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
              <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
                {t.targetUsers.title}
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                {t.targetUsers.subtitle}
              </p>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {targetUsers(t).map((user) => (
                <motion.div
                  key={user.title}
                  variants={fadeInUp}
                  className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300"
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

        {/* Footer */}
        <footer className="bg-slate-900/90 backdrop-blur-md text-slate-400 py-12 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm mb-2">
              {t.footer.copyright}
            </p>
            <p className="text-xs text-slate-500">
              {t.footer.builtWith}
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}

// Governance Modules Data
const governanceModules = (t: any) => [
  {
    title: t.modules.fiscal.title,
    description: t.modules.fiscal.description,
    action: t.modules.fiscal.action,
    href: "/fiscal",
    icon: <Wallet className="w-8 h-8" />,
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600"
  },
  {
    title: t.modules.procurement.title,
    description: t.modules.procurement.description,
    action: t.modules.procurement.action,
    href: "/procurement",
    icon: <Building2 className="w-8 h-8" />,
    bgColor: "bg-blue-50",
    textColor: "text-blue-600"
  },
  {
    title: t.modules.welfare.title,
    description: t.modules.welfare.description,
    action: t.modules.welfare.action,
    href: "/welfare",
    icon: <Users className="w-8 h-8" />,
    bgColor: "bg-purple-50",
    textColor: "text-purple-600"
  }
];

// Platform Capabilities
const capabilities = (t: any) => [
  {
    title: t.capabilities.items[0].title,
    description: t.capabilities.items[0].description,
    icon: <TrendingUp className="w-6 h-6" />
  },
  {
    title: t.capabilities.items[1].title,
    description: t.capabilities.items[1].description,
    icon: <Brain className="w-6 h-6" />
  },
  {
    title: t.capabilities.items[2].title,
    description: t.capabilities.items[2].description,
    icon: <Eye className="w-6 h-6" />
  },
  {
    title: t.capabilities.items[3].title,
    description: t.capabilities.items[3].description,
    icon: <FileText className="w-6 h-6" />
  },
  {
    title: t.capabilities.items[4].title,
    description: t.capabilities.items[4].description,
    icon: <Network className="w-6 h-6" />
  },
  {
    title: t.capabilities.items[5].title,
    description: t.capabilities.items[5].description,
    icon: <Scale className="w-6 h-6" />
  }
];

// Target Users
const targetUsers = (t: any) => [
  {
    title: t.targetUsers.roles[0].title,
    description: t.targetUsers.roles[0].description,
    icon: <Shield className="w-5 h-5" />
  },
  {
    title: t.targetUsers.roles[1].title,
    description: t.targetUsers.roles[1].description,
    icon: <CheckCircle2 className="w-5 h-5" />
  },
  {
    title: t.targetUsers.roles[2].title,
    description: t.targetUsers.roles[2].description,
    icon: <AlertTriangle className="w-5 h-5" />
  },
  {
    title: t.targetUsers.roles[3].title,
    description: t.targetUsers.roles[3].description,
    icon: <Scale className="w-5 h-5" />
  },
  {
    title: t.targetUsers.roles[4].title,
    description: t.targetUsers.roles[4].description,
    icon: <BarChart3 className="w-5 h-5" />
  },
  {
    title: t.targetUsers.roles[5].title,
    description: t.targetUsers.roles[5].description,
    icon: <Building2 className="w-5 h-5" />
  }
];