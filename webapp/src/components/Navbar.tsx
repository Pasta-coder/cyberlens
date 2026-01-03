"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Upload", href: "/upload" },
    { name: "Cases", href: "/cases" },
    { name: "Fraud Predict", href: "/fraud-predict" },
    { name: "Procurement", href: "/procurement" },
    { name: "Welfare Forensics", href: "/welfare" },
    { name: "Fiscal Leakage", href: "/fiscal" },
    { name: "Reports", href: "/report/unified" },
  ];

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <Link href="/" className="text-xl font-semibold tracking-wide text-cyan-400">
          CyberLens
        </Link>
        <ul className="flex gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`hover:text-cyan-300 ${
                  pathname.startsWith(item.href) ? "text-cyan-400 underline" : ""
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
