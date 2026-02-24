import Image from "next/image";
import {
  Landmark,
  User,
  Users,
  Building,
  Phone,
  Mail,
  Clock,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { mockSBMembers, mockCommittees } from "@/lib/mock-data";

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

        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <Landmark className="h-7 w-7 text-gold" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Sangguniang Bayan{" "}
            <span className="mt-1 block text-gold">ng Panglao</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/60 sm:text-base">
            The legislative body of the Municipality of Panglao, Bohol —
            committed to transparent governance and public service.
          </p>
        </div>
      </section>

      {/* SB Member Chart */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/10">
              <Users className="h-5 w-5 text-navy" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                SB Member Chart
              </h2>
              <p className="text-sm text-muted-foreground">
                Elected and appointed members of the Sangguniang Bayan
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockSBMembers.map((member) => (
              <Card
                key={member.id}
                className="border-2 border-transparent transition-all duration-200 hover:border-teal/15 hover:shadow-md overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="relative aspect-[3/4] w-full bg-muted/30">
                    <Image
                      src={member.imageUrl ?? "/images/sb-member-placeholder.png"}
                      alt={`Portrait of ${member.name}, ${member.position}`}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-foreground">
                      {member.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-teal font-medium">
                      {member.position}
                    </p>
                    {member.committees.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {member.committees.map((c) => (
                          <Badge
                            key={c}
                            variant="secondary"
                            className="bg-muted text-[10px] font-normal text-muted-foreground px-2 py-0.5"
                          >
                            {c}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Separator />
      </div>

      {/* Committees */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10">
              <Building className="h-5 w-5 text-teal" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Committees
              </h2>
              <p className="text-sm text-muted-foreground">
                Standing committees of the Sangguniang Bayan
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockCommittees.map((committee) => (
              <Card key={committee.id} className="border hover:shadow-sm transition-shadow">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-foreground text-sm">
                    {committee.name}
                  </h3>
                  <div className="mt-3 space-y-1.5">
                    {committee.members.map((member) => (
                      <div
                        key={member}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <User className="h-3 w-3 shrink-0" />
                        <span>{member}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

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

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  lines: string[];
}) {
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
