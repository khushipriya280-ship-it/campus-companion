import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  format,
  isToday,
  
  isSameDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  differenceInMilliseconds,
} from "date-fns";
import {
  Plus,
  Search,
  GraduationCap,
  Clock,
  MapPin,
  CheckCircle2,
  Pencil,
  Trash2,
  Copy,
  MoreVertical,
  Filter as FilterIcon,
  Calendar as CalendarIconLucide,
  ChevronLeft,
  ChevronRight,
  Bell,
  BookOpen,
  LayoutGrid,
  List as ListIcon,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/exams")({
  head: () => ({ meta: [{ title: "Exams · Campus Buddy" }] }),
  component: ExamsPage,
});

type ExamType =
  | "internal"
  | "mid_sem"
  | "practical"
  | "viva"
  | "final"
  | "assignment_eval"
  | "other";

type ExamStatus = "upcoming" | "completed" | "missed";

type Exam = {
  id: string;
  user_id: string;
  subject: string;
  title: string | null;
  exam_type: ExamType;
  exam_date: string; // yyyy-mm-dd
  exam_time: string | null; // HH:mm:ss
  end_time: string | null;
  room: string | null;
  faculty: string | null;
  max_marks: number | null;
  passing_marks: number | null;
  expected_marks: number | null;
  status: ExamStatus;
  prep_status: string;
  revision_progress: number;
  chapters_completed: number;
  chapters_total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type FormState = {
  id?: string;
  subject: string;
  title: string;
  exam_type: ExamType;
  exam_date: string;
  exam_time: string;
  end_time: string;
  room: string;
  faculty: string;
  max_marks: string;
  passing_marks: string;
  expected_marks: string;
  status: ExamStatus;
  revision_progress: number;
  chapters_completed: string;
  chapters_total: string;
  notes: string;
};

const emptyForm: FormState = {
  subject: "",
  title: "",
  exam_type: "final",
  exam_date: "",
  exam_time: "",
  end_time: "",
  room: "",
  faculty: "",
  max_marks: "",
  passing_marks: "",
  expected_marks: "",
  status: "upcoming",
  revision_progress: 0,
  chapters_completed: "0",
  chapters_total: "0",
  notes: "",
};

const EXAM_TYPE_LABEL: Record<ExamType, string> = {
  internal: "Internal",
  mid_sem: "Mid Semester",
  practical: "Practical",
  viva: "Viva",
  final: "Final Exam",
  assignment_eval: "Assignment Eval",
  other: "Other",
};

function examDateTime(e: Pick<Exam, "exam_date" | "exam_time">) {
  const t = e.exam_time ?? "09:00:00";
  return new Date(`${e.exam_date}T${t.length === 5 ? t + ":00" : t}`);
}

function urgencyFromMs(ms: number) {
  const days = ms / (1000 * 60 * 60 * 24);
  if (ms <= 0) return { tone: "muted" as const };
  if (days < 1) return { tone: "destructive" as const };
  if (days < 3) return { tone: "destructive" as const };
  if (days < 7) return { tone: "warning" as const };
  if (days < 30) return { tone: "primary" as const };
  return { tone: "success" as const };
}

function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

function countdownLabel(target: Date, now: Date) {
  const ms = differenceInMilliseconds(target, now);
  if (ms <= -2 * 60 * 60 * 1000) return { text: "Exam finished", tone: "muted" as const };
  if (ms <= 0) return { text: "Happening now", tone: "destructive" as const };
  const totalMin = Math.floor(ms / 60000);
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin - days * 60 * 24) / 60);
  const mins = totalMin - days * 60 * 24 - hours * 60;
  if (isToday(target)) return { text: `Today · ${hours}h ${mins}m`, tone: "destructive" as const };
  if (days === 1) return { text: `Tomorrow · ${hours}h`, tone: "destructive" as const };
  if (days < 7) return { text: `${days} days left`, tone: "warning" as const };
  if (days < 30) return { text: `${days} days left`, tone: "primary" as const };
  return { text: `${days} days left`, tone: "success" as const };
}

function ExamsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const now = useNow(30_000);

  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("upcoming");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_asc");
  const [view, setView] = useState<"cards" | "calendar" | "agenda">("cards");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [calendarMode, setCalendarMode] = useState<"month" | "week">("month");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ["exams", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .order("exam_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Exam[];
    },
  });

  // Auto-mark past exams as missed if still upcoming (client-side helper).
  useEffect(() => {
    exams.forEach((e) => {
      if (e.status === "upcoming") {
        const dt = examDateTime(e);
        if (differenceInMilliseconds(now, dt) > 6 * 60 * 60 * 1000) {
          // no-op; keep upcoming label unless user acts. Show "missed" via computed status below.
        }
      }
    });
  }, [exams, now]);

  const subjects = useMemo(() => {
    const set = new Set<string>();
    exams.forEach((e) => e.subject && set.add(e.subject));
    return Array.from(set).sort();
  }, [exams]);

  const enriched = useMemo(
    () =>
      exams.map((e) => {
        const dt = examDateTime(e);
        let computed: ExamStatus = e.status;
        if (e.status !== "completed") {
          if (differenceInMilliseconds(now, dt) > 6 * 60 * 60 * 1000) computed = "missed";
          else computed = "upcoming";
        }
        return { ...e, _dt: dt, _computedStatus: computed };
      }),
    [exams, now],
  );

  const counts = useMemo(() => {
    let upcoming = 0,
      today = 0,
      completed = 0,
      missed = 0;
    let prepSum = 0;
    enriched.forEach((e) => {
      if (e._computedStatus === "completed") completed++;
      else if (e._computedStatus === "missed") missed++;
      else upcoming++;
      if (isToday(e._dt)) today++;
      prepSum += e.revision_progress ?? 0;
    });
    const avg = enriched.length ? Math.round(prepSum / enriched.length) : 0;
    return { upcoming, today, completed, missed, total: enriched.length, avg };
  }, [enriched]);

  const nextExam = useMemo(
    () =>
      enriched
        .filter((e) => e._computedStatus === "upcoming")
        .sort((a, b) => a._dt.getTime() - b._dt.getTime())[0] ?? null,
    [enriched],
  );

  const filtered = useMemo(() => {
    let list = enriched.slice();
    if (statusFilter !== "all") list = list.filter((e) => e._computedStatus === statusFilter);
    if (subjectFilter !== "all") list = list.filter((e) => e.subject === subjectFilter);
    if (typeFilter !== "all") list = list.filter((e) => e.exam_type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.subject.toLowerCase().includes(q) ||
          (e.title ?? "").toLowerCase().includes(q) ||
          (e.room ?? "").toLowerCase().includes(q) ||
          (e.faculty ?? "").toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      if (sortBy === "date_desc") return b._dt.getTime() - a._dt.getTime();
      if (sortBy === "subject") return a.subject.localeCompare(b.subject);
      return a._dt.getTime() - b._dt.getTime();
    });
    return list;
  }, [enriched, statusFilter, subjectFilter, typeFilter, search, sortBy]);

  const upsert = useMutation({
    mutationFn: async (f: FormState) => {
      if (!user) throw new Error("Not signed in");
      if (!f.subject.trim()) throw new Error("Subject is required");
      if (!f.exam_date) throw new Error("Date is required");
      const payload = {
        user_id: user.id,
        subject: f.subject.trim(),
        title: f.title.trim() || null,
        exam_type: f.exam_type,
        exam_date: f.exam_date,
        exam_time: f.exam_time || null,
        end_time: f.end_time || null,
        room: f.room.trim() || null,
        faculty: f.faculty.trim() || null,
        max_marks: f.max_marks ? Number(f.max_marks) : null,
        passing_marks: f.passing_marks ? Number(f.passing_marks) : null,
        expected_marks: f.expected_marks ? Number(f.expected_marks) : null,
        status: f.status,
        revision_progress: f.revision_progress,
        chapters_completed: Number(f.chapters_completed) || 0,
        chapters_total: Number(f.chapters_total) || 0,
        notes: f.notes.trim() || null,
      };
      if (f.id) {
        const { error } = await supabase.from("exams").update(payload).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("exams").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: (_d, f) => {
      qc.invalidateQueries({ queryKey: ["exams"] });
      qc.invalidateQueries({ queryKey: ["exams-dashboard"] });
      setDialogOpen(false);
      setForm(emptyForm);
      toast.success(f.id ? "Exam updated" : "Exam added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const patch = useMutation({
    mutationFn: async ({ id, changes }: { id: string; changes: Partial<Exam> }) => {
      const { error } = await supabase.from("exams").update(changes).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exams"] });
      qc.invalidateQueries({ queryKey: ["exams-dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const duplicate = useMutation({
    mutationFn: async (e: Exam) => {
      if (!user) throw new Error("Not signed in");
      const { id, created_at, updated_at, ...rest } = e;
      void id;
      void created_at;
      void updated_at;
      const { error } = await supabase.from("exams").insert({ ...rest, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam duplicated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("exams").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exams"] });
      qc.invalidateQueries({ queryKey: ["exams-dashboard"] });
      setDeleteId(null);
      toast.success("Exam deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openCreate = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (e: Exam) => {
    setForm({
      id: e.id,
      subject: e.subject,
      title: e.title ?? "",
      exam_type: e.exam_type,
      exam_date: e.exam_date,
      exam_time: e.exam_time ? e.exam_time.slice(0, 5) : "",
      end_time: e.end_time ? e.end_time.slice(0, 5) : "",
      room: e.room ?? "",
      faculty: e.faculty ?? "",
      max_marks: e.max_marks?.toString() ?? "",
      passing_marks: e.passing_marks?.toString() ?? "",
      expected_marks: e.expected_marks?.toString() ?? "",
      status: e.status,
      revision_progress: e.revision_progress ?? 0,
      chapters_completed: (e.chapters_completed ?? 0).toString(),
      chapters_total: (e.chapters_total ?? 0).toString(),
      notes: e.notes ?? "",
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exam Planner</h1>
          <p className="text-sm text-muted-foreground">
            Countdowns, prep progress and a calendar for every exam.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="hidden gradient-primary text-primary-foreground shadow-glow sm:inline-flex"
        >
          <Plus className="mr-1.5 h-4 w-4" /> New exam
        </Button>
      </div>

      {/* Next exam hero */}
      {nextExam && (
        <NextExamHero exam={nextExam} now={now} />
      )}

      {/* Analytics */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total" value={counts.total} icon={GraduationCap} tone="primary" />
        <StatCard label="Upcoming" value={counts.upcoming} icon={CalendarIconLucide} tone="warning" />
        <StatCard label="Today" value={counts.today} icon={Clock} tone="destructive" />
        <StatCard label="Avg. prep" value={`${counts.avg}%`} icon={Sparkles} tone="success" />
      </div>

      {/* Toolbar */}
      <Card className="border-border/60 shadow-soft">
        <CardContent className="flex flex-col gap-3 p-3 md:p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by subject, title, room…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
              <TabsList>
                <TabsTrigger value="cards" className="gap-1.5">
                  <LayoutGrid className="h-3.5 w-3.5" />Cards
                </TabsTrigger>
                <TabsTrigger value="calendar" className="gap-1.5">
                  <CalendarIconLucide className="h-3.5 w-3.5" />Calendar
                </TabsTrigger>
                <TabsTrigger value="agenda" className="gap-1.5">
                  <ListIcon className="h-3.5 w-3.5" />Agenda
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterIcon className="h-4 w-4 text-muted-foreground" />
            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Status"
              options={[
                { v: "upcoming", l: "Upcoming" },
                { v: "all", l: "All" },
                { v: "completed", l: "Completed" },
                { v: "missed", l: "Missed" },
              ]}
            />
            <FilterSelect
              value={typeFilter}
              onChange={setTypeFilter}
              placeholder="Type"
              options={[
                { v: "all", l: "All types" },
                ...(Object.keys(EXAM_TYPE_LABEL) as ExamType[]).map((k) => ({
                  v: k,
                  l: EXAM_TYPE_LABEL[k],
                })),
              ]}
            />
            <FilterSelect
              value={subjectFilter}
              onChange={setSubjectFilter}
              placeholder="Subject"
              options={[{ v: "all", l: "All subjects" }, ...subjects.map((s) => ({ v: s, l: s }))]}
            />
            <div className="ml-auto">
              <FilterSelect
                value={sortBy}
                onChange={setSortBy}
                placeholder="Sort"
                options={[
                  { v: "date_asc", l: "Date ↑" },
                  { v: "date_desc", l: "Date ↓" },
                  { v: "subject", l: "Subject (A–Z)" },
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Body */}
      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <EmptyState onAdd={openCreate} />
      ) : view === "cards" ? (
        filtered.length === 0 ? (
          <FilteredEmpty />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((e) => (
              <ExamCard
                key={e.id}
                e={e}
                now={now}
                onEdit={() => openEdit(e)}
                onDelete={() => setDeleteId(e.id)}
                onDuplicate={() => duplicate.mutate(e)}
                onToggleComplete={() =>
                  patch.mutate({
                    id: e.id,
                    changes: {
                      status: e._computedStatus === "completed" ? "upcoming" : "completed",
                      revision_progress: e._computedStatus === "completed" ? e.revision_progress : 100,
                    },
                  })
                }
                onProgress={(v) =>
                  patch.mutate({ id: e.id, changes: { revision_progress: v } })
                }
              />
            ))}
          </div>
        )
      ) : view === "agenda" ? (
        <AgendaView items={filtered} onEdit={openEdit} now={now} />
      ) : (
        <CalendarView
          items={enriched}
          month={calendarMonth}
          onPrev={() => setCalendarMonth((m) => subMonths(m, 1))}
          onNext={() => setCalendarMonth((m) => addMonths(m, 1))}
          mode={calendarMode}
          onModeChange={setCalendarMode}
          onSelectDay={setSelectedDay}
        />
      )}

      {/* Mobile FAB */}
      <Button
        onClick={openCreate}
        size="icon"
        className="fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full gradient-primary text-primary-foreground shadow-glow sm:hidden"
        aria-label="Add exam"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit exam" : "New exam"}</DialogTitle>
            <DialogDescription>
              {form.id ? "Update the details below." : "Add an exam to your planner."}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              upsert.mutate(form);
            }}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  list="exam-subjects"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Physics"
                  required
                />
                <datalist id="exam-subjects">
                  {subjects.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="title">Exam title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Physics Final"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={form.exam_type}
                  onValueChange={(v) => setForm({ ...form, exam_type: v as ExamType })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(EXAM_TYPE_LABEL) as ExamType[]).map((k) => (
                      <SelectItem key={k} value={k}>{EXAM_TYPE_LABEL[k]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as ExamStatus })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="exam_date">Date *</Label>
                <Input
                  id="exam_date"
                  type="date"
                  value={form.exam_date}
                  onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exam_time">Start</Label>
                <Input
                  id="exam_time"
                  type="time"
                  value={form.exam_time}
                  onChange={(e) => setForm({ ...form, exam_time: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end_time">End</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="room">Room / Hall</Label>
                <Input
                  id="room"
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  placeholder="e.g. Hall B-204"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="faculty">Faculty</Label>
                <Input
                  id="faculty"
                  value={form.faculty}
                  onChange={(e) => setForm({ ...form, faculty: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Max marks</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={form.max_marks}
                  onChange={(e) => setForm({ ...form, max_marks: e.target.value })}
                  placeholder="100"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Passing</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={form.passing_marks}
                  onChange={(e) => setForm({ ...form, passing_marks: e.target.value })}
                  placeholder="40"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Expected</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={form.expected_marks}
                  onChange={(e) => setForm({ ...form, expected_marks: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="space-y-2 rounded-xl border border-dashed p-3">
              <div className="flex items-center justify-between">
                <Label>Preparation</Label>
                <span className="text-sm font-semibold text-primary">{form.revision_progress}%</span>
              </div>
              <Slider
                value={[form.revision_progress]}
                min={0}
                max={100}
                step={5}
                onValueChange={(v) => setForm({ ...form, revision_progress: v[0] ?? 0 })}
              />
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <Label>Chapters done</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={form.chapters_completed}
                    onChange={(e) => setForm({ ...form, chapters_completed: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Total chapters</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={form.chapters_total}
                    onChange={(e) => setForm({ ...form, chapters_total: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Syllabus, formulas, focus areas…"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={upsert.isPending}
                className="gradient-primary text-primary-foreground"
              >
                {upsert.isPending ? "Saving…" : form.id ? "Save changes" : "Add exam"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Selected day dialog */}
      <Dialog open={!!selectedDay} onOpenChange={(o) => !o && setSelectedDay(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDay ? format(selectedDay, "EEEE, MMM d, yyyy") : ""}
            </DialogTitle>
            <DialogDescription>Exams scheduled on this day</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {selectedDay &&
              enriched
                .filter((e) => isSameDay(e._dt, selectedDay))
                .map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 rounded-xl border p-3"
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {e.title ?? e.subject}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {e.subject} · {e.exam_time ? format(e._dt, "h:mm a") : "All day"}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {EXAM_TYPE_LABEL[e.exam_type]}
                    </Badge>
                  </div>
                ))}
            {selectedDay &&
              enriched.filter((e) => isSameDay(e._dt, selectedDay)).length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No exams on this day.
                </p>
              )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this exam?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && remove.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "warning" | "destructive" | "success";
}) {
  const bg = {
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/10 text-destructive",
    success: "bg-success/10 text-success",
  }[tone];
  return (
    <Card className="border-border/60 shadow-soft">
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
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { v: string; l: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-auto min-w-[130px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function NextExamHero({
  exam,
  now,
}: {
  exam: Exam & { _dt: Date };
  now: Date;
}) {
  const ms = differenceInMilliseconds(exam._dt, now);
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin - days * 60 * 24) / 60);
  const mins = totalMin - days * 60 * 24 - hours * 60;
  const urgency = urgencyFromMs(ms);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border bg-card p-6 shadow-soft md:p-8"
    >
      <div className="pointer-events-none absolute inset-0 gradient-hero opacity-80" />
      <div className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-card/70 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
            <Bell className="h-3 w-3 text-primary" /> Next exam
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
            {exam.title ?? exam.subject}
          </h2>
          <p className="text-sm text-muted-foreground">
            {exam.subject} · {EXAM_TYPE_LABEL[exam.exam_type]}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarIconLucide className="h-4 w-4" />
              {format(exam._dt, "MMM d, yyyy")}
            </span>
            {exam.exam_time && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {format(exam._dt, "h:mm a")}
              </span>
            )}
            {exam.room && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {exam.room}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-end gap-4">
          <CountdownUnit value={days} label="Days" tone={urgency.tone} />
          <CountdownUnit value={hours} label="Hours" tone={urgency.tone} />
          <CountdownUnit value={mins} label="Min" tone={urgency.tone} />
        </div>
      </div>
    </motion.div>
  );
}

function CountdownUnit({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "muted" | "destructive" | "warning" | "primary" | "success";
}) {
  const color = {
    muted: "text-muted-foreground",
    destructive: "text-destructive",
    warning: "text-warning",
    primary: "text-primary",
    success: "text-success",
  }[tone];
  return (
    <div className="text-center">
      <div className={cn("text-3xl font-bold tabular-nums md:text-4xl", color)}>
        {value.toString().padStart(2, "0")}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function ExamCard({
  e,
  now,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleComplete,
  onProgress,
}: {
  e: Exam & { _dt: Date; _computedStatus: ExamStatus };
  now: Date;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleComplete: () => void;
  onProgress: (v: number) => void;
}) {
  const cd = countdownLabel(e._dt, now);
  const statusStyles: Record<ExamStatus, string> = {
    upcoming: "border-primary/30 bg-primary/10 text-primary",
    completed: "border-success/30 bg-success/10 text-success",
    missed: "border-destructive/30 bg-destructive/10 text-destructive",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group h-full overflow-hidden border-border/60 shadow-soft transition hover:shadow-elevated">
        <CardContent className="flex h-full flex-col gap-4 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn("text-[10px]", statusStyles[e._computedStatus])}
                >
                  {e._computedStatus}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {EXAM_TYPE_LABEL[e.exam_type]}
                </Badge>
              </div>
              <h3 className="mt-2 truncate text-base font-semibold">
                {e.title ?? e.subject}
              </h3>
              <p className="text-xs text-muted-foreground">{e.subject}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="mr-2 h-4 w-4" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleComplete}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {e._computedStatus === "completed" ? "Mark upcoming" : "Mark completed"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CalendarIconLucide className="h-3.5 w-3.5" />
              {format(e._dt, "EEE, MMM d")}
              {e.exam_time && <> · {format(e._dt, "h:mm a")}</>}
            </div>
            {e.room && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {e.room}
              </div>
            )}
          </div>

          <div
            className={cn(
              "rounded-xl border px-3 py-2 text-sm font-medium",
              cd.tone === "destructive" && "border-destructive/30 bg-destructive/10 text-destructive",
              cd.tone === "warning" && "border-warning/30 bg-warning/15 text-warning",
              cd.tone === "primary" && "border-primary/30 bg-primary/10 text-primary",
              cd.tone === "success" && "border-success/30 bg-success/10 text-success",
              cd.tone === "muted" && "border-border bg-muted/40 text-muted-foreground",
            )}
          >
            ⏳ {cd.text}
          </div>

          <div className="mt-auto space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Preparation</span>
              <span className="font-semibold text-primary">{e.revision_progress}%</span>
            </div>
            <Progress value={e.revision_progress} />
            <Slider
              value={[e.revision_progress]}
              min={0}
              max={100}
              step={5}
              onValueChange={(v) => onProgress(v[0] ?? 0)}
              className="pt-1"
            />
            {e.chapters_total > 0 && (
              <div className="text-[11px] text-muted-foreground">
                Chapters: {e.chapters_completed}/{e.chapters_total}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AgendaView({
  items,
  onEdit,
  now,
}: {
  items: Array<Exam & { _dt: Date; _computedStatus: ExamStatus }>;
  onEdit: (e: Exam) => void;
  now: Date;
}) {
  if (items.length === 0) return <FilteredEmpty />;
  return (
    <Card className="border-border/60 shadow-soft">
      <ul className="divide-y">
        {items.map((e) => {
          const cd = countdownLabel(e._dt, now);
          return (
            <li key={e.id} className="flex items-center gap-3 p-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <div className="text-center leading-none">
                  <div className="text-[9px] uppercase text-primary/80">
                    {format(e._dt, "MMM")}
                  </div>
                  <div className="text-base font-bold">{format(e._dt, "d")}</div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">
                  {e.title ?? e.subject}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {e.subject} · {EXAM_TYPE_LABEL[e.exam_type]}
                  {e.exam_time && <> · {format(e._dt, "h:mm a")}</>}
                  {e.room && <> · {e.room}</>}
                </div>
              </div>
              <div className="hidden text-right sm:block">
                <div className="text-xs font-medium">{cd.text}</div>
                <Progress value={e.revision_progress} className="mt-1 h-1.5 w-24" />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(e)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function CalendarView({
  items,
  month,
  onPrev,
  onNext,
  mode,
  onModeChange,
  onSelectDay,
}: {
  items: Array<Exam & { _dt: Date; _computedStatus: ExamStatus }>;
  month: Date;
  onPrev: () => void;
  onNext: () => void;
  mode: "month" | "week";
  onModeChange: (m: "month" | "week") => void;
  onSelectDay: (d: Date) => void;
}) {
  const start = mode === "month" ? startOfWeek(startOfMonth(month)) : startOfWeek(month);
  const end = mode === "month" ? endOfWeek(endOfMonth(month)) : endOfWeek(month);
  const days: Date[] = [];
  let cur = start;
  while (cur <= end) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
  return (
    <Card className="border-border/60 shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-base">{format(month, "MMMM yyyy")}</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Tabs value={mode} onValueChange={(v) => onModeChange(v as "month" | "week")}>
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const dayExams = items.filter((e) => isSameDay(e._dt, d));
            const outside = mode === "month" && !isSameMonth(d, month);
            const today = isToday(d);
            return (
              <button
                key={d.toISOString()}
                onClick={() => onSelectDay(d)}
                className={cn(
                  "flex min-h-[68px] flex-col rounded-lg border p-1.5 text-left text-xs transition hover:border-primary/40 hover:bg-primary/5",
                  outside && "opacity-40",
                  today && "border-primary/50 bg-primary/5",
                )}
              >
                <span
                  className={cn(
                    "text-[11px] font-semibold",
                    today && "text-primary",
                  )}
                >
                  {format(d, "d")}
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {dayExams.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className={cn(
                        "block h-1.5 w-1.5 rounded-full",
                        e._computedStatus === "completed"
                          ? "bg-success"
                          : e._computedStatus === "missed"
                            ? "bg-destructive"
                            : "bg-primary",
                      )}
                    />
                  ))}
                  {dayExams.length > 3 && (
                    <span className="text-[9px] text-muted-foreground">+{dayExams.length - 3}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">
        <BookOpen className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">📚 No exams scheduled yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Stay ahead by adding your first exam.
      </p>
      <Button
        onClick={onAdd}
        size="lg"
        className="mt-6 gradient-primary text-primary-foreground shadow-glow"
      >
        <Plus className="mr-1.5 h-4 w-4" /> Add exam
      </Button>
    </div>
  );
}

function FilteredEmpty() {
  return (
    <div className="rounded-2xl border border-dashed py-10 text-center text-sm text-muted-foreground">
      No exams match your current filters.
    </div>
  );
}

// suppress unused import warnings for helpers used by wider surface
