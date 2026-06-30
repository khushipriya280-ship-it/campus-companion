import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Plus,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  FolderKanban,
  Briefcase,
  UserSquare2,
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Campus Buddy" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const name =
    (user?.user_metadata?.full_name as string)?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const stats = [
    { label: "Assignments due", value: "0", icon: BookOpen, tint: "primary" },
    { label: "Attendance", value: "—", icon: CalendarCheck, tint: "success" },
    { label: "Upcoming exams", value: "0", icon: GraduationCap, tint: "warning" },
    { label: "Active projects", value: "0", icon: FolderKanban, tint: "info" },
  ] as const;

  const quickActions = [
    { label: "Add assignment", to: "/assignments", icon: BookOpen },
    { label: "Add attendance", to: "/attendance", icon: CalendarCheck },
    { label: "Add exam", to: "/exams", icon: GraduationCap },
    { label: "Add project", to: "/projects", icon: FolderKanban },
    { label: "Add internship", to: "/internships", icon: Briefcase },
    { label: "Add portfolio item", to: "/portfolio", icon: UserSquare2 },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Hero greeting */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl border bg-card p-6 shadow-soft md:p-8"
      >
        <div className="pointer-events-none absolute inset-0 gradient-hero opacity-80" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-card/70 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
            <Sparkles className="h-3 w-3 text-primary" /> {today}
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
            {greeting}, <span className="text-gradient">{name}</span> 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's a quick look at your day. Let's make it productive.
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-border/60 shadow-soft">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center justify-between">
                  <div
                    className={
                      "grid h-9 w-9 place-items-center rounded-xl " +
                      tintBg(s.tint)
                    }
                  >
                    <s.icon className={"h-[18px] w-[18px] " + tintText(s.tint)} />
                  </div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground/60" />
                </div>
                <div className="mt-3 text-2xl font-bold tracking-tight">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Plus className="h-4 w-4" /> Quick actions
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {quickActions.map((a) => (
            <Link key={a.to} to={a.to}>
              <Button
                variant="outline"
                className="h-auto w-full justify-start gap-2 rounded-xl py-3 text-sm font-medium hover:border-primary/40 hover:bg-primary/5"
              >
                <a.icon className="h-4 w-4 text-primary" /> {a.label}
              </Button>
            </Link>
          ))}
        </div>
      </section>

      {/* Two-column content */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <Card className="border-border/60 shadow-soft lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Upcoming assignments</CardTitle>
            <Link to="/assignments" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={BookOpen}
              title="No assignments yet"
              description="Add your first assignment to start tracking deadlines."
              cta={
                <Link to="/assignments">
                  <Button size="sm" className="gradient-primary text-primary-foreground">
                    <Plus className="mr-1 h-4 w-4" /> Add assignment
                  </Button>
                </Link>
              }
            />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Attendance</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <RingProgress value={0} />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Add subjects in the attendance tracker to see your % here.
            </p>
            <Link to="/attendance" className="mt-3">
              <Button size="sm" variant="outline">Set up attendance</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-soft lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Active projects</CardTitle>
            <Link to="/projects" className="text-xs text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={FolderKanban}
              title="No projects tracked"
              description="Start a project to track progress, links and deadlines."
            />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Upcoming exams</CardTitle>
            <Link to="/exams" className="text-xs text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent>
            <EmptyState icon={Clock} title="No exams scheduled" description="Add upcoming exams to see countdowns." />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function tintBg(tint: string) {
  return {
    primary: "bg-primary/10",
    success: "bg-success/10",
    warning: "bg-warning/15",
    info: "bg-info/10",
  }[tint] as string;
}
function tintText(tint: string) {
  return {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    info: "text-info",
  }[tint] as string;
}

function EmptyState({
  icon: Icon,
  title,
  description,
  cta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-10 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">{description}</p>
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}

function RingProgress({ value }: { value: number }) {
  const size = 120;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="oklch(from var(--muted) l c h)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="oklch(from var(--primary) l c h)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-2xl font-bold">{value}%</div>
      </div>
      <div className="absolute inset-x-0 -bottom-1 grid place-items-center">
        <div className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          Target 75%
        </div>
      </div>
    </div>
  );
}

// Suppress unused warning for Progress (kept for future use)
void Progress;
