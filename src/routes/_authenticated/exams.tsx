import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
import { GraduationCap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/exams")({
  head: () => ({ meta: [{ title: "Exams · Campus Buddy" }] }),
  component: () => (
    <ComingSoon
      icon={GraduationCap}
      title="Exam Planner"
      description="Countdown to every exam, plan revision and track your prep — coming next."
    />
  ),
});
