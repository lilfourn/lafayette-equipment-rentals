"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load HCaptcha only when form is interacted with
const HCaptchaComponent = dynamic(
  () => import("@/components/hcaptcha-provider").then(mod => mod.HCaptchaComponent),
  {
    loading: () => (
      <div className="flex justify-center my-4">
        <Skeleton className="h-20 w-80 rounded-lg" />
      </div>
    ),
    ssr: false // HCaptcha should only load on client
  }
);

interface LazyHCaptchaProps {
  onVerify: (token: string) => void;
  onExpire: () => void;
  theme?: "light" | "dark";
  shouldLoad?: boolean;
}

export function LazyHCaptcha({ 
  onVerify, 
  onExpire, 
  theme = "light",
  shouldLoad = false 
}: LazyHCaptchaProps) {
  if (!shouldLoad) {
    return (
      <div className="flex justify-center my-4">
        <div className="h-20 w-80 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-sm">
          Complete form to load verification
        </div>
      </div>
    );
  }

  return (
    <HCaptchaComponent
      onVerify={onVerify}
      onExpire={onExpire}
      theme={theme}
    />
  );
}