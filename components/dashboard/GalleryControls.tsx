"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/actions/sites";

/** "Make cover" + "Remove" controls under each gallery image. */
export function GalleryControls({
  isCover,
  setCoverAction,
  deleteAction,
}: {
  isCover: boolean;
  setCoverAction: () => Promise<ActionResult>;
  deleteAction: () => Promise<ActionResult>;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const run = (action: () => Promise<ActionResult>, confirmMsg?: string) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    startTransition(async () => {
      const result = await action();
      if (result?.error) window.alert(result.error);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2 mt-2 body-text">
      {isCover ? (
        <span className="px-2.5 py-1 rounded-md bg-emerald-400/15 text-emerald-300 text-xs">
          Cover
        </span>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(setCoverAction)}
          className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/15 text-xs transition-colors disabled:opacity-50"
        >
          Make cover
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => run(deleteAction, "Remove this image?")}
        className="px-2.5 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  );
}
