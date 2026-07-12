"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/lib/actions/sites";
import { SubmitButton } from "./SubmitButton";

interface ProjectEditFormProps {
  action: (
    prev: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
  defaults: {
    title: string;
    description: string;
    body: string;
    tags: string;
  };
}

export function ProjectEditForm({ action, defaults }: ProjectEditFormProps) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-5 body-text">
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
          Short description
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={defaults.description}
          placeholder="One or two sentences shown on the project card."
          className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-sm focus:outline-none focus:border-white/40 resize-none"
        />
      </div>
      <div>
        <label htmlFor="body" className="block text-sm text-white/70 mb-2">
          Full write-up
        </label>
        <textarea
          id="body"
          name="body"
          rows={10}
          defaultValue={defaults.body}
          placeholder="The story of the project — brief, process, outcome. Blank lines create paragraphs."
          className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-sm focus:outline-none focus:border-white/40"
        />
      </div>
      <div>
        <label htmlFor="tags" className="block text-sm text-white/70 mb-2">
          Tags
        </label>
        <input
          id="tags"
          name="tags"
          defaultValue={defaults.tags}
          placeholder="Residential, Concrete, 2025"
          className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-sm focus:outline-none focus:border-white/40"
        />
        <p className="mt-1 text-xs text-white/40">Comma-separated.</p>
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-400">Saved.</p>}
      <SubmitButton>Save project</SubmitButton>
    </form>
  );
}
