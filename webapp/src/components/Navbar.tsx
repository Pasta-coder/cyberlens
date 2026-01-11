"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Shield } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isGovernanceOpen, setIsGovernanceOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const governanceModules = [
    { name: "Fiscal Leakage", href: "/fiscal", desc: "Spending anomalies" },
    { name: "Procurement Intelligence", href: "/procurement", desc: "Bid-rigging detection" },
    { name: "Welfare Forensics", href: "/welfare", desc: "Beneficiary gaps" },
  ];

  const mainNavItems = [
    { name: "Public Fraud", href: "/dashboard" },
    { name: "Fraud Predict", href: "/fraud-predict" },
    { name: "Government Spending", href: "/fiscal" },
    { name: "Procurement", href: "/procurement" },
    { name: "Welfare", href: "/welfare" },
  ];

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white shadow-xl border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight hover:text-cyan-400 transition-colors group"
          >
            <Shield className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-100">
              SatyaSetu.AI
            </span>
          </Link>

          {/* Navigation Items */}
          <ul className="hidden md:flex items-center gap-1">
            {mainNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.href)
                      ? "bg-cyan-500/20 text-cyan-300"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}

            {/* Governance Dropdown */}
            <li
              className="relative"
              onMouseEnter={() => setIsGovernanceOpen(true)}
              onMouseLeave={() => setIsGovernanceOpen(false)}
            >
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${["/fiscal", "/procurement", "/welfare"].some((path) => pathname.startsWith(path))
                    ? "bg-cyan-500/20 text-cyan-300"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
              >
                Governance Analytics
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${isGovernanceOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isGovernanceOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-50">
                  {governanceModules.map((module, index) => (
                    <Link
                      key={module.href}
                      href={module.href}
                      className={`block px-5 py-4 hover:bg-slate-700/50 transition-colors ${index !== governanceModules.length - 1 ? "border-b border-slate-700/50" : ""
                        } ${isActive(module.href) ? "bg-cyan-500/10" : ""
                        }`}
                    >
                      <div className="font-semibold text-white text-sm mb-1">
                        {module.name}
                      </div>
                      <div className="text-slate-400 text-xs">
                        {module.desc}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </li>
          </ul>

          {/* Mobile Menu Button (placeholder) */}
          <button className="md:hidden text-slate-300 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
