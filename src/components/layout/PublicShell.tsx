"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatWidget from "@/components/ui/ChatWidget";
import Analytics from "@/components/Analytics";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPortal = pathname?.startsWith("/dashboard") || pathname?.startsWith("/login");

  return (
    <div style={{ overflowX: "hidden", width: "100%" }}>
      {!isPortal && <Analytics />}
      {!isPortal && <Navbar />}
      <div style={isPortal ? undefined : { paddingTop: "var(--nav-height)" }}>
        {children}
      </div>
      {!isPortal && <Footer />}
      {!isPortal && <ChatWidget />}
    </div>
  );
}
