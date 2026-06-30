import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Check,
  X,
  BookOpen,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  ArrowUpDown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/attendance")({
  head: () => ({ meta: [{ title: "Attendance · Campus Buddy" }] }),
  component: AttendancePage,
});

type Subject = {
  id: string;
  user_id: string;
  name: string;
  code: string | null;
  faculty: string | null;
  semester: string | null;
  color: string | null;
  target_percentage: number;
  total_classes: number;
  attended_classes: number;
};

type StatusKey = "safe" | "warning" | "critical";

function pct(attended: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((attended / total) * 1000) / 10;
}

function statusOf(p: number, target: number): StatusKey {
  if (p >= 85) return "safe";
  if (p >= target) return "warning";
  return "critical";
}

function classesNeeded(attended: number, total: number, target: number) {
  // x such that (attended + x) / (total + x) >= target/100
  const t = target / 100;
  if (total === 0) return 0;
  if (attended / total >= t) return 0;
  const x = Math.ceil((t * total - attended) / (1 - t));
  return Math.max(0, x);
}

function safeToMiss(attended: number, total: number, target: number) {
  const t = target / 100;
  if (total === 0) return 0;
  if (attended / total < t) return 0;
  // x such that attended / (total + x) >= t
  const x = Math.floor(attended / t - total);
  return Math.max(0, x);
}

function AttendancePage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StatusKey>("all");
  const [sortBy, setSortBy] = useState<"percentage" | "name">("percentage");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState<Subject | null>(null);

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ["subjects", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Subject[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (s: Partial<Subject> & { id?: string }) => {
      if (s.id) {
        const { error } = await supabase.from("subjects").update({
          name: s.name!,
          code: s.code ?? null,
          faculty: s.faculty ?? null,
          semester: s.semester ?? null,
          target_percentage: s.target_percentage ?? 75,
          total_classes: s.total_classes ?? 0,
          attended_classes: s.attended_classes ?? 0,
        }).eq("id", s.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("subjects").insert({
          user_id: user!.id,
          name: s.name!,
          code: s.code ?? null,
          faculty: s.faculty ?? null,
          semester: s.semester ?? null,
          target_percentage: s.target_percentage ?? 75,
          total_classes: s.total_classes ?? 0,
          attended_classes: s.attended_classes ?? 0,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
      setDialogOpen(false);
      setEditing(null);
      toast.success(editing ? "Subject updated" : "Subject added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
      setDeleting(null);
      toast.success("Subject deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mark = useMutation({
    mutationFn: async ({ s, present }: { s: Subject; present: boolean }) => {
      const { error } = await supabase
        .from("subjects")
        .update({
          total_classes: s.total_classes + 1,
          attended_classes: s.attended_classes + (present ? 1 : 0),
        })
        .eq("id", s.id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
      toast.success(vars.present ? "Marked present" : "Marked absent");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const enriched = useMemo(() => {
    return subjects.map((s) => {
      const p = pct(s.attended_classes, s.total_classes);
      return {
        ...s,
        pct: p,
        missed: Math.max(0, s.total_classes - s.attended_classes),
        status: statusOf(p, s.target_percentage),
        needed: classesNeeded(s.attended_classes, s.total_classes, s.target_percentage),
        canMiss: safeToMiss(s.attended_classes, s.total_classes, s.target_percentage),
      };
    });
  }, [subjects]);

  const filtered = useMemo(() => {
    let list = enriched.filter((s) =>
      [s.name, s.code, s.faculty].filter(Boolean).some((v) =>
        (v as string).toLowerCase().includes(search.toLowerCase()),
      ),
    );
    if (statusFilter !== "all") list = list.filter((s) => s.status === statusFilter);
    list = [...list].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return a.pct - b.pct;
    });
    return list;
  }, [enriched, search, statusFilter, sortBy]);

  const analytics = useMemo(() => {
    if (enriched.length === 0)
      return { overall: 0, avg: 0, best: null as null | typeof enriched[number], worst: null as null | typeof enriched[number] };
    const totA = enriched.reduce((s, x) => s + x.attended_classes, 0);
    const totT = enriched.reduce((s, x) => s + x.total_classes, 0);
    const overall = pct(totA, totT);
    const avg = Math.round((enriched.reduce((s, x) => s + x.pct, 0) / enriched.length) * 10) / 10;
    const sorted = [...enriched].sort((a, b) => b.pct - a.pct);
    return { overall, avg, best: sorted[0], worst: sorted[sorted.length - 1] };
  }, [enriched]);

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Attendance</h1>
          <p className="text-sm text-muted-foreground">
            Track every subject and know exactly how many classes you can skip.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          className="gradient-primary hidden text-primary-foreground md:inline-flex"
        >
          <Plus className="mr-1 h-4 w-4" /> Add subject
        </Button>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <AnalyticsCard
          label="Overall"
          value={`${analytics.overall}%`}
          icon={ShieldCheck}
          tone={analytics.overall >= 85 ? "success" : analytics.overall >= 75 ? "warning" : "destructive"}
        />
        <AnalyticsCard label="Average" value={`${analytics.avg}%`} icon={TrendingUp} tone="primary" />
        <AnalyticsCard
          label="Best"
          value={analytics.best ? `${analytics.best.pct}%` : "—"}
          hint={analytics.best?.name}
          icon={TrendingUp}
          tone="success"
        />
        <AnalyticsCard
          label="Lowest"
          value={analytics.worst ? `${analytics.worst.pct}%` : "—"}
          hint={analytics.worst?.name}
          icon={TrendingDown}
          tone="destructive"
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subject, code or faculty…"
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="md:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="safe">🟢 Safe</SelectItem>
            <SelectItem value="warning">🟡 Warning</SelectItem>
            <SelectItem value="critical">🔴 Critical</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="md:w-44">
            <ArrowUpDown className="mr-1 h-3.5 w-3.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Sort by %</SelectItem>
            <SelectItem value="name">Sort by name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState onAdd={() => { setEditing(null); setDialogOpen(true); }} hasAny={subjects.length > 0} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((s) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
              >
                <SubjectCard
                  s={s}
                  onEdit={() => { setEditing(s); setDialogOpen(true); }}
                  onDelete={() => setDeleting(s)}
                  onPresent={() => mark.mutate({ s, present: true })}
                  onAbsent={() => mark.mutate({ s, present: false })}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Mobile FAB */}
      <button
        onClick={() => { setEditing(null); setDialogOpen(true); }}
        className="fixed bottom-20 right-4 z-40 grid h-14 w-14 place-items-center rounded-full gradient-primary text-primary-foreground shadow-elevated md:hidden"
        aria-label="Add subject"
      >
        <Plus className="h-6 w-6" />
      </button>

      <SubjectDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}
        initial={editing}
        onSubmit={(v) => upsert.mutate(v)}
        submitting={upsert.isPending}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this subject?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.name}" and all its attendance data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && remove.mutate(deleting.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AnalyticsCard({
  label, value, hint, icon: Icon, tone,
}: {
  label: string; value: string; hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "success" | "warning" | "destructive";
}) {
  const bg = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  }[tone];
  return (
    <Card className="border-border/60 shadow-soft">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={cn("grid h-9 w-9 place-items-center rounded-xl", bg)}>
            <Icon className="h-[18px] w-[18px]" />
          </div>
        </div>
        <div className="mt-3 text-2xl font-bold tracking-tight">{value}</div>
        <div className="text-xs text-muted-foreground">{label}{hint ? ` · ${hint}` : ""}</div>
      </CardContent>
    </Card>
  );
}

function SubjectCard({
  s, onEdit, onDelete, onPresent, onAbsent,
}: {
  s: Subject & { pct: number; missed: number; status: StatusKey; needed: number; canMiss: number };
  onEdit: () => void; onDelete: () => void; onPresent: () => void; onAbsent: () => void;
}) {
  const ring = ringColor(s.status);
  return (
    <Card className="overflow-hidden border-border/60 shadow-soft transition hover:shadow-elevated">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold">{s.name}</h3>
              {s.status === "critical" && (
                <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-[10px] text-destructive">
                  <AlertTriangle className="mr-1 h-3 w-3" /> Low
                </Badge>
              )}
            </div>
            <div className="mt-0.5 truncate text-xs text-muted-foreground">
              {[s.code, s.faculty, s.semester].filter(Boolean).join(" · ") || "No details"}
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={onEdit} className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onDelete} className="h-8 w-8 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <Ring value={s.pct} status={s.status} />
          <div className="grid flex-1 grid-cols-2 gap-2 text-center text-xs">
            <Stat label="Attended" value={s.attended_classes} />
            <Stat label="Total" value={s.total_classes} />
            <Stat label="Missed" value={s.missed} />
            <Stat label="Target" value={`${s.target_percentage}%`} />
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Progress to target</span>
            <span>{Math.min(100, Math.round((s.pct / s.target_percentage) * 100))}%</span>
          </div>
          <Progress
            value={Math.min(100, (s.pct / s.target_percentage) * 100)}
            className={cn("h-2", ring.track)}
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-lg bg-muted/50 p-2">
            <div className="text-muted-foreground">Can skip</div>
            <div className="text-sm font-semibold text-success">{s.canMiss}</div>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <div className="text-muted-foreground">Need to attend</div>
            <div className="text-sm font-semibold text-warning">{s.needed}</div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={onPresent} size="sm" className="flex-1 bg-success/15 text-success hover:bg-success/25">
            <Check className="mr-1 h-4 w-4" /> Present
          </Button>
          <Button onClick={onAbsent} size="sm" variant="outline" className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10">
            <X className="mr-1 h-4 w-4" /> Absent
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/40 py-1.5">
      <div className="text-sm font-semibold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

function ringColor(s: StatusKey) {
  if (s === "safe") return { stroke: "oklch(from var(--success) l c h)", track: "bg-success/20 [&>div]:bg-success" };
  if (s === "warning") return { stroke: "oklch(from var(--warning) l c h)", track: "bg-warning/20 [&>div]:bg-warning" };
  return { stroke: "oklch(from var(--destructive) l c h)", track: "bg-destructive/20 [&>div]:bg-destructive" };
}

function Ring({ value, status }: { value: number; status: StatusKey }) {
  const size = 84, stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, value) / 100) * c;
  const color = ringColor(status).stroke;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="oklch(from var(--muted) l c h)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color}
          strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-base font-bold">{value}%</div>
      </div>
    </div>
  );
}

function EmptyState({ onAdd, hasAny }: { onAdd: () => void; hasAny: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <BookOpen className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-semibold">
        {hasAny ? "No subjects match your filters" : "No subjects added yet"}
      </h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        {hasAny ? "Try clearing filters or search." : "Add your first subject to start tracking attendance."}
      </p>
      {!hasAny && (
        <Button onClick={onAdd} className="mt-5 gradient-primary text-primary-foreground">
          <Plus className="mr-1 h-4 w-4" /> Add subject
        </Button>
      )}
    </div>
  );
}

function SubjectDialog({
  open, onOpenChange, initial, onSubmit, submitting,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: Subject | null;
  onSubmit: (v: Partial<Subject> & { id?: string }) => void;
  submitting: boolean;
}) {
  const [form, setForm] = useState({
    name: "", code: "", faculty: "", semester: "",
    target_percentage: 75, total_classes: 0, attended_classes: 0,
  });

  // Reset form when dialog opens
  useMemo(() => {
    if (open) {
      setForm({
        name: initial?.name ?? "",
        code: initial?.code ?? "",
        faculty: initial?.faculty ?? "",
        semester: initial?.semester ?? "",
        target_percentage: initial?.target_percentage ?? 75,
        total_classes: initial?.total_classes ?? 0,
        attended_classes: initial?.attended_classes ?? 0,
      });
    }
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit subject" : "Add subject"}</DialogTitle>
          <DialogDescription>
            {initial ? "Update subject info or attendance counts." : "Add a subject and set your attendance target."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) return toast.error("Subject name is required");
            if (form.attended_classes > form.total_classes)
              return toast.error("Attended can't exceed total classes");
            onSubmit({ ...form, id: initial?.id });
          }}
          className="space-y-3"
        >
          <Field label="Subject name *">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Data Structures" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Code">
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CS201" />
            </Field>
            <Field label="Semester">
              <Input value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} placeholder="Sem 3" />
            </Field>
          </div>
          <Field label="Faculty">
            <Input value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} placeholder="Prof. Sharma" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Target %">
              <Input
                type="number" min={1} max={100} value={form.target_percentage}
                onChange={(e) => setForm({ ...form, target_percentage: Number(e.target.value) || 0 })}
              />
            </Field>
            <Field label="Attended">
              <Input
                type="number" min={0} value={form.attended_classes}
                onChange={(e) => setForm({ ...form, attended_classes: Number(e.target.value) || 0 })}
              />
            </Field>
            <Field label="Total">
              <Input
                type="number" min={0} value={form.total_classes}
                onChange={(e) => setForm({ ...form, total_classes: Number(e.target.value) || 0 })}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="gradient-primary text-primary-foreground">
              {submitting ? "Saving…" : initial ? "Save changes" : "Add subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
