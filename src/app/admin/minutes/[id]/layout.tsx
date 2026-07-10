import { generateSessionMinutesStaticParams } from "@/lib/supabase/generate-static-session-minutes-params";

export async function generateStaticParams() {
  return generateSessionMinutesStaticParams();
}

export default function MinutesIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
