import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
import { FolderKanban } from "lucide-react";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({ meta: [{ title: "Projects · Campus Buddy" }] }),
  component: () => (
    <ComingSoon
      icon={FolderKanban}
      title="Project Manager"
      description="Track project progress, team, GitHub & demo links — coming next."
    />
  ),
});
