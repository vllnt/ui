import { permanentRedirect } from "next/navigation";

export default function DocumentationChangelogRedirect() {
  permanentRedirect("/changelog");
}
