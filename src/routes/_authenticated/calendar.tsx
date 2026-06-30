import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
import { CalendarDays } from "lucide-react";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({ meta: [{ title: "Calendar · Campus Buddy" }] }),
  component: () => (
    <ComingSoon
      icon={CalendarDays}
      title="Calendar"
      description="A monthly view of every assignment, exam, project and internship event. Coming next."
    />
  ),
});
