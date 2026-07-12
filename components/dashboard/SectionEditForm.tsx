"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/lib/actions/sites";
import { SubmitButton } from "./SubmitButton";

interface SectionEditFormProps {
  action: (
    prev: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
  defaults: { title: string; description: string; icon: string };
  iconOptions: string[];
}

export function SectionEditForm({
  action,
  defaults,
  iconOptions,
}: SectionEditFormProps) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-5 body-text max-w-lg">
      <div>
        <label htmlFor="title" className="block text-sm text-white/70 mb-2">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={defaults.title}
          className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-sm focus:outline-none focus:border-white/40"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm text-white/70 mb-2">
          Description
        </label>
        <input
          id="description"
          name="description"
          defaultValue={defaults.description}
          placeholder="Spatial design & structural innovation"
          className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-sm focus:outline-none focus:border-white/40"
        />
      </div>
      <div>
        <label htmlFor="icon" className="block text-sm text-white/70 mb-2">
          Icon
        </label>
        <select
          id="icon"
          name="icon"
          defaultValue={defaults.icon}
          className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-sm focus:outline-none focus:border-white/40"
        >
          {iconOptions.map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </select>
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-400">Saved.</p>}
      <SubmitButton>Save section</SubmitButton>
    </form>
  );
}
