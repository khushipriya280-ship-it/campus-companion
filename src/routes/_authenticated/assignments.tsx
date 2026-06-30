import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/assignments")({
  head: () => ({ meta: [{ title: "Assignments · Campus Buddy" }] }),
  component: () => (
    <ComingSoon
      icon={BookOpen}
      title="Assignment Tracker"
      description="Add, organise and crush assignments with priorities, deadlines and progress — coming in the next build phase."
    />
  ),
});
