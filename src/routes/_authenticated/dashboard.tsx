import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { format, isToday, isPast, isTomorrow, differenceInCalendarDays } from "date-fns";
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
  CheckCircle2,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Campus Buddy" }] }),
  component: Dashboard,
});

type DashAssignment = {
  id: string;
  title: string;
  subject: string | null;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed" | "archived";
  deadline: string | null;
};

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

  const { data: assignments = [] } = useQuery({
    queryKey: ["assignments-dashboard", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("id,title,subject,priority,status,deadline");
      if (error) throw error;
      return (data ?? []) as DashAssignment[];
    },
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects-dashboard", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("id,name,attended_classes,total_classes,target_percentage");
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string; name: string;
        attended_classes: number; total_classes: number; target_percentage: number;
      }>;
    },
  });

  const attendance = (() => {
    if (subjects.length === 0)
      return { overall: 0, count: 0, lowest: null as null | { name: string; pct: number }, status: "—" };
    const totA = subjects.reduce((s, x) => s + x.attended_classes, 0);
    const totT = subjects.reduce((s, x) => s + x.total_classes, 0);
    const overall = totT > 0 ? Math.round((totA / totT) * 1000) / 10 : 0;
    const enriched = subjects.map((s) => ({
      name: s.name,
      pct: s.total_classes > 0 ? Math.round((s.attended_classes / s.total_classes) * 1000) / 10 : 0,
    }));
    const lowest = [...enriched].sort((a, b) => a.pct - b.pct)[0];
    const status = overall >= 85 ? "Safe" : overall >= 75 ? "Warning" : "Critical";
    return { overall, count: subjects.length, lowest, status };
  })();

  const counts = (() => {
    const now = new Date();
    let dueToday = 0,
      upcoming = 0,
      overdue = 0,
      completed = 0;
    assignments.forEach((a) => {
      if (a.status === "archived") return;
      if (a.status === "completed") {
        completed++;
        return;
      }
      if (!a.deadline) return;
      const d = new Date(a.deadline);
      if (isToday(d)) dueToday++;
      else if (isPast(d) && d < now) overdue++;
      else if (d > now) upcoming++;
    });
    return { dueToday, upcoming, overdue, completed };
  })();

  const upcomingList = assignments
    .filter((a) => a.status !== "completed" && a.status !== "archived" && a.deadline)
    .sort((a, b) => (a.deadline ?? "").localeCompare(b.deadline ?? ""))
    .slice(0, 5);

  const dueCount = counts.dueToday + counts.upcoming + counts.overdue;

  const stats = [
    { label: "Assignments due", value: String(dueCount), icon: BookOpen, tint: "primary" as const },
    { label: "Attendance", value: "—", icon: CalendarCheck, tint: "success" as const },
    { label: "Upcoming exams", value: "0", icon: GraduationCap, tint: "warning" as const },
    { label: "Active projects", value: "0", icon: FolderKanban, tint: "info" as const },
  ];

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
                  <div className={"grid h-9 w-9 place-items-center rounded-xl " + tintBg(s.tint)}>
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

      {/* Assignment summary */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <BookOpen className="h-4 w-4" /> Assignments overview
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MiniStat label="Due today" value={counts.dueToday} icon={Clock} tone="warning" to="/assignments" />
          <MiniStat label="Upcoming" value={counts.upcoming} icon={BookOpen} tone="primary" to="/assignments" />
          <MiniStat label="Overdue" value={counts.overdue} icon={Flag} tone="destructive" to="/assignments" />
          <MiniStat label="Completed" value={counts.completed} icon={CheckCircle2} tone="success" to="/assignments" />
        </div>
      </section>

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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <Card className="border-border/60 shadow-soft lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Upcoming assignments</CardTitle>
            <Link to="/assignments" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingList.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No upcoming assignments"
                description="You're all caught up. Add a new task to start tracking deadlines."
                cta={
                  <Link to="/assignments">
                    <Button size="sm" className="gradient-primary text-primary-foreground">
                      <Plus className="mr-1 h-4 w-4" /> Add assignment
                    </Button>
                  </Link>
                }
              />
            ) : (
              <ul className="divide-y">
                {upcomingList.map((a) => {
                  const d = a.deadline ? new Date(a.deadline) : null;
                  const tone = !d
                    ? "muted"
                    : isToday(d)
                      ? "warning"
                      : d < new Date()
                        ? "destructive"
                        : "primary";
                  const label = !d
                    ? "No deadline"
                    : isToday(d)
                      ? `Today · ${format(d, "h:mm a")}`
                      : isTomorrow(d)
                        ? `Tomorrow · ${format(d, "h:mm a")}`
                        : d < new Date()
                          ? `Overdue · ${Math.abs(differenceInCalendarDays(d, new Date()))}d ago`
                          : format(d, "MMM d · h:mm a");
                  return (
                    <li key={a.id} className="flex items-center gap-3 py-2.5">
                      <div className={cn("grid h-9 w-9 place-items-center rounded-xl", tintBg("primary"))}>
                        <BookOpen className={cn("h-4 w-4", tintText("primary"))} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{a.title}</span>
                          {a.subject && (
                            <span className="hidden text-xs text-muted-foreground sm:inline">· {a.subject}</span>
                          )}
                        </div>
                        <div className={cn("text-xs", toneText(tone))}>{label}</div>
                      </div>
                      <Badge variant="outline" className={cn("border text-[10px]", priorityClass(a.priority))}>
                        {a.priority}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
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

function MiniStat({
  label,
  value,
  icon: Icon,
  tone,
  to,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "success" | "warning" | "destructive";
  to: string;
}) {
  const bg = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  }[tone];
  return (
    <Link to={to}>
      <Card className="border-border/60 shadow-soft transition hover:shadow-elevated">
        <CardContent className="flex items-center gap-3 p-4">
          <div className={cn("grid h-10 w-10 place-items-center rounded-xl", bg)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold leading-tight">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function priorityClass(p: "low" | "medium" | "high") {
  return {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-warning/15 text-warning border-warning/20",
    low: "bg-success/10 text-success border-success/20",
  }[p];
}

function toneText(t: "muted" | "warning" | "destructive" | "primary") {
  return {
    muted: "text-muted-foreground",
    warning: "text-warning",
    destructive: "text-destructive",
    primary: "text-primary",
  }[t];
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

void Progress;
