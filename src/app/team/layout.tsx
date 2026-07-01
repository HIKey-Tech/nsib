import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Management Team",
  description:
    "Meet the Director General and management team leading the Nigerian Safety Investigation Bureau (NSIB).",
  path: "/team",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
