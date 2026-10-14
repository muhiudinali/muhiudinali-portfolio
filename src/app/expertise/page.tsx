import { permanentRedirect } from "next/navigation";
// Keep previously shared links working; all public navigation uses /skills.
export default function ExpertiseRedirect() { permanentRedirect("/skills"); }
