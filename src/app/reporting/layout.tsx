import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Report an Accident or Incident",
  description:
    "Report an aviation, maritime or railway accident or serious incident to the Nigerian Safety Investigation Bureau (NSIB) through the secure reporting portal.",
  path: "/reporting",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
