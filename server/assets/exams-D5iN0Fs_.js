import { t as supabase } from "./client-CjRwkL__.js";
import { n as useAuth } from "./use-auth-BE1JWkQ8.js";
import { t as cn } from "./utils-C_uf36nf.js";
import { t as Progress } from "./progress-DOIEKRJF.js";
import { t as Button } from "./button-BkEeRci-.js";
import { t as Input } from "./input-B8Q2ztVi.js";
import { t as Textarea } from "./textarea-kko37XEX.js";
import { t as Label } from "./label-DBD1bRRP.js";
import { t as Badge } from "./badge-D1Dupn2y.js";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BXjpJ96D.js";
import { _ as DialogDescription, a as AlertDialogContent, b as DialogTitle, c as AlertDialogHeader, d as SelectContent, f as SelectItem, g as DialogContent, h as Dialog, i as AlertDialogCancel, l as AlertDialogTitle, m as SelectValue, n as AlertDialog, o as AlertDialogDescription, p as SelectTrigger, r as AlertDialogAction, s as AlertDialogFooter, t as Skeleton, u as Select, v as DialogFooter, y as DialogHeader } from "./skeleton-C2rdUIQW.js";
import { a as DropdownMenuSeparator, n as DropdownMenuContent, o as DropdownMenuTrigger, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-BtjXROHi.js";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.js";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bell, BookOpen, Calendar, CheckCircle2, ChevronLeft, ChevronRight, Clock, Copy, Filter, GraduationCap, LayoutGrid, List, MapPin, MoreVertical, Pencil, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { addDays, addMonths, differenceInMilliseconds, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek, subMonths } from "date-fns";
import * as SliderPrimitive from "@radix-ui/react-slider";
//#region src/components/ui/slider.tsx
var Slider = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs(SliderPrimitive.Root, {
	ref,
	className: cn("relative flex w-full touch-none select-none items-center", className),
	...props,
	children: [/* @__PURE__ */ jsx(SliderPrimitive.Track, {
		className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20",
		children: /* @__PURE__ */ jsx(SliderPrimitive.Range, { className: "absolute h-full bg-primary" })
	}), /* @__PURE__ */ jsx(SliderPrimitive.Thumb, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" })]
}));
Slider.displayName = SliderPrimitive.Root.displayName;
//#endregion
//#region src/routes/_authenticated/exams.tsx?tsr-split=component
var emptyForm = {
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
	notes: ""
};
var EXAM_TYPE_LABEL = {
	internal: "Internal",
	mid_sem: "Mid Semester",
	practical: "Practical",
	viva: "Viva",
	final: "Final Exam",
	assignment_eval: "Assignment Eval",
	other: "Other"
};
function examDateTime(e) {
	const t = e.exam_time ?? "09:00:00";
	return /* @__PURE__ */ new Date(`${e.exam_date}T${t.length === 5 ? t + ":00" : t}`);
}
function urgencyFromMs(ms) {
	const days = ms / (1e3 * 60 * 60 * 24);
	if (ms <= 0) return { tone: "muted" };
	if (days < 1) return { tone: "destructive" };
	if (days < 3) return { tone: "destructive" };
	if (days < 7) return { tone: "warning" };
	if (days < 30) return { tone: "primary" };
	return { tone: "success" };
}
function useNow(intervalMs = 6e4) {
	const [now, setNow] = useState(() => /* @__PURE__ */ new Date());
	useEffect(() => {
		const id = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), intervalMs);
		return () => window.clearInterval(id);
	}, [intervalMs]);
	return now;
}
function countdownLabel(target, now) {
	const ms = differenceInMilliseconds(target, now);
	if (ms <= -7200 * 1e3) return {
		text: "Exam finished",
		tone: "muted"
	};
	if (ms <= 0) return {
		text: "Happening now",
		tone: "destructive"
	};
	const totalMin = Math.floor(ms / 6e4);
	const days = Math.floor(totalMin / 1440);
	const hours = Math.floor((totalMin - days * 60 * 24) / 60);
	const mins = totalMin - days * 60 * 24 - hours * 60;
	if (isToday(target)) return {
		text: `Today · ${hours}h ${mins}m`,
		tone: "destructive"
	};
	if (days === 1) return {
		text: `Tomorrow · ${hours}h`,
		tone: "destructive"
	};
	if (days < 7) return {
		text: `${days} days left`,
		tone: "warning"
	};
	if (days < 30) return {
		text: `${days} days left`,
		tone: "primary"
	};
	return {
		text: `${days} days left`,
		tone: "success"
	};
}
function ExamsPage() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const now = useNow(3e4);
	const [search, setSearch] = useState("");
	const [subjectFilter, setSubjectFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("upcoming");
	const [typeFilter, setTypeFilter] = useState("all");
	const [sortBy, setSortBy] = useState("date_asc");
	const [view, setView] = useState("cards");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [form, setForm] = useState(emptyForm);
	const [deleteId, setDeleteId] = useState(null);
	const [calendarMonth, setCalendarMonth] = useState(/* @__PURE__ */ new Date());
	const [calendarMode, setCalendarMode] = useState("month");
	const [selectedDay, setSelectedDay] = useState(null);
	const { data: exams = [], isLoading } = useQuery({
		queryKey: ["exams", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data, error } = await supabase.from("exams").select("*").order("exam_date", { ascending: true });
			if (error) throw error;
			return data ?? [];
		}
	});
	useEffect(() => {
		exams.forEach((e) => {
			if (e.status === "upcoming") {
				if (differenceInMilliseconds(now, examDateTime(e)) > 360 * 60 * 1e3) {}
			}
		});
	}, [exams, now]);
	const subjects = useMemo(() => {
		const set = /* @__PURE__ */ new Set();
		exams.forEach((e) => e.subject && set.add(e.subject));
		return Array.from(set).sort();
	}, [exams]);
	const enriched = useMemo(() => exams.map((e) => {
		const dt = examDateTime(e);
		let computed = e.status;
		if (e.status !== "completed") if (differenceInMilliseconds(now, dt) > 360 * 60 * 1e3) computed = "missed";
		else computed = "upcoming";
		return {
			...e,
			_dt: dt,
			_computedStatus: computed
		};
	}), [exams, now]);
	const counts = useMemo(() => {
		let upcoming = 0, today = 0, completed = 0, missed = 0;
		let prepSum = 0;
		enriched.forEach((e) => {
			if (e._computedStatus === "completed") completed++;
			else if (e._computedStatus === "missed") missed++;
			else upcoming++;
			if (isToday(e._dt)) today++;
			prepSum += e.revision_progress ?? 0;
		});
		const avg = enriched.length ? Math.round(prepSum / enriched.length) : 0;
		return {
			upcoming,
			today,
			completed,
			missed,
			total: enriched.length,
			avg
		};
	}, [enriched]);
	const nextExam = useMemo(() => enriched.filter((e) => e._computedStatus === "upcoming").sort((a, b) => a._dt.getTime() - b._dt.getTime())[0] ?? null, [enriched]);
	const filtered = useMemo(() => {
		let list = enriched.slice();
		if (statusFilter !== "all") list = list.filter((e) => e._computedStatus === statusFilter);
		if (subjectFilter !== "all") list = list.filter((e) => e.subject === subjectFilter);
		if (typeFilter !== "all") list = list.filter((e) => e.exam_type === typeFilter);
		if (search.trim()) {
			const q = search.toLowerCase();
			list = list.filter((e) => e.subject.toLowerCase().includes(q) || (e.title ?? "").toLowerCase().includes(q) || (e.room ?? "").toLowerCase().includes(q) || (e.faculty ?? "").toLowerCase().includes(q));
		}
		list.sort((a, b) => {
			if (sortBy === "date_desc") return b._dt.getTime() - a._dt.getTime();
			if (sortBy === "subject") return a.subject.localeCompare(b.subject);
			return a._dt.getTime() - b._dt.getTime();
		});
		return list;
	}, [
		enriched,
		statusFilter,
		subjectFilter,
		typeFilter,
		search,
		sortBy
	]);
	const upsert = useMutation({
		mutationFn: async (f) => {
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
				notes: f.notes.trim() || null
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
		onError: (e) => toast.error(e.message)
	});
	const patch = useMutation({
		mutationFn: async ({ id, changes }) => {
			const { error } = await supabase.from("exams").update(changes).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["exams"] });
			qc.invalidateQueries({ queryKey: ["exams-dashboard"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const duplicate = useMutation({
		mutationFn: async (e) => {
			if (!user) throw new Error("Not signed in");
			const { id, created_at, updated_at, ...rest } = e;
			const { error } = await supabase.from("exams").insert({
				...rest,
				user_id: user.id
			});
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["exams"] });
			toast.success("Exam duplicated");
		},
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("exams").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["exams"] });
			qc.invalidateQueries({ queryKey: ["exams-dashboard"] });
			setDeleteId(null);
			toast.success("Exam deleted");
		},
		onError: (e) => toast.error(e.message)
	});
	const openCreate = () => {
		setForm(emptyForm);
		setDialogOpen(true);
	};
	const openEdit = (e) => {
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
			notes: e.notes ?? ""
		});
		setDialogOpen(true);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6 pb-24 md:pb-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold tracking-tight",
					children: "Exam Planner"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-muted-foreground",
					children: "Countdowns, prep progress and a calendar for every exam."
				})] }), /* @__PURE__ */ jsxs(Button, {
					onClick: openCreate,
					className: "hidden gradient-primary text-primary-foreground shadow-glow sm:inline-flex",
					children: [/* @__PURE__ */ jsx(Plus, { className: "mr-1.5 h-4 w-4" }), " New exam"]
				})]
			}),
			nextExam && /* @__PURE__ */ jsx(NextExamHero, {
				exam: nextExam,
				now
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-2 gap-3 md:grid-cols-4",
				children: [
					/* @__PURE__ */ jsx(StatCard, {
						label: "Total",
						value: counts.total,
						icon: GraduationCap,
						tone: "primary"
					}),
					/* @__PURE__ */ jsx(StatCard, {
						label: "Upcoming",
						value: counts.upcoming,
						icon: Calendar,
						tone: "warning"
					}),
					/* @__PURE__ */ jsx(StatCard, {
						label: "Today",
						value: counts.today,
						icon: Clock,
						tone: "destructive"
					}),
					/* @__PURE__ */ jsx(StatCard, {
						label: "Avg. prep",
						value: `${counts.avg}%`,
						icon: Sparkles,
						tone: "success"
					})
				]
			}),
			/* @__PURE__ */ jsx(Card, {
				className: "border-border/60 shadow-soft",
				children: /* @__PURE__ */ jsxs(CardContent, {
					className: "flex flex-col gap-3 p-3 md:p-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex flex-col gap-2 md:flex-row md:items-center",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "relative flex-1",
							children: [/* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ jsx(Input, {
								placeholder: "Search by subject, title, room…",
								value: search,
								onChange: (e) => setSearch(e.target.value),
								className: "pl-9"
							})]
						}), /* @__PURE__ */ jsx(Tabs, {
							value: view,
							onValueChange: (v) => setView(v),
							children: /* @__PURE__ */ jsxs(TabsList, { children: [
								/* @__PURE__ */ jsxs(TabsTrigger, {
									value: "cards",
									className: "gap-1.5",
									children: [/* @__PURE__ */ jsx(LayoutGrid, { className: "h-3.5 w-3.5" }), "Cards"]
								}),
								/* @__PURE__ */ jsxs(TabsTrigger, {
									value: "calendar",
									className: "gap-1.5",
									children: [/* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }), "Calendar"]
								}),
								/* @__PURE__ */ jsxs(TabsTrigger, {
									value: "agenda",
									className: "gap-1.5",
									children: [/* @__PURE__ */ jsx(List, { className: "h-3.5 w-3.5" }), "Agenda"]
								})
							] })
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ jsx(Filter, { className: "h-4 w-4 text-muted-foreground" }),
							/* @__PURE__ */ jsx(FilterSelect, {
								value: statusFilter,
								onChange: setStatusFilter,
								placeholder: "Status",
								options: [
									{
										v: "upcoming",
										l: "Upcoming"
									},
									{
										v: "all",
										l: "All"
									},
									{
										v: "completed",
										l: "Completed"
									},
									{
										v: "missed",
										l: "Missed"
									}
								]
							}),
							/* @__PURE__ */ jsx(FilterSelect, {
								value: typeFilter,
								onChange: setTypeFilter,
								placeholder: "Type",
								options: [{
									v: "all",
									l: "All types"
								}, ...Object.keys(EXAM_TYPE_LABEL).map((k) => ({
									v: k,
									l: EXAM_TYPE_LABEL[k]
								}))]
							}),
							/* @__PURE__ */ jsx(FilterSelect, {
								value: subjectFilter,
								onChange: setSubjectFilter,
								placeholder: "Subject",
								options: [{
									v: "all",
									l: "All subjects"
								}, ...subjects.map((s) => ({
									v: s,
									l: s
								}))]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "ml-auto",
								children: /* @__PURE__ */ jsx(FilterSelect, {
									value: sortBy,
									onChange: setSortBy,
									placeholder: "Sort",
									options: [
										{
											v: "date_asc",
											l: "Date ↑"
										},
										{
											v: "date_desc",
											l: "Date ↓"
										},
										{
											v: "subject",
											l: "Subject (A–Z)"
										}
									]
								})
							})
						]
					})]
				})
			}),
			isLoading ? /* @__PURE__ */ jsx("div", {
				className: "grid gap-3 md:grid-cols-2 xl:grid-cols-3",
				children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-56 rounded-2xl" }, i))
			}) : exams.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { onAdd: openCreate }) : view === "cards" ? filtered.length === 0 ? /* @__PURE__ */ jsx(FilteredEmpty, {}) : /* @__PURE__ */ jsx("div", {
				className: "grid gap-3 md:grid-cols-2 xl:grid-cols-3",
				children: /* @__PURE__ */ jsx(AnimatePresence, {
					mode: "popLayout",
					children: filtered.map((e) => /* @__PURE__ */ jsx(ExamCard, {
						e,
						now,
						onEdit: () => openEdit(e),
						onDelete: () => setDeleteId(e.id),
						onDuplicate: () => duplicate.mutate(e),
						onToggleComplete: () => patch.mutate({
							id: e.id,
							changes: {
								status: e._computedStatus === "completed" ? "upcoming" : "completed",
								revision_progress: e._computedStatus === "completed" ? e.revision_progress : 100
							}
						}),
						onProgress: (v) => patch.mutate({
							id: e.id,
							changes: { revision_progress: v }
						})
					}, e.id))
				})
			}) : view === "agenda" ? /* @__PURE__ */ jsx(AgendaView, {
				items: filtered,
				onEdit: openEdit,
				now
			}) : /* @__PURE__ */ jsx(CalendarView, {
				items: enriched,
				month: calendarMonth,
				onPrev: () => setCalendarMonth((m) => subMonths(m, 1)),
				onNext: () => setCalendarMonth((m) => addMonths(m, 1)),
				mode: calendarMode,
				onModeChange: setCalendarMode,
				onSelectDay: setSelectedDay
			}),
			/* @__PURE__ */ jsx(Button, {
				onClick: openCreate,
				size: "icon",
				className: "fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full gradient-primary text-primary-foreground shadow-glow sm:hidden",
				"aria-label": "Add exam",
				children: /* @__PURE__ */ jsx(Plus, { className: "h-6 w-6" })
			}),
			/* @__PURE__ */ jsx(Dialog, {
				open: dialogOpen,
				onOpenChange: setDialogOpen,
				children: /* @__PURE__ */ jsxs(DialogContent, {
					className: "max-h-[92vh] overflow-y-auto sm:max-w-lg",
					children: [/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: form.id ? "Edit exam" : "New exam" }), /* @__PURE__ */ jsx(DialogDescription, { children: form.id ? "Update the details below." : "Add an exam to your planner." })] }), /* @__PURE__ */ jsxs("form", {
						className: "space-y-4",
						onSubmit: (e) => {
							e.preventDefault();
							upsert.mutate(form);
						},
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "space-y-1.5",
									children: [
										/* @__PURE__ */ jsx(Label, {
											htmlFor: "subject",
											children: "Subject *"
										}),
										/* @__PURE__ */ jsx(Input, {
											id: "subject",
											list: "exam-subjects",
											value: form.subject,
											onChange: (e) => setForm({
												...form,
												subject: e.target.value
											}),
											placeholder: "e.g. Physics",
											required: true
										}),
										/* @__PURE__ */ jsx("datalist", {
											id: "exam-subjects",
											children: subjects.map((s) => /* @__PURE__ */ jsx("option", { value: s }, s))
										})
									]
								}), /* @__PURE__ */ jsxs("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ jsx(Label, {
										htmlFor: "title",
										children: "Exam title"
									}), /* @__PURE__ */ jsx(Input, {
										id: "title",
										value: form.title,
										onChange: (e) => setForm({
											...form,
											title: e.target.value
										}),
										placeholder: "e.g. Physics Final"
									})]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ jsx(Label, { children: "Type" }), /* @__PURE__ */ jsxs(Select, {
										value: form.exam_type,
										onValueChange: (v) => setForm({
											...form,
											exam_type: v
										}),
										children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }), /* @__PURE__ */ jsx(SelectContent, { children: Object.keys(EXAM_TYPE_LABEL).map((k) => /* @__PURE__ */ jsx(SelectItem, {
											value: k,
											children: EXAM_TYPE_LABEL[k]
										}, k)) })]
									})]
								}), /* @__PURE__ */ jsxs("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ jsx(Label, { children: "Status" }), /* @__PURE__ */ jsxs(Select, {
										value: form.status,
										onValueChange: (v) => setForm({
											...form,
											status: v
										}),
										children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }), /* @__PURE__ */ jsxs(SelectContent, { children: [
											/* @__PURE__ */ jsx(SelectItem, {
												value: "upcoming",
												children: "Upcoming"
											}),
											/* @__PURE__ */ jsx(SelectItem, {
												value: "completed",
												children: "Completed"
											}),
											/* @__PURE__ */ jsx(SelectItem, {
												value: "missed",
												children: "Missed"
											})
										] })]
									})]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-1 gap-3 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ jsx(Label, {
											htmlFor: "exam_date",
											children: "Date *"
										}), /* @__PURE__ */ jsx(Input, {
											id: "exam_date",
											type: "date",
											value: form.exam_date,
											onChange: (e) => setForm({
												...form,
												exam_date: e.target.value
											}),
											required: true
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ jsx(Label, {
											htmlFor: "exam_time",
											children: "Start"
										}), /* @__PURE__ */ jsx(Input, {
											id: "exam_time",
											type: "time",
											value: form.exam_time,
											onChange: (e) => setForm({
												...form,
												exam_time: e.target.value
											})
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ jsx(Label, {
											htmlFor: "end_time",
											children: "End"
										}), /* @__PURE__ */ jsx(Input, {
											id: "end_time",
											type: "time",
											value: form.end_time,
											onChange: (e) => setForm({
												...form,
												end_time: e.target.value
											})
										})]
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ jsx(Label, {
										htmlFor: "room",
										children: "Room / Hall"
									}), /* @__PURE__ */ jsx(Input, {
										id: "room",
										value: form.room,
										onChange: (e) => setForm({
											...form,
											room: e.target.value
										}),
										placeholder: "e.g. Hall B-204"
									})]
								}), /* @__PURE__ */ jsxs("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ jsx(Label, {
										htmlFor: "faculty",
										children: "Faculty"
									}), /* @__PURE__ */ jsx(Input, {
										id: "faculty",
										value: form.faculty,
										onChange: (e) => setForm({
											...form,
											faculty: e.target.value
										}),
										placeholder: "Optional"
									})]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-1 gap-3 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ jsx(Label, { children: "Max marks" }), /* @__PURE__ */ jsx(Input, {
											type: "number",
											inputMode: "numeric",
											value: form.max_marks,
											onChange: (e) => setForm({
												...form,
												max_marks: e.target.value
											}),
											placeholder: "100"
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ jsx(Label, { children: "Passing" }), /* @__PURE__ */ jsx(Input, {
											type: "number",
											inputMode: "numeric",
											value: form.passing_marks,
											onChange: (e) => setForm({
												...form,
												passing_marks: e.target.value
											}),
											placeholder: "40"
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ jsx(Label, { children: "Expected" }), /* @__PURE__ */ jsx(Input, {
											type: "number",
											inputMode: "numeric",
											value: form.expected_marks,
											onChange: (e) => setForm({
												...form,
												expected_marks: e.target.value
											}),
											placeholder: "Optional"
										})]
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-2 rounded-xl border border-dashed p-3",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ jsx(Label, { children: "Preparation" }), /* @__PURE__ */ jsxs("span", {
											className: "text-sm font-semibold text-primary",
											children: [form.revision_progress, "%"]
										})]
									}),
									/* @__PURE__ */ jsx(Slider, {
										value: [form.revision_progress],
										min: 0,
										max: 100,
										step: 5,
										onValueChange: (v) => setForm({
											...form,
											revision_progress: v[0] ?? 0
										})
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "grid grid-cols-2 gap-3 pt-1",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ jsx(Label, { children: "Chapters done" }), /* @__PURE__ */ jsx(Input, {
												type: "number",
												inputMode: "numeric",
												value: form.chapters_completed,
												onChange: (e) => setForm({
													...form,
													chapters_completed: e.target.value
												})
											})]
										}), /* @__PURE__ */ jsxs("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ jsx(Label, { children: "Total chapters" }), /* @__PURE__ */ jsx(Input, {
												type: "number",
												inputMode: "numeric",
												value: form.chapters_total,
												onChange: (e) => setForm({
													...form,
													chapters_total: e.target.value
												})
											})]
										})]
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, {
									htmlFor: "notes",
									children: "Notes"
								}), /* @__PURE__ */ jsx(Textarea, {
									id: "notes",
									value: form.notes,
									onChange: (e) => setForm({
										...form,
										notes: e.target.value
									}),
									placeholder: "Syllabus, formulas, focus areas…",
									rows: 3
								})]
							}),
							/* @__PURE__ */ jsxs(DialogFooter, { children: [/* @__PURE__ */ jsx(Button, {
								type: "button",
								variant: "ghost",
								onClick: () => setDialogOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ jsx(Button, {
								type: "submit",
								disabled: upsert.isPending,
								className: "gradient-primary text-primary-foreground",
								children: upsert.isPending ? "Saving…" : form.id ? "Save changes" : "Add exam"
							})] })
						]
					})]
				})
			}),
			/* @__PURE__ */ jsx(Dialog, {
				open: !!selectedDay,
				onOpenChange: (o) => !o && setSelectedDay(null),
				children: /* @__PURE__ */ jsxs(DialogContent, {
					className: "sm:max-w-md",
					children: [/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: selectedDay ? format(selectedDay, "EEEE, MMM d, yyyy") : "" }), /* @__PURE__ */ jsx(DialogDescription, { children: "Exams scheduled on this day" })] }), /* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [selectedDay && enriched.filter((e) => isSameDay(e._dt, selectedDay)).map((e) => /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-3 rounded-xl border p-3",
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary",
									children: /* @__PURE__ */ jsx(GraduationCap, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ jsx("div", {
										className: "truncate text-sm font-medium",
										children: e.title ?? e.subject
									}), /* @__PURE__ */ jsxs("div", {
										className: "text-xs text-muted-foreground",
										children: [
											e.subject,
											" · ",
											e.exam_time ? format(e._dt, "h:mm a") : "All day"
										]
									})]
								}),
								/* @__PURE__ */ jsx(Badge, {
									variant: "outline",
									className: "text-[10px]",
									children: EXAM_TYPE_LABEL[e.exam_type]
								})
							]
						}, e.id)), selectedDay && enriched.filter((e) => isSameDay(e._dt, selectedDay)).length === 0 && /* @__PURE__ */ jsx("p", {
							className: "py-6 text-center text-sm text-muted-foreground",
							children: "No exams on this day."
						})]
					})]
				})
			}),
			/* @__PURE__ */ jsx(AlertDialog, {
				open: !!deleteId,
				onOpenChange: (o) => !o && setDeleteId(null),
				children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [/* @__PURE__ */ jsxs(AlertDialogHeader, { children: [/* @__PURE__ */ jsx(AlertDialogTitle, { children: "Delete this exam?" }), /* @__PURE__ */ jsx(AlertDialogDescription, { children: "This action cannot be undone." })] }), /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [/* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ jsx(AlertDialogAction, {
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					onClick: () => deleteId && remove.mutate(deleteId),
					children: "Delete"
				})] })] })
			})
		]
	});
}
function StatCard({ label, value, icon: Icon, tone }) {
	const bg = {
		primary: "bg-primary/10 text-primary",
		warning: "bg-warning/15 text-warning",
		destructive: "bg-destructive/10 text-destructive",
		success: "bg-success/10 text-success"
	}[tone];
	return /* @__PURE__ */ jsx(Card, {
		className: "border-border/60 shadow-soft",
		children: /* @__PURE__ */ jsxs(CardContent, {
			className: "flex items-center gap-3 p-4",
			children: [/* @__PURE__ */ jsx("div", {
				className: cn("grid h-10 w-10 place-items-center rounded-xl", bg),
				children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" })
			}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "text-xl font-bold leading-tight",
				children: value
			}), /* @__PURE__ */ jsx("div", {
				className: "text-xs text-muted-foreground",
				children: label
			})] })]
		})
	});
}
function FilterSelect({ value, onChange, placeholder, options }) {
	return /* @__PURE__ */ jsxs(Select, {
		value,
		onValueChange: onChange,
		children: [/* @__PURE__ */ jsx(SelectTrigger, {
			className: "h-9 w-auto min-w-[130px]",
			children: /* @__PURE__ */ jsx(SelectValue, { placeholder })
		}), /* @__PURE__ */ jsx(SelectContent, { children: options.map((o) => /* @__PURE__ */ jsx(SelectItem, {
			value: o.v,
			children: o.l
		}, o.v)) })]
	});
}
function NextExamHero({ exam, now }) {
	const ms = differenceInMilliseconds(exam._dt, now);
	const totalMin = Math.max(0, Math.floor(ms / 6e4));
	const days = Math.floor(totalMin / 1440);
	const hours = Math.floor((totalMin - days * 60 * 24) / 60);
	const mins = totalMin - days * 60 * 24 - hours * 60;
	const urgency = urgencyFromMs(ms);
	return /* @__PURE__ */ jsxs(motion.div, {
		initial: {
			opacity: 0,
			y: 12
		},
		animate: {
			opacity: 1,
			y: 0
		},
		className: "relative overflow-hidden rounded-3xl border bg-card p-6 shadow-soft md:p-8",
		children: [
			/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 gradient-hero opacity-80" }),
			/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" }),
			/* @__PURE__ */ jsxs("div", {
				className: "relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "inline-flex items-center gap-1.5 rounded-full bg-card/70 px-2.5 py-1 text-[11px] font-medium backdrop-blur",
							children: [/* @__PURE__ */ jsx(Bell, { className: "h-3 w-3 text-primary" }), " Next exam"]
						}),
						/* @__PURE__ */ jsx("h2", {
							className: "mt-2 text-2xl font-bold tracking-tight md:text-3xl",
							children: exam.title ?? exam.subject
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "text-sm text-muted-foreground",
							children: [
								exam.subject,
								" · ",
								EXAM_TYPE_LABEL[exam.exam_type]
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground",
							children: [
								/* @__PURE__ */ jsxs("span", {
									className: "inline-flex items-center gap-1.5",
									children: [/* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4" }), format(exam._dt, "MMM d, yyyy")]
								}),
								exam.exam_time && /* @__PURE__ */ jsxs("span", {
									className: "inline-flex items-center gap-1.5",
									children: [/* @__PURE__ */ jsx(Clock, { className: "h-4 w-4" }), format(exam._dt, "h:mm a")]
								}),
								exam.room && /* @__PURE__ */ jsxs("span", {
									className: "inline-flex items-center gap-1.5",
									children: [/* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4" }), exam.room]
								})
							]
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-end gap-4",
					children: [
						/* @__PURE__ */ jsx(CountdownUnit, {
							value: days,
							label: "Days",
							tone: urgency.tone
						}),
						/* @__PURE__ */ jsx(CountdownUnit, {
							value: hours,
							label: "Hours",
							tone: urgency.tone
						}),
						/* @__PURE__ */ jsx(CountdownUnit, {
							value: mins,
							label: "Min",
							tone: urgency.tone
						})
					]
				})]
			})
		]
	});
}
function CountdownUnit({ value, label, tone }) {
	const color = {
		muted: "text-muted-foreground",
		destructive: "text-destructive",
		warning: "text-warning",
		primary: "text-primary",
		success: "text-success"
	}[tone];
	return /* @__PURE__ */ jsxs("div", {
		className: "text-center",
		children: [/* @__PURE__ */ jsx("div", {
			className: cn("text-3xl font-bold tabular-nums md:text-4xl", color),
			children: value.toString().padStart(2, "0")
		}), /* @__PURE__ */ jsx("div", {
			className: "text-[10px] uppercase tracking-wider text-muted-foreground",
			children: label
		})]
	});
}
function ExamCard({ e, now, onEdit, onDelete, onDuplicate, onToggleComplete, onProgress }) {
	const cd = countdownLabel(e._dt, now);
	return /* @__PURE__ */ jsx(motion.div, {
		layout: true,
		initial: {
			opacity: 0,
			y: 8
		},
		animate: {
			opacity: 1,
			y: 0
		},
		exit: {
			opacity: 0,
			y: -8
		},
		transition: { duration: .2 },
		children: /* @__PURE__ */ jsx(Card, {
			className: "group h-full overflow-hidden border-border/60 shadow-soft transition hover:shadow-elevated",
			children: /* @__PURE__ */ jsxs(CardContent, {
				className: "flex h-full flex-col gap-4 p-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ jsx(Badge, {
										variant: "outline",
										className: cn("text-[10px]", {
											upcoming: "border-primary/30 bg-primary/10 text-primary",
											completed: "border-success/30 bg-success/10 text-success",
											missed: "border-destructive/30 bg-destructive/10 text-destructive"
										}[e._computedStatus]),
										children: e._computedStatus
									}), /* @__PURE__ */ jsx(Badge, {
										variant: "outline",
										className: "text-[10px]",
										children: EXAM_TYPE_LABEL[e.exam_type]
									})]
								}),
								/* @__PURE__ */ jsx("h3", {
									className: "mt-2 truncate text-base font-semibold",
									children: e.title ?? e.subject
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-xs text-muted-foreground",
									children: e.subject
								})
							]
						}), /* @__PURE__ */ jsxs(DropdownMenu, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
							asChild: true,
							children: /* @__PURE__ */ jsx(Button, {
								variant: "ghost",
								size: "icon",
								className: "h-8 w-8",
								children: /* @__PURE__ */ jsx(MoreVertical, { className: "h-4 w-4" })
							})
						}), /* @__PURE__ */ jsxs(DropdownMenuContent, {
							align: "end",
							children: [
								/* @__PURE__ */ jsxs(DropdownMenuItem, {
									onClick: onEdit,
									children: [/* @__PURE__ */ jsx(Pencil, { className: "mr-2 h-4 w-4" }), " Edit"]
								}),
								/* @__PURE__ */ jsxs(DropdownMenuItem, {
									onClick: onDuplicate,
									children: [/* @__PURE__ */ jsx(Copy, { className: "mr-2 h-4 w-4" }), " Duplicate"]
								}),
								/* @__PURE__ */ jsxs(DropdownMenuItem, {
									onClick: onToggleComplete,
									children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "mr-2 h-4 w-4" }), e._computedStatus === "completed" ? "Mark upcoming" : "Mark completed"]
								}),
								/* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
								/* @__PURE__ */ jsxs(DropdownMenuItem, {
									className: "text-destructive",
									onClick: onDelete,
									children: [/* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }), " Delete"]
								})
							]
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-1.5 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-1.5",
							children: [
								/* @__PURE__ */ jsx(Calendar, { className: "h-3.5 w-3.5" }),
								format(e._dt, "EEE, MMM d"),
								e.exam_time && /* @__PURE__ */ jsxs(Fragment, { children: [" · ", format(e._dt, "h:mm a")] })
							]
						}), e.room && /* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-1.5",
							children: [
								/* @__PURE__ */ jsx(MapPin, { className: "h-3.5 w-3.5" }),
								" ",
								e.room
							]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: cn("rounded-xl border px-3 py-2 text-sm font-medium", cd.tone === "destructive" && "border-destructive/30 bg-destructive/10 text-destructive", cd.tone === "warning" && "border-warning/30 bg-warning/15 text-warning", cd.tone === "primary" && "border-primary/30 bg-primary/10 text-primary", cd.tone === "success" && "border-success/30 bg-success/10 text-success", cd.tone === "muted" && "border-border bg-muted/40 text-muted-foreground"),
						children: ["⏳ ", cd.text]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-auto space-y-2",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between text-xs",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-muted-foreground",
									children: "Preparation"
								}), /* @__PURE__ */ jsxs("span", {
									className: "font-semibold text-primary",
									children: [e.revision_progress, "%"]
								})]
							}),
							/* @__PURE__ */ jsx(Progress, { value: e.revision_progress }),
							/* @__PURE__ */ jsx(Slider, {
								value: [e.revision_progress],
								min: 0,
								max: 100,
								step: 5,
								onValueChange: (v) => onProgress(v[0] ?? 0),
								className: "pt-1"
							}),
							e.chapters_total > 0 && /* @__PURE__ */ jsxs("div", {
								className: "text-[11px] text-muted-foreground",
								children: [
									"Chapters: ",
									e.chapters_completed,
									"/",
									e.chapters_total
								]
							})
						]
					})
				]
			})
		})
	});
}
function AgendaView({ items, onEdit, now }) {
	if (items.length === 0) return /* @__PURE__ */ jsx(FilteredEmpty, {});
	return /* @__PURE__ */ jsx(Card, {
		className: "border-border/60 shadow-soft",
		children: /* @__PURE__ */ jsx("ul", {
			className: "divide-y",
			children: items.map((e) => {
				const cd = countdownLabel(e._dt, now);
				return /* @__PURE__ */ jsxs("li", {
					className: "flex items-center gap-3 p-3",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary",
							children: /* @__PURE__ */ jsxs("div", {
								className: "text-center leading-none",
								children: [/* @__PURE__ */ jsx("div", {
									className: "text-[9px] uppercase text-primary/80",
									children: format(e._dt, "MMM")
								}), /* @__PURE__ */ jsx("div", {
									className: "text-base font-bold",
									children: format(e._dt, "d")
								})]
							})
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ jsx("div", {
								className: "truncate text-sm font-semibold",
								children: e.title ?? e.subject
							}), /* @__PURE__ */ jsxs("div", {
								className: "truncate text-xs text-muted-foreground",
								children: [
									e.subject,
									" · ",
									EXAM_TYPE_LABEL[e.exam_type],
									e.exam_time && /* @__PURE__ */ jsxs(Fragment, { children: [" · ", format(e._dt, "h:mm a")] }),
									e.room && /* @__PURE__ */ jsxs(Fragment, { children: [" · ", e.room] })
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "hidden text-right sm:block",
							children: [/* @__PURE__ */ jsx("div", {
								className: "text-xs font-medium",
								children: cd.text
							}), /* @__PURE__ */ jsx(Progress, {
								value: e.revision_progress,
								className: "mt-1 h-1.5 w-24"
							})]
						}),
						/* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "icon",
							className: "h-8 w-8",
							onClick: () => onEdit(e),
							children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" })
						})
					]
				}, e.id);
			})
		})
	});
}
function CalendarView({ items, month, onPrev, onNext, mode, onModeChange, onSelectDay }) {
	const start = mode === "month" ? startOfWeek(startOfMonth(month)) : startOfWeek(month);
	const end = mode === "month" ? endOfWeek(endOfMonth(month)) : endOfWeek(month);
	const days = [];
	let cur = start;
	while (cur <= end) {
		days.push(cur);
		cur = addDays(cur, 1);
	}
	return /* @__PURE__ */ jsxs(Card, {
		className: "border-border/60 shadow-soft",
		children: [/* @__PURE__ */ jsxs(CardHeader, {
			className: "flex flex-row items-center justify-between space-y-0 pb-3",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "icon",
						className: "h-8 w-8",
						onClick: onPrev,
						children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ jsx(CardTitle, {
						className: "text-base",
						children: format(month, "MMMM yyyy")
					}),
					/* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						size: "icon",
						className: "h-8 w-8",
						onClick: onNext,
						children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
					})
				]
			}), /* @__PURE__ */ jsx(Tabs, {
				value: mode,
				onValueChange: (v) => onModeChange(v),
				children: /* @__PURE__ */ jsxs(TabsList, { children: [/* @__PURE__ */ jsx(TabsTrigger, {
					value: "month",
					children: "Month"
				}), /* @__PURE__ */ jsx(TabsTrigger, {
					value: "week",
					children: "Week"
				})] })
			})]
		}), /* @__PURE__ */ jsxs(CardContent, { children: [/* @__PURE__ */ jsx("div", {
			className: "grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase text-muted-foreground",
			children: [
				"Sun",
				"Mon",
				"Tue",
				"Wed",
				"Thu",
				"Fri",
				"Sat"
			].map((d) => /* @__PURE__ */ jsx("div", {
				className: "py-1",
				children: d
			}, d))
		}), /* @__PURE__ */ jsx("div", {
			className: "grid grid-cols-7 gap-1",
			children: days.map((d) => {
				const dayExams = items.filter((e) => isSameDay(e._dt, d));
				const outside = mode === "month" && !isSameMonth(d, month);
				const today = isToday(d);
				return /* @__PURE__ */ jsxs("button", {
					onClick: () => onSelectDay(d),
					className: cn("flex min-h-[68px] flex-col rounded-lg border p-1.5 text-left text-xs transition hover:border-primary/40 hover:bg-primary/5", outside && "opacity-40", today && "border-primary/50 bg-primary/5"),
					children: [/* @__PURE__ */ jsx("span", {
						className: cn("text-[11px] font-semibold", today && "text-primary"),
						children: format(d, "d")
					}), /* @__PURE__ */ jsxs("div", {
						className: "mt-1 flex flex-wrap gap-1",
						children: [dayExams.slice(0, 3).map((e) => /* @__PURE__ */ jsx("span", { className: cn("block h-1.5 w-1.5 rounded-full", e._computedStatus === "completed" ? "bg-success" : e._computedStatus === "missed" ? "bg-destructive" : "bg-primary") }, e.id)), dayExams.length > 3 && /* @__PURE__ */ jsxs("span", {
							className: "text-[9px] text-muted-foreground",
							children: ["+", dayExams.length - 3]
						})]
					})]
				}, d.toISOString());
			})
		})] })]
	});
}
function EmptyState({ onAdd }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col items-center justify-center rounded-3xl border border-dashed py-16 text-center",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary",
				children: /* @__PURE__ */ jsx(BookOpen, { className: "h-8 w-8" })
			}),
			/* @__PURE__ */ jsx("h3", {
				className: "mt-4 text-lg font-semibold",
				children: "📚 No exams scheduled yet"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-1 max-w-sm text-sm text-muted-foreground",
				children: "Stay ahead by adding your first exam."
			}),
			/* @__PURE__ */ jsxs(Button, {
				onClick: onAdd,
				size: "lg",
				className: "mt-6 gradient-primary text-primary-foreground shadow-glow",
				children: [/* @__PURE__ */ jsx(Plus, { className: "mr-1.5 h-4 w-4" }), " Add exam"]
			})
		]
	});
}
function FilteredEmpty() {
	return /* @__PURE__ */ jsx("div", {
		className: "rounded-2xl border border-dashed py-10 text-center text-sm text-muted-foreground",
		children: "No exams match your current filters."
	});
}
//#endregion
export { ExamsPage as component };
