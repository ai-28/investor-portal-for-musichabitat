import { AdminInvestorDetailClient } from "@/admin/AdminInvestorDetailClient";

export default function AdminInvestorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <AdminInvestorDetailClient params={params} />;
}
