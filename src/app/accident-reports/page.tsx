"use client";

import ReportsArchive, { MiddleCol } from "@/components/ReportsArchive";

const columns: MiddleCol[] = [
  { label: "Sector", width: "120px", get: (r) => r.sector ? r.sector.charAt(0).toUpperCase() + r.sector.slice(1) : "—" },
  { label: "Operator", get: (r) => r.operator || "—" },
  { label: "Ref / Reg / Name", width: "180px", muted: true, get: (r) => r.reg_no || r.train_name || "—" },
  { label: "Vehicle Type", width: "150px", muted: true, get: (r) => r.vehicle_type || "—" },
];

export default function AllReportsPage() {
  return (
    <ReportsArchive
      sector=""
      activeTab="all"
      heroTitle={<>Accident &amp;<br />Incident Reports</>}
      heroSubtitle="Unified archive of all official accident investigation reports, preliminary statements, and safety recommendations."
      middleColumns={columns}
    />
  );
}

