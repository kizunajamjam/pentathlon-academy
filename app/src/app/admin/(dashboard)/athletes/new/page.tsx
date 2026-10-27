import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AthleteForm } from "@/components/admin/athlete-form";
import { requireStaff } from "@/lib/auth-guard";

export default async function AdminAthleteNewPage() {
  // 画面遷移ではレイアウトの確認が動かないため、ページでも確かめる
  await requireStaff();
  return (
    <>
      <Link
        href="/admin/athletes"
        className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm text-muted transition-colors hover:text-gold-600"
      >
        <ArrowLeft size={16} />
        強化選手一覧
      </Link>

      <h1 className="mt-5 text-xl text-navy-800">強化選手を追加</h1>

      <div className="mt-8 rounded-card border border-border bg-white p-6 sm:p-8">
        <AthleteForm />
      </div>
    </>
  );
}
