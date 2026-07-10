import { createAdminClient } from "@/lib/supabase/admin";

export async function generateResolutionStaticParams(): Promise<
  { id: string }[]
> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("resolutions").select("id");

    if (error || !data?.length) {
      return [];
    }

    return data.map((row) => ({ id: row.id }));
  } catch {
    return [];
  }
}
