import { mockOrdinances } from "@/lib/mock-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureStaticParams } from "@/lib/supabase/ensure-static-params";

export async function generateOrdinanceStaticParams(): Promise<{ id: string }[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("ordinances").select("id");

    if (!error && data?.length) {
      return data.map((row) => ({ id: row.id }));
    }
  } catch {
    // Fall back to mock IDs when Supabase is unavailable during static export.
  }

  return ensureStaticParams(
    mockOrdinances.map((ordinance) => ({ id: ordinance.id }))
  );
}
