import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
import { Briefcase } from "lucide-react";

export const Route = createFileRoute("/_authenticated/internships")({
  head: () => ({ meta: [{ title: "Internships · Campus Buddy" }] }),
  component: () => (
    <ComingSoon
      icon={Briefcase}
      title="Internship Organizer"
      description="A Kanban board for every application — saved, applied, interview, offer, rejected. Coming next."
    />
  ),
});
