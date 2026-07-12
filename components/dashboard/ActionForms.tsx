"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ActionResult } from "@/lib/actions/sites";
import { SubmitButton } from "./SubmitButton";

type FormAction = (
  prev: ActionResult | undefined,
  formData: FormData,
) => Promise<ActionResult>;

/**
 * Single-field "add something" form (new section, new project).
 * `action` is a server action pre-bound to its parent id.
 */
export function AddTitleForm({
  action,
  placeholder,
  buttonLabel,
}: {
  action: FormAction;
  placeholder: string;
  buttonLabel: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className="body-text">
      <div className="flex gap-3">
        <input
          name="title"
          required
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 bg-black border border-white/20 rounded-lg text-sm focus:outline-none focus:border-white/40"
        />
        <SubmitButton>{buttonLabel}</SubmitButton>
      </div>
      {state?.error && (
        <p className="mt-2 text-sm text-red-400">{state.error}</p>
      )}
    </form>
  );
}

/** Confirm-then-run wrapper for destructive bound server actions. */
export function DangerButton({
  action,
  confirmText,
  children,
  className,
}: {
  action: () => Promise<ActionResult>;
  confirmText: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmText)) return;
        startTransition(async () => {
          const result = await action();
          if (result?.error) window.alert(result.error);
          router.refresh();
        });
      }}
      className={
        className ??
        "px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg body-text text-xs transition-colors disabled:opacity-50"
      }
    >
      {pending ? "…" : children}
    </button>
  );
}

/** Up/down reorder buttons calling a bound server action. */
export function MoveButtons({
  action,
  isFirst,
  isLast,
}: {
  action: (direction: "up" | "down") => Promise<ActionResult>;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const move = (direction: "up" | "down") =>
    startTransition(async () => {
      await action(direction);
      router.refresh();
    });
  const base =
    "p-1.5 rounded-md bg-white/5 hover:bg-white/15 transition-colors disabled:opacity-30";
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        aria-label="Move up"
        disabled={pending || isFirst}
        onClick={() => move("up")}
        className={base}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Move down"
        disabled={pending || isLast}
        onClick={() => move("down")}
        className={base}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
    </div>
  );
}
