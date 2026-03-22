import { Landmark, Phone, Mail, Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AboutTermContent } from "./about-term-content";

export default function AboutPage() {
  return (
    <div className="min-h-[70vh]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-navy">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-br from-navy via-navy-light/80 to-navy" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-teal/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-gold/8 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 py-10 text-center sm:px-6 sm:py-24 lg:px-8">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm sm:mb-5 sm:h-14 sm:w-14">
            <Landmark className="h-6 w-6 text-gold sm:h-7 sm:w-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Sangguniang Bayan{" "}
            <span className="mt-1 block text-[#cbab53]">Organizational Chart</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-xs text-white/60 sm:mt-4 sm:text-base">
            Elected and appointed members of the Sangguniang Bayan
          </p>
        </div>
      </section>

      <AboutTermContent />

      {/* Contact Section */}
      <section className="bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15">
              <Phone className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Contact Information
              </h2>
              <p className="text-sm text-muted-foreground">
                Get in touch with the Office of the Sangguniang Bayan
              </p>
            </div>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            <ContactCard
              icon={MapPin}
              title="Office Address"
              lines={[
                "Office of the Sangguniang Bayan",
                "Municipal Building, Poblacion",
                "Panglao, Bohol 6340",
              ]}
            />
            <ContactCard
              icon={Phone}
              title="Phone"
              lines={["(038) 502-XXXX", "Globe: 0917-XXX-XXXX"]}
            />
            <ContactCard
              icon={Mail}
              title="Email"
              lines={["sb@panglao.gov.ph", "secretary@panglao.gov.ph"]}
            />
            <ContactCard
              icon={Clock}
              title="Office Hours"
              lines={[
                "Monday – Friday",
                "8:00 AM – 5:00 PM",
                "Closed on weekends & holidays",
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactCard({
  icon: Icon,
  title,
  lines,
}: Readonly<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  lines: string[];
}>) {
  return (
    <Card className="border hover:shadow-sm transition-shadow">
      <CardContent className="p-5">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-navy/10">
          <Icon className="h-5 w-5 text-navy" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <div className="mt-2 space-y-0.5">
          {lines.map((line) => (
            <p key={line} className="text-sm text-muted-foreground">
              {line}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
