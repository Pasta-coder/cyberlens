import "@/styles/globals.css";
import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import CopilotWrapper from "@/components/CopilotWrapper";

export const metadata: Metadata = {
  title: "SatyaSetu.AI Forensics",
  description:
    "AI-powered cyber evidence analysis and OSINT intelligence platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col font-inter" suppressHydrationWarning>
        {/* === Top Navigation === */}
        <Navbar />

        {/* === Page Content === */}
        <main className="flex-1 w-full px-4 sm:px-8 py-8">{children}</main>

        {/* === AI Copilot (floating on all pages) === */}
        <CopilotWrapper />

        {/* === Footer === */}
        <footer className="bg-gray-900 text-gray-400 text-sm text-center py-4 mt-auto border-t border-gray-800">
          <p>
            SatyaSetu.AI © {new Date().getFullYear()} — AI-Powered Digital
            Forensics Pipeline.
          </p>
        </footer>
      </body>
    </html>
  );
}

