import { generateResolutionStaticParams } from "@/lib/generate-static-params";

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
