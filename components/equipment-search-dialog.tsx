"use client";

import type { Machine } from "@/components/machine-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getMachineDetailUrlWithoutLocale } from "@/lib/machine-url-helper";
import { Loader2, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const MACHINE_IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_MACHINE_IMAGE_BASE_URL ||
  process.env.MACHINE_IMAGE_BASE_URL ||
  "https://kimberrubblstg.blob.core.windows.net";

export interface EquipmentSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getFirstImageUrl(machine: Machine | null): string | undefined {
  if (!machine) return undefined;
  const imageSourceArray: string[] | undefined = (machine as any).thumbnails
    ?.length
    ? (machine as any).thumbnails
    : (machine as any).images;
  if (!imageSourceArray || imageSourceArray.length === 0) return undefined;
  for (const path of imageSourceArray) {
    if (typeof path !== "string") continue;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const corrected = path.startsWith("/") ? path : `/${path}`;
    return `${MACHINE_IMAGE_BASE_URL}${corrected}`;
  }
  return undefined;
}

export default function EquipmentSearchDialog({
  open,
  onOpenChange,
}: EquipmentSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      // Focus the input when dialog opens
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setMachines([]);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    const controller = new AbortController();
    const q = query.trim();
    if (!open || q.length < 2) {
      setMachines([]);
      setLoading(false);
      setError(null);
      return () => controller.abort();
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/api/machine/nearby?q=${encodeURIComponent(
            q
          )}&limit=12&rentalsOnly=true`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );
        if (!res.ok) {
          setMachines([]);
          setError("Search failed");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setMachines(Array.isArray(data.machines) ? data.machines : []);
      } catch (err) {
        if ((err as any)?.name !== "AbortError") {
          setError("Network error");
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Search Equipment</DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              ref={inputRef}
              value={query}
              placeholder="Search equipment available in Lafayette..."
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="min-h-[220px]">
            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Searching…
              </div>
            )}
            {!loading && error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
            {!loading && !error && query.trim() && machines.length === 0 && (
              <div className="text-sm text-gray-600">
                No results yet. Try a different term.
              </div>
            )}

            {machines.length > 0 && (
              <ul className="divide-y divide-gray-200">
                {machines.map((m) => {
                  const imageUrl = getFirstImageUrl(m);
                  const name = `${m.year ? m.year + " " : ""}${m.make ?? ""} ${
                    m.model ?? m.displayName ?? ""
                  }`.trim();
                  const href = getMachineDetailUrlWithoutLocale(m);
                  return (
                    <li key={m.id}>
                      <Link
                        href={href}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-16 h-12 relative flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={name || m.primaryType}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {name || m.primaryType}
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {m.primaryType}
                            {m.location?.city
                              ? ` • ${m.location.city}, ${
                                  m.location.state ?? ""
                                }`
                              : ""}
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
