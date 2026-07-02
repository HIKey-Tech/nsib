"use client";

import ReportsArchive, { MiddleCol } from "@/components/ReportsArchive";

// Other: accidents outside the three main transport modes — generic columns.
const columns: MiddleCol[] = [
  { label: "Operator / Party", get: (r) => r.operator || "" },
  { label: "Reference", width: "140px", muted: true, get: (r) => r.reg_no || "" },
  { label: "Type", width: "150px", muted: true, get: (r) => r.vehicle_type || "" },
];

export default function OtherReportsPage() {
  return (
    <ReportsArchive
      sector="other"
      activeTab="other"
      heroTitle={<>Other Accident<br />Reports</>}
      heroSubtitle="Investigation reports covering accidents and occurrences beyond the aviation, maritime, and rail transport modes."
      middleColumns={columns}
    />
  );
}
