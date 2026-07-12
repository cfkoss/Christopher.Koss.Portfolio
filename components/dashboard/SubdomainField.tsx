"use client";

import { useEffect, useState } from "react";
import { checkSubdomain } from "@/lib/actions/sites";

interface SubdomainFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Current value that should always count as available (settings form). */
  currentValue?: string;
  onAvailability?: (available: boolean) => void;
}

export function SubdomainField({
  value,
  onChange,
  currentValue,
  onAvailability,
}: SubdomainFieldProps) {
  const [status, setStatus] = useState<
    { state: "idle" } | { state: "checking" } | { state: "ok" } | { state: "bad"; reason: string }
  >({ state: "idle" });

  useEffect(() => {
    const sub = value.trim().toLowerCase();
    const isIdle = !sub || sub === currentValue;
    const timer = setTimeout(
      async () => {
        if (isIdle) {
          setStatus({ state: "idle" });
          onAvailability?.(true);
          return;
        }
        setStatus({ state: "checking" });
        onAvailability?.(false);
        const result = await checkSubdomain(sub);
        if (result.available) {
          setStatus({ state: "ok" });
          onAvailability?.(true);
        } else {
          setStatus({ state: "bad", reason: result.reason ?? "Not available." });
          onAvailability?.(false);
        }
      },
      isIdle ? 0 : 450,
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, currentValue]);

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "yourdomain.com";

  return (
    <div className="body-text">
      <div className="flex items-center rounded-lg border border-white/20 bg-black focus-within:border-white/40">
        <input
          name="subdomain"
          value={value}
          onChange={(e) =>
            onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
          }
          placeholder="your-name"
          className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none"
        />
        <span className="pr-4 text-sm text-white/40">.{rootDomain}</span>
      </div>
      <p className="mt-2 min-h-5 text-xs">
        {status.state === "checking" && (
          <span className="text-white/40">Checking availability…</span>
        )}
        {status.state === "ok" && (
          <span className="text-emerald-400">Available</span>
        )}
        {status.state === "bad" && (
          <span className="text-red-400">{status.reason}</span>
        )}
      </p>
    </div>
  );
}
