import { mockResolutions } from "@/lib/mock-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureStaticParams } from "@/lib/supabase/ensure-static-params";

export async function generateResolutionStaticParams(): Promise<
  { id: string }[]
> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("resolutions").select("id");

    if (!error && data?.length) {
      return data.map((row) => ({ id: row.id }));
    }
  } catch {
    // Fall back to mock IDs when Supabase is unavailable during static export.
  }

  return ensureStaticParams(
    mockResolutions.map((resolution) => ({ id: resolution.id }))
  );
}
