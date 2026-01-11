"use client";

import { LanguageProvider } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <Navbar />
      {children}
    </LanguageProvider>
  );
}
