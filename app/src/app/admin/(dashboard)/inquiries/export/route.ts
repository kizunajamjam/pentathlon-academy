import { getStaffForAction } from "@/lib/auth-guard";
import { listInquiries } from "@/lib/db/inquiries";
import { inquiriesToCsv } from "@/lib/analytics/inquiries";

// ダッシュボードのレイアウトは Route Handler を通らないため、ここで自前で権限を確認する。
export const dynamic = "force-dynamic";

export async function GET() {
  const staff = await getStaffForAction();
  if (!staff) return new Response("Unauthorized", { status: 401 });

  const csv = inquiriesToCsv(await listInquiries());
  const today = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inquiries-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
