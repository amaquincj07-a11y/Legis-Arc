import Image from "next/image";
import { AboutTermContent } from "./about-term-content";

export default function AboutPage() {
  return (
    <div className="min-h-[70vh]">
      {/* Hero Section */}
      <section className="relative">
        <Image
          src="/images/sb/Logo-Background.png"
          alt="Sangguniang Bayan of Panglao"
          width={1920}
          height={1080}
          priority
          className="w-full h-auto object-contain"
        />
        <div className="absolute inset-0 flex flex-col">
          {/* Title text — top half */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <h1
              className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white uppercase tracking-wide font-[family-name:var(--font-garamond)]"
              style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.7)" }}
            >
              Sangguniang Bayan
              <span className="block mt-2">Organizational Chart</span>
            </h1>
            <p
              className="mt-4 max-w-2xl text-base sm:text-xl lg:text-2xl text-white font-[family-name:var(--font-garamond)]"
              style={{ textShadow: "1px 1px 6px rgba(0,0,0,0.7)" }}
            >
              Elected and appointed members of the Sangguniang Bayan
            </p>
          </div>

          {/* Scrolling Member Photos — bottom half */}
          <div className="flex-1 flex items-center overflow-hidden">
            <div className="w-full overflow-hidden">
              <div className="flex animate-marquee gap-3 sm:gap-5">
                {[
                  "/images/sb/vm-delambaca.webp",
                  "/images/sb/delambaca.webp",
                  "/images/sb/caindec.webp",
                  "/images/sb/casane.webp",
                  "/images/sb/alcala.webp",
                  "/images/sb/bompat.webp",
                  "/images/sb/labaya.webp",
                  "/images/sb/fudolig.webp",
                  "/images/sb/mejos.webp",
                  "/images/sb/aranaydo.webp",
                  "/images/sb/mila.webp",
                  "/images/sb/apduhan.webp",
                  "/images/sb/vm-delambaca.webp",
                  "/images/sb/delambaca.webp",
                  "/images/sb/caindec.webp",
                  "/images/sb/casane.webp",
                  "/images/sb/alcala.webp",
                  "/images/sb/bompat.webp",
                  "/images/sb/labaya.webp",
                  "/images/sb/fudolig.webp",
                  "/images/sb/mejos.webp",
                  "/images/sb/aranaydo.webp",
                  "/images/sb/mila.webp",
                  "/images/sb/apduhan.webp",
                ].map((src, i) => (
                  <div
                    key={i}
                    className="shrink-0 h-[18vw] w-[18vw] sm:h-[14vw] sm:w-[14vw] lg:h-[10vw] lg:w-[10vw] rounded-full overflow-hidden border-2 sm:border-4 border-white/80 shadow-xl"
                  >
                    <Image
                      src={src}
                      alt="SB Member"
                      width={300}
                      height={300}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <AboutTermContent />
    </div>
  );
}
