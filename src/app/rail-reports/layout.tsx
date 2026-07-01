import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Railway Accident Reports",
  description:
    "Official NSIB railway safety investigation reports into accidents and serious incidents on Nigeria’s national rail network.",
  path: "/rail-reports",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
