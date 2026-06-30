import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
import { CalendarCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/attendance")({
  head: () => ({ meta: [{ title: "Attendance · Campus Buddy" }] }),
  component: () => (
    <ComingSoon
      icon={CalendarCheck}
      title="Attendance Calculator"
      description="Track every subject, see your % live, and know exactly how many classes you can skip — coming next."
    />
  ),
});
