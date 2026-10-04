import type { Metadata } from "next";
import PortfolioAdminApp from "@/components/portfolio/admin/PortfolioAdminApp";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "포트폴리오 관리",
  robots: { index: false, follow: false },
};

export default function PortfolioAdminPage() {
  return (
    <PortfolioAdminApp
      supabaseUrl={process.env.SUPABASE_URL ?? ""}
      publishableKey={process.env.SUPABASE_PUBLISHABLE_KEY ?? ""}
    />
  );
}
