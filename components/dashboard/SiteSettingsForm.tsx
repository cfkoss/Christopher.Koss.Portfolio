"use client";

import { useActionState, useState } from "react";
import type { ActionResult } from "@/lib/actions/sites";
import { SubdomainField } from "./SubdomainField";
import { SubmitButton } from "./SubmitButton";

interface SiteSettingsFormProps {
  action: (
    prev: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
  defaults: {
    name: string;
    tagline: string;
    heroTitle: string;
    subdomain: string;
  };
}

export function SiteSettingsForm({ action, defaults }: SiteSettingsFormProps) {
  const [state, formAction] = useActionState(action, undefined);
  const [subdomain, setSubdomain] = useState(defaults.subdomain);

  return (
    <form action={formAction} className="space-y-5 body-text max-w-lg">
      <div>
        <label htmlFor="name" className="block text-sm text-white/70 mb-2">
          Site name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={defaults.name}
          className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-sm focus:outline-none focus:border-white/40"
        />
      </div>
      <div>
        <label htmlFor="heroTitle" className="block text-sm text-white/70 mb-2">
          Hero title
        </label>
        <textarea
          id="heroTitle"
          name="heroTitle"
          rows={2}
          defaultValue={defaults.heroTitle}
          placeholder={"Selected\nWorks"}
          className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-sm focus:outline-none focus:border-white/40 resize-none"
        />
        <p className="mt-1 text-xs text-white/40">
          Line breaks are kept — two short lines look best.
        </p>
      </div>
      <div>
        <label htmlFor="tagline" className="block text-sm text-white/70 mb-2">
          Tagline
        </label>
        <input
          id="tagline"
          name="tagline"
          defaultValue={defaults.tagline}
          placeholder="A curated collection of selected works"
          className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-sm focus:outline-none focus:border-white/40"
        />
      </div>
      <div>
        <label className="block text-sm text-white/70 mb-2">Address</label>
        <SubdomainField
          value={subdomain}
          onChange={setSubdomain}
          currentValue={defaults.subdomain}
        />
        <p className="text-xs text-amber-300/80">
          Changing your address breaks existing links to your site.
        </p>
      </div>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-emerald-400">Saved.</p>
      )}
      <SubmitButton>Save settings</SubmitButton>
    </form>
  );
}
