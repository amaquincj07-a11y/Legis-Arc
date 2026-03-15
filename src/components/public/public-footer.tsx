import Link from "next/link";
import { Landmark, Phone, Mail, Clock, MapPin } from "lucide-react";
import { PUBLIC_NAV_ITEMS } from "@/lib/constants";

export function PublicFooter() {
  return (
    <footer className="relative mt-auto">
      {/* Gold accent line */}
      <div className="h-1 bg-linear-to-r from-gold via-gold-light to-gold" />

      <div className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3">
            {/* Column 1: Branding */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                  <Landmark className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="font-bold leading-tight tracking-tight">
                    Sangguniang Bayan ng Panglao
                  </p>
                  <p className="text-xs text-white/50">
                    Municipality of Panglao, Bohol
                  </p>
                </div>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-white/60">
                Promoting transparency and good governance through accessible
                legislative records. Browse ordinances, resolutions, and session
                minutes of the Sangguniang Bayan.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
                Quick Links
              </h3>
              <nav className="flex flex-col gap-2.5">
                {PUBLIC_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm text-white/60 transition-colors hover:text-gold"
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Column 3: Contact */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
                Contact Us
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 text-white/60">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold/70" />
                  <span>
                    Municipal Building, Poblacion,
                    <br />
                    Panglao, Bohol 6340
                  </span>
                </div>
                <div className="flex items-center gap-3 text-white/60">
                  <Phone className="h-4 w-4 shrink-0 text-gold/70" />
                  <span>(038) 502-XXXX</span>
                </div>
                <div className="flex items-center gap-3 text-white/60">
                  <Mail className="h-4 w-4 shrink-0 text-gold/70" />
                  <a
                    href="mailto:sb@panglao.gov.ph"
                    className="transition-colors hover:text-gold"
                  >
                    sb@panglao.gov.ph
                  </a>
                </div>
                <div className="flex items-center gap-3 text-white/60">
                  <Clock className="h-4 w-4 shrink-0 text-gold/70" />
                  <span>Mon - Fri, 8:00 AM - 5:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-4 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
            <p className="text-xs text-white/40 text-center">
              &copy; {new Date().getFullYear()} Sangguniang Bayan ng Panglao.
              All rights reserved.
            </p>
            <p className="text-xs text-white/30">
              Legislative Records Management System
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
