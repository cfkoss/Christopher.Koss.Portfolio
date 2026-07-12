"use client";

import { useTransition } from "react";
import type { ActionResult } from "@/lib/actions/sites";

export function DeleteSiteButton({
  siteName,
  action,
}: {
  siteName: string;
  action: () => Promise<ActionResult>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const typed = window.prompt(
          `Type "${siteName}" to permanently delete this site:`,
        );
        if (typed !== siteName) return;
        startTransition(async () => {
          const result = await action();
          if (result?.error) window.alert(result.error);
        });
      }}
      className="px-5 py-2.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 rounded-lg body-text text-sm transition-colors disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete this site"}
    </button>
  );
}
