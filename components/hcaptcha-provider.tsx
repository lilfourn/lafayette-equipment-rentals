"use client";

import type HCaptchaType from "@hcaptcha/react-hcaptcha";
import dynamic from "next/dynamic";
import { createContext, useContext, useRef } from "react";

// Dynamically import HCaptcha to avoid SSR issues
const HCaptcha = dynamic(() => import("@hcaptcha/react-hcaptcha"), {
  ssr: false,
});

interface HCaptchaContextType {
  siteKey: string | undefined;
}

const HCaptchaContext = createContext<HCaptchaContextType>({
  siteKey: undefined,
});

export const useHCaptcha = () => useContext(HCaptchaContext);

interface HCaptchaProviderProps {
  children: React.ReactNode;
}

export default function HCaptchaProvider({ children }: HCaptchaProviderProps) {
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  if (!siteKey) {
    console.warn("hCaptcha site key not found. hCaptcha will be disabled.");
    return <>{children}</>;
  }

  return (
    <HCaptchaContext.Provider value={{ siteKey }}>
      {children}
    </HCaptchaContext.Provider>
  );
}

// Reusable HCaptcha Component
interface HCaptchaComponentProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: string) => void;
  size?: "normal" | "compact" | "invisible";
  theme?: "light" | "dark";
}

export function HCaptchaComponent({
  onVerify,
  onExpire,
  onError,
  size = "normal",
  theme = "light",
}: HCaptchaComponentProps) {
  const { siteKey } = useHCaptcha();
  const captchaRef = useRef<HCaptchaType>(null);

  if (!siteKey) {
    return null;
  }

  const handleVerify = (token: string) => {
    onVerify(token);
  };

  const handleExpire = () => {
    if (onExpire) {
      onExpire();
    }
  };

  const handleError = (error: string) => {
    console.error("hCaptcha error:", error);
    if (onError) {
      onError(error);
    }
  };

  return (
    <HCaptcha
      sitekey={siteKey}
      onVerify={handleVerify}
      onExpire={handleExpire}
      onError={handleError}
      size={size}
      theme={theme}
    />
  );
}

// Export the ref type for components that need direct access
export type HCaptchaRef = HCaptchaType;
