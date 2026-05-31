import { redirect } from "next/navigation";

export default function SourceSettingsPage() {
  redirect("/settings?section=sources");
}
