"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ActionResult } from "@/lib/actions/sites";

const MAX_DIMENSION = 2000;

/** Downscale in the browser so nobody uploads a 40 MB TIFF-sized PNG. */
async function downscale(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
    );
    if (scale === 1 && file.size < 4 * 1024 * 1024) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob>((resolve) =>
      canvas.toBlob((blob) => resolve(blob ?? file), "image/webp", 0.85),
    );
  } catch {
    return file;
  }
}

interface ImageUploaderProps {
  siteId: string;
  /** Server action to register the uploaded object, pre-bound upstream. */
  registerAction: (storagePath: string) => Promise<ActionResult>;
  label?: string;
  multiple?: boolean;
}

export function ImageUploader({
  siteId,
  registerAction,
  label = "Upload images",
  multiple = true,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    startTransition(async () => {
      const supabase = createClient();
      const list = Array.from(files);
      for (let i = 0; i < list.length; i++) {
        setProgress(
          list.length > 1 ? `Uploading ${i + 1} of ${list.length}…` : "Uploading…",
        );
        const file = list[i];
        if (!file.type.startsWith("image/")) continue;

        const blob = await downscale(file);
        const isWebp = blob !== file;
        const ext = isWebp ? "webp" : (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${siteId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("site-assets")
          .upload(path, blob, {
            contentType: isWebp ? "image/webp" : file.type,
            cacheControl: "31536000",
          });
        if (uploadError) {
          setError(uploadError.message);
          break;
        }

        const result = await registerAction(path);
        if (result?.error) {
          setError(result.error);
          break;
        }
      }
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    });
  }

  return (
    <div className="body-text">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-lg border border-dashed border-white/25 px-4 py-6 text-sm text-white/60 hover:border-white/50 hover:text-white/90 transition-colors disabled:opacity-50"
      >
        {progress ?? label}
      </button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
