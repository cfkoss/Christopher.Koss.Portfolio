"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        "px-5 py-2.5 bg-white text-black rounded-lg body-text text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
      }
    >
      {pending ? "Saving…" : children}
    </button>
  );
}
