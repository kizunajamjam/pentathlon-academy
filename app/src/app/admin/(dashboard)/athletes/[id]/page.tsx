import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AthleteForm } from "@/components/admin/athlete-form";
import { SubmitButton } from "@/components/admin/form-ui";
import { getAthlete } from "@/lib/db/athletes";
import { removeAthlete } from "../actions";

export default async function AdminAthleteEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getAthlete(id);
  if (!item) notFound();

  return (
    <>
      <Link
        href="/admin/athletes"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-gold-600"
      >
        <ArrowLeft size={16} />
        強化選手一覧
      </Link>

      <h1 className="mt-5 text-xl text-navy-800">強化選手を編集</h1>

      <div className="mt-8 rounded-card border border-border bg-white p-6 sm:p-8">
        <AthleteForm athlete={item} />
      </div>

      <div className="mt-8 rounded-card border border-shoot-500/25 bg-white p-6">
        <p className="text-sm font-bold text-navy-800">この登録を削除</p>
        <p className="mt-1.5 text-xs text-muted">
          削除すると元に戻せません。一時的に隠したいときは「サイトに公開する」を外してください。
        </p>
        <form action={removeAthlete} className="mt-4">
          <input type="hidden" name="id" value={item.id} />
          <SubmitButton variant="danger" pendingLabel="削除中...">
            削除する
          </SubmitButton>
        </form>
      </div>
    </>
  );
}
