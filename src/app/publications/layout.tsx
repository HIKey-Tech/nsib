import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Publications & Reports",
  description:
    "Browse NSIB’s public archive of preliminary and final accident investigation reports, safety bulletins and recommendations across aviation, maritime and railway sectors.",
  path: "/publications",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
