"use client";

import PublicationsArchive from "@/components/PublicationsArchive";

export default function FormsPage() {
  return (
    <PublicationsArchive
      source={{ kind: "category", category: "form" }}
      activeTab="forms"
      heroTitle={<>Forms &amp;<br />Checklists</>}
      heroSubtitle="Standardised investigation forms, notification templates, and safety checklists for download."
    />
  );
}
