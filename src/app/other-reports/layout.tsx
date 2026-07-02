import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Other Accident Reports",
  description:
    "NSIB investigation reports covering accidents and occurrences beyond the aviation, maritime, and rail transport modes.",
  path: "/other-reports",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
