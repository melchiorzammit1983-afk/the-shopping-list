"use client";

import { useEffect, useRef, useState } from "react";
import type { IScannerControls } from "@zxing/browser";

type Props = {
  onDetected: (value: string) => void;
  onClose: () => void;
};

export function BarcodeScanner({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        if (!videoRef.current || cancelled) return;
        const reader = new BrowserMultiFormatReader();
        controlsRef.current = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result) => {
            if (!result || cancelled) return;
            controlsRef.current?.stop();
            onDetected(result.getText());
          }
        );
      } catch {
        if (!cancelled) setError("Camera access is unavailable. Enter the barcode instead.");
      }
    }

    void start();
    return () => {
      cancelled = true;
      controlsRef.current?.stop();
    };
  }, [onDetected]);

  return (
    <div className="rounded-3xl border border-linen-border bg-linen-card p-4">
      <video ref={videoRef} muted playsInline className="aspect-video w-full rounded-2xl bg-charcoal/10 object-cover" />
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      <button type="button" onClick={onClose} className="mt-3 text-sm font-medium text-charcoal-soft hover:text-charcoal">
        Close camera
      </button>
    </div>
  );
}
