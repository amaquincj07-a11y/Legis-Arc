import { redirect } from "next/navigation";
import { buildLguPath, defaultPlace } from "@/lib/lgu-path";

export default function Home() {
  const place = defaultPlace();
  redirect(buildLguPath(place.province, place.municipality));
}
