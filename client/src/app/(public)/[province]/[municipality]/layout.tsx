import { LguPlaceSync } from "@/components/public/lgu-place-sync";
import { resolveLguParams } from "./lgu-route";

export default async function LguPlaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ province: string; municipality: string }>;
}) {
  const place = await resolveLguParams(params);

  return (
    <>
      <LguPlaceSync
        province={place.province}
        municipality={place.municipality}
      />
      {children}
    </>
  );
}
