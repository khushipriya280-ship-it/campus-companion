import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isToday, isPast, isTomorrow, differenceInCalendarDays } from "date-fns";
import {
  Plus,
  Search,
  BookOpen,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Archive,
  Pencil,
  Trash2,
  MoreVertical,
  LayoutGrid,
  List as ListIcon,
  Filter as FilterIcon,
  Flag,
  FileText,
  Inbox,
  ArchiveRestore,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/assignments")({
  head: () => ({ meta: [{ title: "Assignments · Campus Buddy" }] }),
  component: AssignmentsPage,
});

type Assignment = {
  id: string;
  user_id: string;
  title: string;
  subject: string | null;
  description: string | null;
  notes: string | null;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed" | "archived";
  progress: number;
  deadline: string | null;
  file_url: string | null;
  created_at: string;
  updated_at: string;
};

type FormState = {
  id?: string;
  title: string;
  subject: string;
  description: string;
  notes: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed" | "archived";
  due_date: string;
  due_time: string;
  file_url: string;
};

const emptyForm: FormState = {
  title: "",
  subject: "",
  description: "",
  notes: "",
  priority: "medium",
  status: "pending",
  due_date: "",
  due_time: "",
  file_url: "",
};

function AssignmentsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [sortBy, setSortBy] = useState<string>("deadline_asc");
  const [view, setView] = useState<"card" | "list">("card");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["assignments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Assignment[];
    },
  });

  const subjects = useMemo(() => {
    const set = new Set<string>();
    assignments.forEach((a) => a.subject && set.add(a.subject));
    return Array.from(set).sort();
  }, [assignments]);

  const counts = useMemo(() => {
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
  }, [assignments]);

  const filtered = useMemo(() => {
    let list = assignments.slice();
    if (statusFilter === "active") list = list.filter((a) => a.status !== "completed" && a.status !== "archived");
    else if (statusFilter !== "all") list = list.filter((a) => a.status === statusFilter);
    if (subjectFilter !== "all") list = list.filter((a) => (a.subject ?? "") === subjectFilter);
    if (priorityFilter !== "all") list = list.filter((a) => a.priority === priorityFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.subject ?? "").toLowerCase().includes(q) ||
          (a.description ?? "").toLowerCase().includes(q),
      );
    }
    const cmp = (a: Assignment, b: Assignment) => {
      switch (sortBy) {
        case "deadline_asc":
          return (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999");
        case "deadline_desc":
          return (b.deadline ?? "").localeCompare(a.deadline ?? "");
        case "priority": {
          const order = { high: 0, medium: 1, low: 2 } as const;
          return order[a.priority] - order[b.priority];
        }
        case "title":
          return a.title.localeCompare(b.title);
        case "created":
          return b.created_at.localeCompare(a.created_at);
        default:
          return 0;
      }
    };
    return list.sort(cmp);
  }, [assignments, statusFilter, subjectFilter, priorityFilter, search, sortBy]);

  const upsert = useMutation({
    mutationFn: async (f: FormState) => {
      if (!user) throw new Error("Not signed in");
      const deadline =
        f.due_date
          ? new Date(`${f.due_date}T${f.due_time || "23:59"}:00`).toISOString()
          : null;
      const payload = {
        user_id: user.id,
        title: f.title.trim(),
        subject: f.subject.trim() || null,
        description: f.description.trim() || null,
        notes: f.notes.trim() || null,
        priority: f.priority,
        status: f.status,
        deadline,
        file_url: f.file_url.trim() || null,
      };
      if (f.id) {
        const { error } = await supabase.from("assignments").update(payload).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("assignments").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: (_d, f) => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
      qc.invalidateQueries({ queryKey: ["assignments-dashboard"] });
      setDialogOpen(false);
      setForm(emptyForm);
      toast.success(f.id ? "Assignment updated" : "Assignment added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const patch = useMutation({
    mutationFn: async ({ id, changes }: { id: string; changes: Partial<Assignment> }) => {
      const { error } = await supabase.from("assignments").update(changes).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
      qc.invalidateQueries({ queryKey: ["assignments-dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("assignments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments"] });
      qc.invalidateQueries({ queryKey: ["assignments-dashboard"] });
      setDeleteId(null);
      toast.success("Assignment deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openCreate = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (a: Assignment) => {
    const d = a.deadline ? new Date(a.deadline) : null;
    setForm({
      id: a.id,
      title: a.title,
      subject: a.subject ?? "",
      description: a.description ?? "",
      notes: a.notes ?? "",
      priority: a.priority,
      status: a.status,
      due_date: d ? format(d, "yyyy-MM-dd") : "",
      due_time: d ? format(d, "HH:mm") : "",
      file_url: a.file_url ?? "",
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
          <p className="text-sm text-muted-foreground">
            Track, prioritise and ship every task on time.
          </p>
        </div>
        <Button onClick={openCreate} className="gradient-primary text-primary-foreground shadow-glow">
          <Plus className="mr-1.5 h-4 w-4" /> New assignment
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Due today" value={counts.dueToday} icon={Clock} tone="warning" />
        <StatCard label="Upcoming" value={counts.upcoming} icon={CalendarIcon} tone="primary" />
        <StatCard label="Overdue" value={counts.overdue} icon={Flag} tone="destructive" />
        <StatCard label="Completed" value={counts.completed} icon={CheckCircle2} tone="success" />
      </div>

      {/* Toolbar */}
      <Card className="border-border/60 shadow-soft">
        <CardContent className="flex flex-col gap-3 p-3 md:p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, subject or description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs value={view} onValueChange={(v) => setView(v as "card" | "list")}>
              <TabsList>
                <TabsTrigger value="card" className="gap-1.5"><LayoutGrid className="h-3.5 w-3.5" />Cards</TabsTrigger>
                <TabsTrigger value="list" className="gap-1.5"><ListIcon className="h-3.5 w-3.5" />List</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterIcon className="h-4 w-4 text-muted-foreground" />
            <FilterSelect value={statusFilter} onChange={setStatusFilter} placeholder="Status" options={[
              { v: "active", l: "Active" },
              { v: "all", l: "All" },
              { v: "pending", l: "Pending" },
              { v: "in_progress", l: "In progress" },
              { v: "completed", l: "Completed" },
              { v: "archived", l: "Archived" },
            ]} />
            <FilterSelect value={priorityFilter} onChange={setPriorityFilter} placeholder="Priority" options={[
              { v: "all", l: "All priorities" },
              { v: "high", l: "High" },
              { v: "medium", l: "Medium" },
              { v: "low", l: "Low" },
            ]} />
            <FilterSelect value={subjectFilter} onChange={setSubjectFilter} placeholder="Subject" options={[
              { v: "all", l: "All subjects" },
              ...subjects.map((s) => ({ v: s, l: s })),
            ]} />
            <div className="ml-auto">
              <FilterSelect value={sortBy} onChange={setSortBy} placeholder="Sort" options={[
                { v: "deadline_asc", l: "Deadline ↑" },
                { v: "deadline_desc", l: "Deadline ↓" },
                { v: "priority", l: "Priority" },
                { v: "title", l: "Title (A–Z)" },
                { v: "created", l: "Recently added" },
              ]} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState onAdd={openCreate} hasAny={assignments.length > 0} />
      ) : view === "card" ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((a) => (
              <AssignmentCard
                key={a.id}
                a={a}
                onEdit={() => openEdit(a)}
                onDelete={() => setDeleteId(a.id)}
                onToggleComplete={() =>
                  patch.mutate({
                    id: a.id,
                    changes: {
                      status: a.status === "completed" ? "pending" : "completed",
                      progress: a.status === "completed" ? 0 : 100,
                    },
                  })
                }
                onArchive={() =>
                  patch.mutate({
                    id: a.id,
                    changes: { status: a.status === "archived" ? "pending" : "archived" },
                  })
                }
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="border-border/60 shadow-soft">
          <ul className="divide-y">
            <AnimatePresence mode="popLayout">
              {filtered.map((a) => (
                <AssignmentRow
                  key={a.id}
                  a={a}
                  onEdit={() => openEdit(a)}
                  onDelete={() => setDeleteId(a.id)}
                  onToggleComplete={() =>
                    patch.mutate({
                      id: a.id,
                      changes: {
                        status: a.status === "completed" ? "pending" : "completed",
                        progress: a.status === "completed" ? 0 : 100,
                      },
                    })
                  }
                  onArchive={() =>
                    patch.mutate({
                      id: a.id,
                      changes: { status: a.status === "archived" ? "pending" : "archived" },
                    })
                  }
                />
              ))}
            </AnimatePresence>
          </ul>
        </Card>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit assignment" : "New assignment"}</DialogTitle>
            <DialogDescription>
              {form.id ? "Update the details below." : "Add a new task to your tracker."}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.title.trim()) {
                toast.error("Title is required");
                return;
              }
              upsert.mutate(form);
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. DBMS lab report"
                maxLength={200}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  list="subject-suggestions"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. DBMS"
                  maxLength={100}
                />
                <datalist id="subject-suggestions">
                  {subjects.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="priority">Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as FormState["priority"] })}>
                  <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-1">
                <Label htmlFor="due_date">Due date</Label>
                <Input id="due_date" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              </div>
              <div className="space-y-1.5 sm:col-span-1">
                <Label htmlFor="due_time">Due time</Label>
                <Input id="due_time" type="time" value={form.due_time} onChange={(e) => setForm({ ...form, due_time: e.target.value })} />
              </div>
              <div className="space-y-1.5 sm:col-span-1">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as FormState["status"] })}>
                  <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What needs to be done?"
                rows={3}
                maxLength={2000}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Anything else to remember"
                rows={2}
                maxLength={2000}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="file_url">Attachment link (optional)</Label>
              <Input
                id="file_url"
                type="url"
                value={form.file_url}
                onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                placeholder="https://…"
                maxLength={500}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={upsert.isPending} className="gradient-primary text-primary-foreground">
                {upsert.isPending ? "Saving…" : form.id ? "Save changes" : "Create assignment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action can't be undone. The assignment will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && remove.mutate(deleteId)}
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

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-border/60 shadow-soft">
        <CardContent className="flex items-center gap-3 p-4">
          <div className={cn("grid h-10 w-10 place-items-center rounded-xl", bg)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold leading-tight">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
  placeholder: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-auto min-w-[140px] gap-2 text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.v} value={o.v}>
            {o.l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function priorityBadge(p: Assignment["priority"]) {
  const map = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-warning/15 text-warning border-warning/20",
    low: "bg-success/10 text-success border-success/20",
  } as const;
  return map[p];
}

function statusBadge(s: Assignment["status"]) {
  const map = {
    pending: "bg-muted text-muted-foreground border-border",
    in_progress: "bg-info/10 text-info border-info/20",
    completed: "bg-success/10 text-success border-success/20",
    archived: "bg-muted text-muted-foreground border-border",
  } as const;
  return map[s];
}

function statusLabel(s: Assignment["status"]) {
  return { pending: "Pending", in_progress: "In progress", completed: "Completed", archived: "Archived" }[s];
}

function dueLabel(deadline: string | null) {
  if (!deadline) return { text: "No deadline", tone: "muted" as const };
  const d = new Date(deadline);
  const now = new Date();
  if (isToday(d)) return { text: `Today · ${format(d, "h:mm a")}`, tone: "warning" as const };
  if (isTomorrow(d)) return { text: `Tomorrow · ${format(d, "h:mm a")}`, tone: "primary" as const };
  if (d < now) {
    const days = Math.abs(differenceInCalendarDays(d, now));
    return { text: `Overdue · ${days}d ago`, tone: "destructive" as const };
  }
  const days = differenceInCalendarDays(d, now);
  if (days <= 7) return { text: `In ${days}d · ${format(d, "EEE")}`, tone: "primary" as const };
  return { text: format(d, "MMM d, yyyy"), tone: "muted" as const };
}

const dueToneClass = {
  muted: "text-muted-foreground",
  warning: "text-warning",
  primary: "text-primary",
  destructive: "text-destructive",
} as const;

function AssignmentCard({
  a,
  onEdit,
  onDelete,
  onToggleComplete,
  onArchive,
}: {
  a: Assignment;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  onArchive: () => void;
}) {
  const due = dueLabel(a.deadline);
  const done = a.status === "completed";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn("group h-full border-border/60 shadow-soft transition hover:shadow-elevated", done && "opacity-70")}>
        <CardContent className="flex h-full flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className={cn("border", priorityBadge(a.priority))}>
                <Flag className="mr-1 h-3 w-3" />
                {a.priority}
              </Badge>
              {a.subject && (
                <Badge variant="outline" className="border bg-primary/5 text-primary">{a.subject}</Badge>
              )}
            </div>
            <RowMenu onEdit={onEdit} onDelete={onDelete} onArchive={onArchive} archived={a.status === "archived"} />
          </div>
          <div>
            <h3 className={cn("text-base font-semibold leading-snug", done && "line-through")}>{a.title}</h3>
            {a.description && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.description}</p>
            )}
          </div>
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <div className={cn("inline-flex items-center gap-1.5 text-xs font-medium", dueToneClass[due.tone])}>
              <Clock className="h-3.5 w-3.5" /> {due.text}
            </div>
            <Badge variant="outline" className={cn("border text-[10px]", statusBadge(a.status))}>
              {statusLabel(a.status)}
            </Badge>
          </div>
          <Button
            variant={done ? "outline" : "secondary"}
            size="sm"
            className="w-full gap-1.5"
            onClick={onToggleComplete}
          >
            <CheckCircle2 className="h-4 w-4" />
            {done ? "Mark as pending" : "Mark complete"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AssignmentRow({
  a,
  onEdit,
  onDelete,
  onToggleComplete,
  onArchive,
}: {
  a: Assignment;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  onArchive: () => void;
}) {
  const due = dueLabel(a.deadline);
  const done = a.status === "completed";
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.18 }}
      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40"
    >
      <button
        onClick={onToggleComplete}
        className={cn(
          "grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition",
          done ? "border-success bg-success text-success-foreground" : "border-muted-foreground/40 hover:border-primary",
        )}
        aria-label="Toggle complete"
      >
        {done && <CheckCircle2 className="h-3.5 w-3.5" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("truncate text-sm font-medium", done && "line-through text-muted-foreground")}>
            {a.title}
          </span>
          <Badge variant="outline" className={cn("border text-[10px]", priorityBadge(a.priority))}>
            {a.priority}
          </Badge>
          {a.subject && <span className="text-xs text-muted-foreground">· {a.subject}</span>}
        </div>
        <div className={cn("mt-0.5 inline-flex items-center gap-1.5 text-xs", dueToneClass[due.tone])}>
          <Clock className="h-3 w-3" /> {due.text}
        </div>
      </div>
      <Badge variant="outline" className={cn("hidden border text-[10px] sm:inline-flex", statusBadge(a.status))}>
        {statusLabel(a.status)}
      </Badge>
      <RowMenu onEdit={onEdit} onDelete={onDelete} onArchive={onArchive} archived={a.status === "archived"} />
    </motion.li>
  );
}

function RowMenu({
  onEdit,
  onDelete,
  onArchive,
  archived,
}: {
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  archived: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onArchive}>
          {archived ? <ArchiveRestore className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
          {archived ? "Unarchive" : "Archive"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EmptyState({ onAdd, hasAny }: { onAdd: () => void; hasAny: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border bg-card p-10 text-center shadow-soft"
    >
      <div className="pointer-events-none absolute inset-0 gradient-hero opacity-60" />
      <div className="relative">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
          {hasAny ? <Inbox className="h-8 w-8" /> : <BookOpen className="h-8 w-8" />}
        </div>
        <h2 className="mt-6 text-xl font-semibold">
          {hasAny ? "Nothing matches those filters" : "No assignments yet"}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {hasAny
            ? "Try changing your search or filters — or add a brand new assignment."
            : "Add your first assignment to start tracking deadlines, priorities and progress."}
        </p>
        <div className="mt-6">
          <Button onClick={onAdd} className="gradient-primary text-primary-foreground shadow-glow">
            <Plus className="mr-1.5 h-4 w-4" /> New assignment
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Keep FileText import alive if linter is strict (used contextually for future attachments view)
void FileText;
