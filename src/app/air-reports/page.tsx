"use client";

import ReportsArchive, { MiddleCol } from "@/components/ReportsArchive";

// Air: S/N, Report No, Aircraft Operator, Reg No, Aircraft Type, Occurrence, Date Released, Status, Download
const columns: MiddleCol[] = [
  { label: "Aircraft Operator", get: (r) => r.operator || "" },
  { label: "REG NO.", width: "120px", muted: true, get: (r) => r.reg_no || "" },
  { label: "Aircraft Type", width: "130px", muted: true, get: (r) => r.vehicle_type || "" },
];

export default function AirReportsPage() {
  return (
    <ReportsArchive
      sector="aviation"
      activeTab="aircraft"
      heroTitle={<>Aircraft Accident<br />Reports</>}
      heroSubtitle="Access formal aeronautical investigations, safety records, and technical findings of aircraft incidents across Nigeria."
      middleColumns={columns}
    />
  );
}
