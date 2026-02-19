import { mockOrdinances } from "@/lib/mock-data";

export async function generateStaticParams() {
  return mockOrdinances.map((d) => ({ id: d.id }));
}

export default function OrdinanceIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
