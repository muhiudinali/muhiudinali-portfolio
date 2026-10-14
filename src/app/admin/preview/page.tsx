import { redirect } from "next/navigation";
// Old preview bookmarks now open the real protected content editor.
export default function AdminPreviewRedirect() { redirect("/admin"); }
