import { generateResolutionStaticParams } from "@/lib/supabase/generate-static-resolution-params";

export async function generateStaticParams() {
  return generateResolutionStaticParams();
}

export default function ResolutionIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
