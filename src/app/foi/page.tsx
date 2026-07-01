"use client";

import PublicationsArchive from "@/components/PublicationsArchive";

export default function FoiPage() {
  return (
    <PublicationsArchive
      source={{ kind: "category", category: "foi" }}
      activeTab="foi"
      heroTitle={<>Freedom of<br />Information</>}
      heroSubtitle="Freedom of Information documents, disclosures, and public records published by the NSIB."
    />
  );
}
