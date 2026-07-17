"use client";

/** Static notice for certified copies (public document detail pages). */
export function CertifiedCopyNotice() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold text-foreground">
        Request Certified Copy
      </p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        Certified copies require an official signature and seal and cannot be
        issued through this platform. Please visit the Sangguniang Bayan Office
        to process your request.
      </p>
    </div>
  );
}
