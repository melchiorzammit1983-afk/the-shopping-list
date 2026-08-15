"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";

type Props = {
  onDetected: (barcode: string) => void;
  onClose: () => void;
};

export function BarcodeScanner({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    let controls: IScannerControls | undefined;
    let cancelled = false;
    let detected = false;

    reader
      .decodeFromVideoDevice(
        undefined,
        videoRef.current ?? undefined,
        (result) => {
          if (cancelled || detected || !result) return;
          detected = true;
          onDetected(result.getText());
        }
      )
      .then((c) => {
        controls = c;
        if (cancelled) controls.stop();
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Couldn't access camera");
      });

    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/80 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-lg bg-black">
        {error ? (
          <p className="p-6 text-center text-sm text-white">{error}</p>
        ) : (
          <video ref={videoRef} className="w-full" muted playsInline />
        )}
      </div>
      <button
        onClick={onClose}
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
      >
        Cancel
      </button>
    </div>
  );
}
