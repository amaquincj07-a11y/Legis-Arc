import { TrackingProvider } from "./tracking-context";

export default function TrackingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TrackingProvider>{children}</TrackingProvider>;
}
