import { mockResolutions } from "@/lib/mock-data";

export async function generateStaticParams() {
  return mockResolutions.map((d) => ({ id: d.id }));
}

export default function ResolutionIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
