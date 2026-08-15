"use client";

import { useEffect, useRef, useState } from "react";
import {
  BrowserMultiFormatReader,
  type IScannerControls,
} from "@zxing/browser";
import { DecodeHintType } from "@zxing/library";

type Props = {
  onDetected: (barcode: string) => void;
  onClose: () => void;
};

export function BarcodeScanner({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hints = new Map();
    hints.set(DecodeHintType.TRY_HARDER, true);
    const reader = new BrowserMultiFormatReader(hints);
    let controls: IScannerControls | undefined;
    let cancelled = false;
    let detected = false;

    reader
      .decodeFromConstraints(
        { video: { facingMode: "environment" } },
        videoRef.current ?? undefined,
        (result) => {
          if (cancelled || detected || !result) return;
          detected = true;
          onDetected(result.getText());
        }
      )
      .then((c) => {
        controls = c;
        if (cancelled) {
          controls.stop();
          return;
        }
        setReady(true);
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
      <div className="relative w-full max-w-sm overflow-hidden rounded-lg bg-black">
        {error ? (
          <p className="p-6 text-center text-sm text-white">{error}</p>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full"
              muted
              autoPlay
              playsInline
            />
            {!ready && (
              <p className="absolute inset-0 flex items-center justify-center text-sm text-white">
                Starting camera…
              </p>
            )}
            {ready && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-1/3 w-4/5 rounded-lg border-2 border-white/70" />
              </div>
            )}
          </>
        )}
      </div>
      {!error && (
        <p className="text-sm text-white/70">Point your camera at a barcode</p>
      )}
      <button
        onClick={onClose}
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
      >
        Cancel
      </button>
    </div>
  );
}
