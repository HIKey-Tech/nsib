import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Marine Accident Reports",
  description:
    "Official NSIB marine safety investigation reports into casualties and incidents in Nigerian territorial waters, in line with the IMO Casualty Investigation Code.",
  path: "/marine-reports",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
