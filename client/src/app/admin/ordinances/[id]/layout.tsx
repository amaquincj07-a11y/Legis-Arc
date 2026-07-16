import { generateOrdinanceStaticParams } from "@/lib/generate-static-params";

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
