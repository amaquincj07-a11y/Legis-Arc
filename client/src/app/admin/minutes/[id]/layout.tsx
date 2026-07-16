import { generateSessionMinutesStaticParams } from "@/lib/generate-static-params";

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
