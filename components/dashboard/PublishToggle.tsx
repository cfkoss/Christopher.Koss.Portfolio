"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setSitePublished } from "@/lib/actions/sites";

export function PublishToggle({
  siteId,
  isPublished,
}: {
  siteId: string;
  isPublished: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await setSitePublished(siteId, !isPublished);
          if (result?.error) window.alert(result.error);
          router.refresh();
        })
      }
      className={`px-5 py-2.5 rounded-full body-text text-sm font-medium transition-colors disabled:opacity-50 ${
        isPublished
          ? "bg-white/10 border border-white/20 hover:bg-white/20"
          : "bg-emerald-400 text-black hover:bg-emerald-300"
      }`}
    >
      {pending ? "Working…" : isPublished ? "Unpublish" : "Publish site"}
    </button>
  );
}
