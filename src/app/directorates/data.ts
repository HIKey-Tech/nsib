export interface Directorate {
  num: string;
  name: string;
  label: string;
  slug: string;
  desc: string;
  mandate: string;
  functions: string[];
  accent: string;
  category: "Operational" | "Technical" | "Advisory" | "Administrative" | "Executive";
}

export const directorates: Directorate[] = [
  {
    num: "01",
    name: "Transport Investigation",
    label: "Directorate of Transport Investigation",
    slug: "transport-investigation",
    desc: "The core investigative arm of the Bureau, leading multi-modal accident and serious incident investigations across aviation, maritime, and rail sectors.",
    mandate: "To independently investigate transport accidents and serious incidents within Nigeria, determine their probable causes, and issue safety recommendations to prevent recurrence — without attributing blame or liability.",
    functions: [
      "Lead accident and serious incident investigations across all transport modes.",
      "Collect and analyse evidence from accident sites, flight data recorders, and witness accounts.",
      "Produce comprehensive investigation reports with factual findings and safety recommendations.",
      "Liaise with international counterpart agencies (ICAO, IMO, ERA) during cross-border investigations.",
      "Maintain a national accident and incident database for trend analysis.",
    ],
    accent: "var(--nsib-red)",
    category: "Operational",
  },
  {
    num: "02",
    name: "Technical Services",
    label: "Directorate of Technical Services",
    slug: "technical-services",
    desc: "Provides scientific and engineering analysis — flight data readout, structural assessment, and forensic support — underpinning every investigation.",
    mandate: "To deliver specialised technical analysis, laboratory services, and engineering expertise that form the evidentiary backbone of every investigation conducted by the Bureau.",
    functions: [
      "Readout and analysis of flight data recorders (FDR) and cockpit voice recorders (CVR).",
      "Structural, materials, and systems engineering assessments.",
      "Maintenance records analysis and airworthiness or seaworthiness evaluations.",
      "Coordination with original equipment manufacturers and type certificate holders.",
      "Management and calibration of investigative instrumentation and technical equipment.",
    ],
    accent: "var(--nsib-navy)",
    category: "Technical",
  },
  {
    num: "03",
    name: "Legal Services",
    label: "Directorate of Legal Services",
    slug: "legal-services",
    desc: "Ensures all Bureau activities comply with national legislation, international conventions, and investigative standards such as ICAO Annex 13.",
    mandate: "To provide legal counsel, ensure regulatory compliance, and protect the Bureau's independence and integrity in all matters of law, policy, and international obligation.",
    functions: [
      "Legal interpretation of the NSIB Act and relevant transport safety legislation.",
      "Advisory services on ICAO Annex 13, IMO, and ERA investigative standards.",
      "Review and vetting of all investigation reports before publication.",
      "Management of Freedom of Information (FOI) requests and legal correspondence.",
      "Representation of the Bureau's interests in legal proceedings.",
    ],
    accent: "var(--nsib-red)",
    category: "Advisory",
  },
  {
    num: "04",
    name: "Finance & Accounts",
    label: "Directorate of Finance & Accounts",
    slug: "finance-accounts",
    desc: "Manages the Bureau's financial resources, budgetary planning, procurement, and expenditure accountability to public and international standards.",
    mandate: "To ensure sound financial stewardship, transparent accountability, and efficient allocation of resources in support of the Bureau's operational and strategic objectives.",
    functions: [
      "Budget preparation, monitoring, and performance reporting.",
      "Management of the Bureau's revenue, expenditure, and financial records.",
      "Procurement and contract management in accordance with public procurement law.",
      "Preparation of annual financial statements and audit coordination.",
      "Payroll administration and staff emoluments management.",
    ],
    accent: "var(--nsib-navy)",
    category: "Administrative",
  },
  {
    num: "05",
    name: "Public Affairs & Family Assistance",
    label: "Directorate of Public Affairs & Family Assistance",
    slug: "public-affairs-family-assistance",
    desc: "Coordinates media relations, public communications, and dedicated support programmes for families and communities affected by transport accidents.",
    mandate: "To manage the Bureau's public image, disseminate safety information, and provide compassionate, coordinated assistance to families impacted by transport accidents.",
    functions: [
      "Media relations, press briefings, and official communications during and after investigations.",
      "Coordination of family assistance programmes following major transport accidents.",
      "Production and dissemination of safety awareness materials and publications.",
      "Management of the Bureau's digital presence, website, and social media channels.",
      "Coordination of public outreach events and safety education campaigns.",
    ],
    accent: "var(--nsib-red)",
    category: "Administrative",
  },
  {
    num: "06",
    name: "Human Resources & Administration",
    label: "Directorate of Human Resources & Administration",
    slug: "human-resources-admin",
    desc: "Oversees personnel management, workforce development, staff welfare, and day-to-day administrative operations across the Bureau.",
    mandate: "To attract, develop, and retain a capable workforce, and to maintain efficient administrative systems that support the Bureau's operational effectiveness.",
    functions: [
      "Recruitment, onboarding, and staff placement across all directorates.",
      "Training, professional development, and capacity building programmes.",
      "Performance management and staff appraisal coordination.",
      "Staff welfare, discipline, and grievance resolution.",
      "Facilities management and day-to-day administrative operations.",
    ],
    accent: "var(--nsib-navy)",
    category: "Administrative",
  },
  {
    num: "07",
    name: "Corporate Services",
    label: "Directorate of Corporate Services",
    slug: "corporate-services",
    desc: "Coordinates cross-cutting support functions — ICT, facilities, records management — ensuring seamless operations across all directorates.",
    mandate: "To provide integrated support services — information technology, records management, and logistics — that underpin the Bureau's day-to-day and long-term operational capacity.",
    functions: [
      "Information and communication technology (ICT) infrastructure and support.",
      "Records management, archiving, and document control.",
      "Fleet and asset management for Bureau vehicles and equipment.",
      "Logistics coordination for field deployments and operational activities.",
      "Security and safety management for Bureau premises and personnel.",
    ],
    accent: "var(--nsib-red)",
    category: "Administrative",
  },
  {
    num: "08",
    name: "Special Duties",
    label: "Directorate of Special Duties",
    slug: "operations",
    desc: "Manages deployment logistics, field coordination, and rapid response readiness, ensuring investigators can reach accident sites without delay.",
    mandate: "To maintain the Bureau's operational readiness and coordinate the swift, effective deployment of investigative teams to accident sites across Nigeria's transport network.",
    functions: [
      "24/7 duty officer system for accident notification and initial response.",
      "Coordination of field deployment of Go-Teams and investigative personnel.",
      "Maintenance of investigative equipment and rapid-response kits.",
      "Liaison with transport operators, regulators, and emergency services during response.",
      "Operations centre management and real-time situational awareness.",
    ],
    accent: "var(--nsib-navy)",
    category: "Operational",
  },
];

export function findDirectorateBySlug(slug: string): Directorate | null {
  return directorates.find((d) => d.slug === slug) ?? null;
}
