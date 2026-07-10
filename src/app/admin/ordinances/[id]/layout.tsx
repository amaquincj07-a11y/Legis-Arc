import { generateOrdinanceStaticParams } from "@/lib/supabase/generate-static-ordinance-params";

export async function generateStaticParams() {
  return generateOrdinanceStaticParams();
}

export default function OrdinanceIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
