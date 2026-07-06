import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Press Release",
  description:
    "Latest news, announcements, safety alerts and press releases from the Nigerian Safety Investigation Bureau (NSIB).",
  path: "/news",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
