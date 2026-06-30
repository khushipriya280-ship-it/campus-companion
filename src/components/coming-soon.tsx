import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border bg-card p-10 text-center shadow-soft"
      >
        <div className="pointer-events-none absolute inset-0 gradient-hero opacity-60" />
        <div className="relative">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
            <Icon className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">Launching in the next build</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            We're shipping Campus Buddy in phases. This module is queued for the next phase along with full CRUD,
            filtering and beautiful empty states.
          </p>
          <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border bg-card/70 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Phase 2 — Core trackers
          </div>
          <div className="mt-6">
            <Link to="/dashboard">
              <Button variant="outline">Back to dashboard</Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
