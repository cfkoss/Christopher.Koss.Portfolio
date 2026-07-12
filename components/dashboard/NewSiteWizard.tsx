"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createSite } from "@/lib/actions/sites";
import { SubdomainField } from "./SubdomainField";

export interface WizardTemplate {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priceMonthlyCents: number;
  thumbnail: string | null;
}

export function NewSiteWizard({
  templates,
  initialTemplateId = null,
}: {
  templates: WizardTemplate[];
  initialTemplateId?: string | null;
}) {
  const [step, setStep] = useState(0);
  const [templateId, setTemplateId] = useState<string | null>(
    initialTemplateId ?? (templates.length === 1 ? templates[0].id : null),
  );
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [subdomainOk, setSubdomainOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selected = templates.find((t) => t.id === templateId);

  function create() {
    if (!templateId) return;
    setError(null);
    startTransition(async () => {
      const result = await createSite({ templateId, name, subdomain });
      if (result?.error) setError(result.error);
      // On success the action redirects to the new site's dashboard.
    });
  }

  return (
    <div className="max-w-3xl">
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-10 body-text text-xs text-white/50">
        {["Template", "Details", "Create"].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px bg-white/15" />}
            <span
              className={`px-3 py-1.5 rounded-full border ${
                i === step
                  ? "border-white text-white"
                  : i < step
                    ? "border-emerald-400/50 text-emerald-300"
                    : "border-white/15"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {step === 0 && (
        <div>
          <h2 className="hero-title text-3xl mb-6">Choose a template</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`rounded-xl border p-4 transition-colors ${
                  templateId === template.id
                    ? "border-white bg-white/5"
                    : "border-white/15 hover:border-white/40"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setTemplateId(template.id)}
                  className="block w-full text-left"
                >
                  {template.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full aspect-video object-cover rounded-lg mb-4 border border-white/10"
                    />
                  )}
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="hero-title text-xl">{template.name}</h3>
                    <span className="body-text text-xs text-white/50 whitespace-nowrap">
                      ${(template.priceMonthlyCents / 100).toFixed(0)}/mo
                    </span>
                  </div>
                  {template.description && (
                    <p className="body-text text-sm text-white/60 mt-2 line-clamp-3">
                      {template.description}
                    </p>
                  )}
                </button>
                <Link
                  href={`/preview/${template.slug}`}
                  target="_blank"
                  className="body-text text-xs text-white/60 underline underline-offset-4 hover:text-white mt-3 inline-block"
                >
                  Open live preview ↗
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              disabled={!templateId}
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-white text-black rounded-lg body-text text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="max-w-md">
          <h2 className="hero-title text-3xl mb-6">Name your site</h2>
          <div className="space-y-5 body-text">
            <div>
              <label htmlFor="site-name" className="block text-sm text-white/70 mb-2">
                Site name
              </label>
              <input
                id="site-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name or studio"
                className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg text-sm focus:outline-none focus:border-white/40"
              />
              <p className="mt-2 text-xs text-white/40">
                Shown in the navigation and the browser tab.
              </p>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">
                Your address
              </label>
              <SubdomainField
                value={subdomain}
                onChange={setSubdomain}
                onAvailability={setSubdomainOk}
              />
            </div>
          </div>
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="px-6 py-3 bg-white/10 rounded-lg body-text text-sm hover:bg-white/20 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!name.trim() || !subdomain || !subdomainOk}
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-white text-black rounded-lg body-text text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 2 && selected && (
        <div className="max-w-md">
          <h2 className="hero-title text-3xl mb-6">Ready to create</h2>
          <dl className="body-text text-sm space-y-3 rounded-xl border border-white/15 p-6">
            <div className="flex justify-between">
              <dt className="text-white/50">Template</dt>
              <dd>{selected.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/50">Site name</dt>
              <dd>{name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/50">Address</dt>
              <dd>
                {subdomain}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/50">Price</dt>
              <dd>
                Free during beta{" "}
                <span className="text-white/40">
                  (then ${(selected.priceMonthlyCents / 100).toFixed(0)}/mo)
                </span>
              </dd>
            </div>
          </dl>
          {error && (
            <p className="mt-4 text-sm text-red-400 body-text">{error}</p>
          )}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-white/10 rounded-lg body-text text-sm hover:bg-white/20 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={create}
              className="px-6 py-3 bg-emerald-400 text-black rounded-lg body-text text-sm font-medium hover:bg-emerald-300 transition-colors disabled:opacity-50"
            >
              {pending ? "Creating…" : "Create my site"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
