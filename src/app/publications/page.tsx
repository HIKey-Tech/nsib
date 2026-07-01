"use client";

import PublicationsArchive from "@/components/PublicationsArchive";

export default function PublicationsPage() {
  return (
    <PublicationsArchive
      source={{ kind: "all" }}
      activeTab="all"
      heroTitle={<>Publications &amp;<br />Resources</>}
      heroSubtitle="A unified archive of NSIB investigation reports, news, legislations, MoUs, forms, manuals, and FOI documents."
    />
  );
}
