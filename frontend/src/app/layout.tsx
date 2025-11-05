import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cyber Evidence Triager",
  description: "AI-powered digital evidence analyzer with chain-of-custody tracking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <header className="border-b bg-white shadow-sm">
          <div className="max-w-6xl mx-auto p-4 font-semibold text-lg">
            🧠 Cyber Evidence Triager
          </div>
        </header>
        <main className="max-w-6xl mx-auto py-6 px-4">{children}</main>
      </body>
    </html>
  );
}
