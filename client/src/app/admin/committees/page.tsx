import { redirect } from "next/navigation";

export default function CommitteesRedirectPage() {
  redirect("/admin/sb-members?tab=committees");
}
