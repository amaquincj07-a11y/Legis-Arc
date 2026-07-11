"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { correctDocumentPerspective } from "@/lib/document-scanner/perspective-correction";

type CameraCaptureStepProps = {
  onBack: () => void;
  onCapture: (dataUrl: string) => void;
};

export function CameraCaptureStep({ onBack, onCapture }: CameraCaptureStepProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch {
        setError(
          "Unable to access the camera. Allow camera permission or use Upload PDF instead."
        );
      }
    }

    void startCamera();

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  async function capturePhoto() {
    const video = videoRef.current;
    if (!video || !ready || processing) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const rawDataUrl = canvas.toDataURL("image/jpeg", 0.92);

    streamRef.current?.getTracks().forEach((track) => track.stop());
    setProcessing(true);

    try {
      const corrected = await correctDocumentPerspective(rawDataUrl);
      const perspectiveApplied = corrected !== rawDataUrl;
      onCapture(corrected);
      toast.success(
        perspectiveApplied
          ? "Photo captured and perspective corrected"
          : "Photo captured"
      );
    } catch {
      onCapture(rawDataUrl);
      toast.success("Photo captured");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-black text-white">
      <header className="flex items-center gap-3 px-4 py-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={onBack}
          disabled={processing}
          aria-label="Go back"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <p className="text-sm font-semibold">Scan document</p>
          <p className="text-xs text-white/70">
            Align the page inside the frame — perspective auto-corrects on capture
          </p>
        </div>
      </header>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-6">
        {error ? (
          <div className="max-w-sm rounded-2xl bg-white/10 p-5 text-center text-sm text-white/90">
            {error}
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="max-h-full w-full rounded-2xl object-contain"
            />
            <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
            {processing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-black/70">
                <Loader2 className="size-10 animate-spin text-[#2dd4bf]" />
                <p className="text-sm font-medium text-white">
                  Straightening document...
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="border-t border-white/10 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-md items-center justify-center">
          <button
            type="button"
            disabled={!ready || Boolean(error) || processing}
            onClick={() => void capturePhoto()}
            className="flex size-18 items-center justify-center rounded-full border-4 border-white bg-white/10 transition hover:bg-white/20 disabled:opacity-40"
            aria-label="Capture photo"
          >
            {processing ? (
              <Loader2 className="size-7 animate-spin" />
            ) : (
              <Camera className="size-7" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
