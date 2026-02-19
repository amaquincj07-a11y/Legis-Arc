import { mockMinutes } from "@/lib/mock-data";

export async function generateStaticParams() {
  return mockMinutes.map((m) => ({ id: m.id }));
}

export default function MinutesIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
