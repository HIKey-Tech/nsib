"use client";

import ReportsArchive, { MiddleCol } from "@/components/ReportsArchive";

// Marine: S/N, Report No, Operator, Vessel/Craft No, Vessel Type, Occurrence, Date Released, Status, Download
const columns: MiddleCol[] = [
  { label: "Operator", get: (r) => r.operator || "" },
  { label: "Vessel/Craft No.", width: "130px", muted: true, get: (r) => r.reg_no || "" },
  { label: "Vessel Type", width: "130px", muted: true, get: (r) => r.vehicle_type || "" },
];

export default function MarineReportsPage() {
  return (
    <ReportsArchive
      sector="maritime"
      activeTab="maritime"
      heroTitle={<>Marine Accident<br />Reports</>}
      heroSubtitle="Access formal navigational investigations, safety records, and findings of maritime incidents across Nigerian waters."
      middleColumns={columns}
    />
  );
}
