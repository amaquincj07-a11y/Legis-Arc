"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  CameraDocumentGuide,
  LEGAL_PAPER_LABEL,
} from "@/components/admin/document-scanner/camera-document-guide";
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-black text-white">
      <header className="flex shrink-0 items-center gap-2 px-3 py-2 sm:px-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-white hover:bg-white/10"
          onClick={onBack}
          disabled={processing}
          aria-label="Go back"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">Scan document</p>
          <p className="text-[11px] leading-snug text-white/70 sm:text-xs">
            Hold the phone close — align the page inside the dashed guide (
            {LEGAL_PAPER_LABEL})
          </p>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {error ? (
          <div className="flex h-full items-center justify-center p-4">
            <div className="max-w-sm rounded-2xl bg-white/10 p-5 text-center text-sm text-white/90">
              {error}
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 size-full object-cover"
            />
            {ready && !processing && <CameraDocumentGuide />}
            {processing && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/75">
                <Loader2 className="size-10 animate-spin text-white" />
                <p className="text-sm font-medium text-white">
                  Straightening document...
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-white/10 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-md flex-col items-center gap-2">
          <p className="text-center text-[10px] text-white/55 sm:text-[11px]">
            Fill the dashed frame with your document, then tap capture
          </p>
          <button
            type="button"
            disabled={!ready || Boolean(error) || processing}
            onClick={() => void capturePhoto()}
            className="flex size-16 items-center justify-center rounded-full border-4 border-white bg-white/10 transition hover:bg-white/20 disabled:opacity-40 sm:size-18"
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
