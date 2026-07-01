import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Aviation Accident Reports",
  description:
    "Official NSIB aviation safety investigation reports into civil aircraft accidents and serious incidents within Nigerian airspace, in line with ICAO Annex 13.",
  path: "/air-reports",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
