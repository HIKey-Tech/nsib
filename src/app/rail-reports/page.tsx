"use client";

import ReportsArchive, { MiddleCol } from "@/components/ReportsArchive";

// Rail: S/N, Report No, Train Name, Train Operator, Reg No, Train Type, Occurrence, Date Released, Status, Download
const columns: MiddleCol[] = [
  { label: "Train Name", get: (r) => r.train_name || "" },
  { label: "Train Operator", get: (r) => r.operator || "" },
  { label: "REG NO.", width: "120px", muted: true, get: (r) => r.reg_no || "" },
  { label: "Train Type", width: "120px", muted: true, get: (r) => r.vehicle_type || "" },
];

export default function RailReportsPage() {
  return (
    <ReportsArchive
      sector="railway"
      activeTab="rail"
      heroTitle={<>Rail Accident<br />Reports</>}
      heroSubtitle="Access comprehensive accident data, preliminary investigations, and final analyses of all railway incidents."
      middleColumns={columns}
    />
  );
}
