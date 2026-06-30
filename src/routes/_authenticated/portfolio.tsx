import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/coming-soon";
import { UserSquare2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portfolio")({
  head: () => ({ meta: [{ title: "Portfolio · Campus Buddy" }] }),
  component: () => (
    <ComingSoon
      icon={UserSquare2}
      title="Portfolio Tracker"
      description="Skills, certificates, achievements and links — with a profile completion score. Coming next."
    />
  ),
});
