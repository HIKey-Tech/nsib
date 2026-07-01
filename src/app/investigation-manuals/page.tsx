"use client";

import PublicationsArchive from "@/components/PublicationsArchive";

export default function ManualsPage() {
  return (
    <PublicationsArchive
      source={{ kind: "category", category: "manual" }}
      activeTab="manuals"
      heroTitle={<>Investigation<br />Manuals</>}
      heroSubtitle="Official NSIB investigation procedures, methodologies, and technical reference manuals."
    />
  );
}
