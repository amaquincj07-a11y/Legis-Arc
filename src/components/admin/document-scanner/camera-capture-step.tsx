"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { CameraDetectionOverlay } from "@/components/admin/document-scanner/camera-detection-overlay";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { correctDocumentPerspective } from "@/lib/document-scanner/perspective-correction";
import type { ScanPoint } from "@/lib/document-scanner/types";

type CameraCaptureStepProps = {
  onBack: () => void;
  onCapture: (dataUrl: string) => void;
};

export function CameraCaptureStep({ onBack, onCapture }: CameraCaptureStepProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectedCornersRef = useRef<ScanPoint[] | null>(null);
  const [ready, setReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [detected, setDetected] = useState(false);
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
      const corners = detectedCornersRef.current;
      const corrected = await correctDocumentPerspective(rawDataUrl, corners);
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-black text-white">
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
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Scan document</p>
          <p
            className={cn(
              "text-xs",
              detected ? "text-[#2dd4bf]" : "text-amber-300"
            )}
          >
            {detected
              ? "Document detected — ready to capture"
              : "Align all four corners inside the frame"}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
            detected
              ? "bg-[#2dd4bf]/20 text-[#2dd4bf]"
              : "bg-amber-400/20 text-amber-300"
          )}
        >
          {detected ? "Detected" : "Searching"}
        </span>
      </header>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-6">
        {error ? (
          <div className="max-w-sm rounded-2xl bg-white/10 p-5 text-center text-sm text-white/90">
            {error}
          </div>
        ) : (
          <div className="relative w-full max-w-3xl">
            <video
              ref={videoRef}
              playsInline
              muted
              className="max-h-[62dvh] w-full rounded-2xl object-contain"
            />
            <CameraDetectionOverlay
              videoRef={videoRef}
              onDetectedChange={setDetected}
              onCornersChange={(corners) => {
                detectedCornersRef.current = corners;
              }}
              enabled={ready && !processing && !error}
            />
            {!detected && ready && !processing && (
              <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-dashed border-white/50" />
            )}
            {processing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-black/70">
                <Loader2 className="size-10 animate-spin text-[#2dd4bf]" />
                <p className="text-sm font-medium text-white">
                  Straightening document...
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-white/10 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3">
          <p className="text-center text-[11px] text-white/60">
            Drag crop edges and corners after capture to fine-tune the document bounds
          </p>
          <button
            type="button"
            disabled={!ready || Boolean(error) || processing}
            onClick={() => void capturePhoto()}
            className={cn(
              "flex size-18 items-center justify-center rounded-full border-4 bg-white/10 transition hover:bg-white/20 disabled:opacity-40",
              detected ? "border-[#2dd4bf]" : "border-white"
            )}
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
