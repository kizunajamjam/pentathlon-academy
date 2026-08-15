import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { SlotForm } from "@/components/admin/slot-form";
import { SubmitButton } from "@/components/admin/form-ui";
import { listAllSlots } from "@/lib/db/schedule";
import { removeSlot } from "../actions";

export default async function AdminSlotEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // 枠は多くても数十件なので、1件取得を別に用意せず一覧から引く。
  const slot = (await listAllSlots()).find((s) => s.id === id);
  if (!slot) notFound();

  return (
    <>
      <Link
        href="/admin/schedule"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-gold-600"
      >
        <ArrowLeft size={16} />
        練習スケジュール
      </Link>

      <h1 className="mt-5 text-xl text-navy-800">練習の枠を編集</h1>

      <div className="mt-8 rounded-card border border-border bg-white p-6 sm:p-8">
        <SlotForm slot={slot} />
      </div>

      <div className="mt-8 rounded-card border border-shoot-500/25 bg-white p-6">
        <p className="text-sm font-bold text-navy-800">この枠を削除</p>
        <p className="mt-1.5 text-xs text-muted">
          一時的に休止するだけなら、削除せず「サイトに表示する」のチェックを外してください。
        </p>
        <form action={removeSlot} className="mt-4">
          <input type="hidden" name="id" value={slot.id} />
          <SubmitButton variant="danger" pendingLabel="削除中...">
            削除する
          </SubmitButton>
        </form>
      </div>
    </>
  );
}
