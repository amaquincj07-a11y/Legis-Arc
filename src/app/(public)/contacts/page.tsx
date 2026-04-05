"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

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
        <h3 className="font-[family-name:var(--font-garamond)] text-base font-semibold text-foreground">{title}</h3>
        <div className="mt-2 space-y-0.5">
          {lines.map((line) => (
            <p key={line} className="font-[family-name:var(--font-garamond)] text-base text-muted-foreground">
              {line}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ContactsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSending(true);
    // Simulate sending
    setTimeout(() => {
      setSending(false);
      toast.success("Your message has been sent successfully! We will get back to you soon.");
      setName("");
      setEmail("");
      setSubject("");
      setType("");
      setMessage("");
    }, 1500);
  }

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
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white uppercase tracking-wide font-[family-name:var(--font-garamond)]"
            style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.7)" }}
          >
            Contact Us
          </h1>
          <p
            className="mt-4 max-w-2xl text-sm sm:text-lg lg:text-xl text-white font-[family-name:var(--font-garamond)]"
            style={{ textShadow: "1px 1px 6px rgba(0,0,0,0.7)" }}
          >
            Get in touch with the Office of the Sangguniang Bayan
          </p>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15">
              <Phone className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-garamond)] text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                Contact Information
              </h2>
              <p className="font-[family-name:var(--font-garamond)] text-base text-muted-foreground">
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

      {/* Message / Request Form */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="font-[family-name:var(--font-garamond)] text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Send Us a Message
            </h2>
            <p className="font-[family-name:var(--font-garamond)] mt-2 text-base text-muted-foreground">
              Have a question, concern, or document request? Fill out the form below and we&apos;ll respond as soon as possible.
            </p>
          </div>

          <Card>
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Juan Dela Cruz"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="juan@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type of Inquiry</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="document_request">Document Request</SelectItem>
                        <SelectItem value="complaint">Complaint</SelectItem>
                        <SelectItem value="suggestion">Suggestion</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief subject of your message"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">
                    Message <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Type your message or request here..."
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={sending}
                    className="bg-navy hover:bg-navy/90 text-white"
                  >
                    {sending ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
