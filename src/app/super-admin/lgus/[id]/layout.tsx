import { generateLGUStaticParams } from "@/lib/supabase/generate-static-lgu-params";

export async function generateStaticParams() {
  return generateLGUStaticParams();
}

export default function LGUDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
