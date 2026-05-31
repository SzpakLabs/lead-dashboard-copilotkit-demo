import { redirect } from "next/navigation";

export default function FieldSettingsPage() {
  redirect("/settings?section=custom-fields");
}
