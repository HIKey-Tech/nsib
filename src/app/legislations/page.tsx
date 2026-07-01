"use client";

import PublicationsArchive from "@/components/PublicationsArchive";

export default function LegislationsPage() {
  return (
    <PublicationsArchive
      source={{ kind: "category", category: "legislation" }}
      activeTab="legislations"
      heroTitle={<>Acts &amp;<br />Legislations</>}
      heroSubtitle="Acts, regulations, and legal frameworks governing the Nigerian Safety Investigation Bureau and transport safety."
    />
  );
}
