import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { SlotForm } from "@/components/admin/slot-form";

export default function AdminSlotNewPage() {
  return (
    <>
      <Link
        href="/admin/schedule"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-gold-600"
      >
        <ArrowLeft size={16} />
        練習スケジュール
      </Link>

      <h1 className="mt-5 text-xl text-navy-800">練習の枠を追加</h1>

      <div className="mt-8 rounded-card border border-border bg-white p-6 sm:p-8">
        <SlotForm />
      </div>
    </>
  );
}
