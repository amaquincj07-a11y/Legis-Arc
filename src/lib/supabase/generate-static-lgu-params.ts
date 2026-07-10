import { createAdminClient } from "@/lib/supabase/admin";
import { ensureStaticParams } from "@/lib/supabase/ensure-static-params";

export async function generateLGUStaticParams(): Promise<{ id: string }[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("lgus").select("id");

    if (!error && data?.length) {
      return data.map((row) => ({ id: row.id }));
    }
  } catch {
    // Fall back to a placeholder when Supabase is unavailable during static export.
  }

  return ensureStaticParams([]);
}
