import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Contact Us",
  description:
    "Reach the Nigerian Safety Investigation Bureau (NSIB). Headquarters at Nnamdi Azikiwe International Airport, Abuja. Call +234 807 709 0908 / +234 807 709 0909 or email info@nsib.gov.ng.",
  path: "/contact-us",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
