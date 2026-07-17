import { redirect } from "next/navigation";

/** `/admin` has no page of its own — send staff to the dashboard. */
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
