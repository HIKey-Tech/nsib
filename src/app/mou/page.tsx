"use client";

import PublicationsArchive from "@/components/PublicationsArchive";

export default function MouPage() {
  return (
    <PublicationsArchive
      source={{ kind: "category", category: "mou" }}
      activeTab="mou"
      heroTitle={<>Memoranda of<br />Understanding</>}
      heroSubtitle="Cooperation agreements between the NSIB and partner agencies, institutions, and international bodies."
    />
  );
}
