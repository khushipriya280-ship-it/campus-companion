import { t as supabase } from "./client-CjRwkL__.js";
import { n as useAuth } from "./use-auth-BE1JWkQ8.js";
import { t as cn } from "./utils-C_uf36nf.js";
import { t as Button } from "./button-BkEeRci-.js";
import { t as Input } from "./input-B8Q2ztVi.js";
import { t as Textarea } from "./textarea-kko37XEX.js";
import { t as Label } from "./label-DBD1bRRP.js";
import { t as Badge } from "./badge-D1Dupn2y.js";
import { n as CardContent, t as Card } from "./card-BXjpJ96D.js";
import { _ as DialogDescription, a as AlertDialogContent, b as DialogTitle, c as AlertDialogHeader, d as SelectContent, f as SelectItem, g as DialogContent, h as Dialog, i as AlertDialogCancel, l as AlertDialogTitle, m as SelectValue, n as AlertDialog, o as AlertDialogDescription, p as SelectTrigger, r as AlertDialogAction, s as AlertDialogFooter, t as Skeleton, u as Select, v as DialogFooter, y as DialogHeader } from "./skeleton-C2rdUIQW.js";
import { a as DropdownMenuSeparator, n as DropdownMenuContent, o as DropdownMenuTrigger, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-BtjXROHi.js";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.js";
import { useMemo, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Archive, ArchiveRestore, BookOpen, Calendar, CheckCircle2, Clock, Filter, Flag, Inbox, LayoutGrid, List, MoreVertical, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { differenceInCalendarDays, format, isPast, isToday, isTomorrow } from "date-fns";
//#region src/routes/_authenticated/assignments.tsx?tsr-split=component
var emptyForm = {
	title: "",
	subject: "",
	description: "",
	notes: "",
	priority: "medium",
	status: "pending",
	due_date: "",
	due_time: "",
	file_url: ""
};
function AssignmentsPage() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const [search, setSearch] = useState("");
	const [subjectFilter, setSubjectFilter] = useState("all");
	const [priorityFilter, setPriorityFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("active");
	const [sortBy, setSortBy] = useState("deadline_asc");
	const [view, setView] = useState("card");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [form, setForm] = useState(emptyForm);
	const [deleteId, setDeleteId] = useState(null);
	const { data: assignments = [], isLoading } = useQuery({
		queryKey: ["assignments", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data, error } = await supabase.from("assignments").select("*").order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	const subjects = useMemo(() => {
		const set = /* @__PURE__ */ new Set();
		assignments.forEach((a) => a.subject && set.add(a.subject));
		return Array.from(set).sort();
	}, [assignments]);
	const counts = useMemo(() => {
		const now = /* @__PURE__ */ new Date();
		let dueToday = 0, upcoming = 0, overdue = 0, completed = 0;
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
		return {
			dueToday,
			upcoming,
			overdue,
			completed
		};
	}, [assignments]);
	const filtered = useMemo(() => {
		let list = assignments.slice();
		if (statusFilter === "active") list = list.filter((a) => a.status !== "completed" && a.status !== "archived");
		else if (statusFilter !== "all") list = list.filter((a) => a.status === statusFilter);
		if (subjectFilter !== "all") list = list.filter((a) => (a.subject ?? "") === subjectFilter);
		if (priorityFilter !== "all") list = list.filter((a) => a.priority === priorityFilter);
		if (search.trim()) {
			const q = search.toLowerCase();
			list = list.filter((a) => a.title.toLowerCase().includes(q) || (a.subject ?? "").toLowerCase().includes(q) || (a.description ?? "").toLowerCase().includes(q));
		}
		const cmp = (a, b) => {
			switch (sortBy) {
				case "deadline_asc": return (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999");
				case "deadline_desc": return (b.deadline ?? "").localeCompare(a.deadline ?? "");
				case "priority": {
					const order = {
						high: 0,
						medium: 1,
						low: 2
					};
					return order[a.priority] - order[b.priority];
				}
				case "title": return a.title.localeCompare(b.title);
				case "created": return b.created_at.localeCompare(a.created_at);
				default: return 0;
			}
		};
		return list.sort(cmp);
	}, [
		assignments,
		statusFilter,
		subjectFilter,
		priorityFilter,
		search,
		sortBy
	]);
	const upsert = useMutation({
		mutationFn: async (f) => {
			if (!user) throw new Error("Not signed in");
			const deadline = f.due_date ? (/* @__PURE__ */ new Date(`${f.due_date}T${f.due_time || "23:59"}:00`)).toISOString() : null;
			const payload = {
				user_id: user.id,
				title: f.title.trim(),
				subject: f.subject.trim() || null,
				description: f.description.trim() || null,
				notes: f.notes.trim() || null,
				priority: f.priority,
				status: f.status,
				deadline,
				file_url: f.file_url.trim() || null
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
		onError: (e) => toast.error(e.message)
	});
	const patch = useMutation({
		mutationFn: async ({ id, changes }) => {
			const { error } = await supabase.from("assignments").update(changes).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["assignments"] });
			qc.invalidateQueries({ queryKey: ["assignments-dashboard"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("assignments").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["assignments"] });
			qc.invalidateQueries({ queryKey: ["assignments-dashboard"] });
			setDeleteId(null);
			toast.success("Assignment deleted");
		},
		onError: (e) => toast.error(e.message)
	});
	const openCreate = () => {
		setForm(emptyForm);
		setDialogOpen(true);
	};
	const openEdit = (a) => {
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
			file_url: a.file_url ?? ""
		});
		setDialogOpen(true);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold tracking-tight",
					children: "Assignments"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-muted-foreground",
					children: "Track, prioritise and ship every task on time."
				})] }), /* @__PURE__ */ jsxs(Button, {
					onClick: openCreate,
					className: "gradient-primary text-primary-foreground shadow-glow",
					children: [/* @__PURE__ */ jsx(Plus, { className: "mr-1.5 h-4 w-4" }), " New assignment"]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-2 gap-3 md:grid-cols-4",
				children: [
					/* @__PURE__ */ jsx(StatCard, {
						label: "Due today",
						value: counts.dueToday,
						icon: Clock,
						tone: "warning"
					}),
					/* @__PURE__ */ jsx(StatCard, {
						label: "Upcoming",
						value: counts.upcoming,
						icon: Calendar,
						tone: "primary"
					}),
					/* @__PURE__ */ jsx(StatCard, {
						label: "Overdue",
						value: counts.overdue,
						icon: Flag,
						tone: "destructive"
					}),
					/* @__PURE__ */ jsx(StatCard, {
						label: "Completed",
						value: counts.completed,
						icon: CheckCircle2,
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
								placeholder: "Search by title, subject or description…",
								value: search,
								onChange: (e) => setSearch(e.target.value),
								className: "pl-9"
							})]
						}), /* @__PURE__ */ jsx(Tabs, {
							value: view,
							onValueChange: (v) => setView(v),
							children: /* @__PURE__ */ jsxs(TabsList, { children: [/* @__PURE__ */ jsxs(TabsTrigger, {
								value: "card",
								className: "gap-1.5",
								children: [/* @__PURE__ */ jsx(LayoutGrid, { className: "h-3.5 w-3.5" }), "Cards"]
							}), /* @__PURE__ */ jsxs(TabsTrigger, {
								value: "list",
								className: "gap-1.5",
								children: [/* @__PURE__ */ jsx(List, { className: "h-3.5 w-3.5" }), "List"]
							})] })
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
										v: "active",
										l: "Active"
									},
									{
										v: "all",
										l: "All"
									},
									{
										v: "pending",
										l: "Pending"
									},
									{
										v: "in_progress",
										l: "In progress"
									},
									{
										v: "completed",
										l: "Completed"
									},
									{
										v: "archived",
										l: "Archived"
									}
								]
							}),
							/* @__PURE__ */ jsx(FilterSelect, {
								value: priorityFilter,
								onChange: setPriorityFilter,
								placeholder: "Priority",
								options: [
									{
										v: "all",
										l: "All priorities"
									},
									{
										v: "high",
										l: "High"
									},
									{
										v: "medium",
										l: "Medium"
									},
									{
										v: "low",
										l: "Low"
									}
								]
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
											v: "deadline_asc",
											l: "Deadline ↑"
										},
										{
											v: "deadline_desc",
											l: "Deadline ↓"
										},
										{
											v: "priority",
											l: "Priority"
										},
										{
											v: "title",
											l: "Title (A–Z)"
										},
										{
											v: "created",
											l: "Recently added"
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
				children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-44 rounded-2xl" }, i))
			}) : filtered.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {
				onAdd: openCreate,
				hasAny: assignments.length > 0
			}) : view === "card" ? /* @__PURE__ */ jsx("div", {
				className: "grid gap-3 md:grid-cols-2 xl:grid-cols-3",
				children: /* @__PURE__ */ jsx(AnimatePresence, {
					mode: "popLayout",
					children: filtered.map((a) => /* @__PURE__ */ jsx(AssignmentCard, {
						a,
						onEdit: () => openEdit(a),
						onDelete: () => setDeleteId(a.id),
						onToggleComplete: () => patch.mutate({
							id: a.id,
							changes: {
								status: a.status === "completed" ? "pending" : "completed",
								progress: a.status === "completed" ? 0 : 100
							}
						}),
						onArchive: () => patch.mutate({
							id: a.id,
							changes: { status: a.status === "archived" ? "pending" : "archived" }
						})
					}, a.id))
				})
			}) : /* @__PURE__ */ jsx(Card, {
				className: "border-border/60 shadow-soft",
				children: /* @__PURE__ */ jsx("ul", {
					className: "divide-y",
					children: /* @__PURE__ */ jsx(AnimatePresence, {
						mode: "popLayout",
						children: filtered.map((a) => /* @__PURE__ */ jsx(AssignmentRow, {
							a,
							onEdit: () => openEdit(a),
							onDelete: () => setDeleteId(a.id),
							onToggleComplete: () => patch.mutate({
								id: a.id,
								changes: {
									status: a.status === "completed" ? "pending" : "completed",
									progress: a.status === "completed" ? 0 : 100
								}
							}),
							onArchive: () => patch.mutate({
								id: a.id,
								changes: { status: a.status === "archived" ? "pending" : "archived" }
							})
						}, a.id))
					})
				})
			}),
			/* @__PURE__ */ jsx(Dialog, {
				open: dialogOpen,
				onOpenChange: setDialogOpen,
				children: /* @__PURE__ */ jsxs(DialogContent, {
					className: "max-h-[90vh] overflow-y-auto sm:max-w-lg",
					children: [/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: form.id ? "Edit assignment" : "New assignment" }), /* @__PURE__ */ jsx(DialogDescription, { children: form.id ? "Update the details below." : "Add a new task to your tracker." })] }), /* @__PURE__ */ jsxs("form", {
						className: "space-y-4",
						onSubmit: (e) => {
							e.preventDefault();
							if (!form.title.trim()) {
								toast.error("Title is required");
								return;
							}
							upsert.mutate(form);
						},
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, {
									htmlFor: "title",
									children: "Title *"
								}), /* @__PURE__ */ jsx(Input, {
									id: "title",
									value: form.title,
									onChange: (e) => setForm({
										...form,
										title: e.target.value
									}),
									placeholder: "e.g. DBMS lab report",
									maxLength: 200,
									required: true
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "space-y-1.5",
									children: [
										/* @__PURE__ */ jsx(Label, {
											htmlFor: "subject",
											children: "Subject"
										}),
										/* @__PURE__ */ jsx(Input, {
											id: "subject",
											list: "subject-suggestions",
											value: form.subject,
											onChange: (e) => setForm({
												...form,
												subject: e.target.value
											}),
											placeholder: "e.g. DBMS",
											maxLength: 100
										}),
										/* @__PURE__ */ jsx("datalist", {
											id: "subject-suggestions",
											children: subjects.map((s) => /* @__PURE__ */ jsx("option", { value: s }, s))
										})
									]
								}), /* @__PURE__ */ jsxs("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ jsx(Label, {
										htmlFor: "priority",
										children: "Priority"
									}), /* @__PURE__ */ jsxs(Select, {
										value: form.priority,
										onValueChange: (v) => setForm({
											...form,
											priority: v
										}),
										children: [/* @__PURE__ */ jsx(SelectTrigger, {
											id: "priority",
											children: /* @__PURE__ */ jsx(SelectValue, {})
										}), /* @__PURE__ */ jsxs(SelectContent, { children: [
											/* @__PURE__ */ jsx(SelectItem, {
												value: "low",
												children: "Low"
											}),
											/* @__PURE__ */ jsx(SelectItem, {
												value: "medium",
												children: "Medium"
											}),
											/* @__PURE__ */ jsx(SelectItem, {
												value: "high",
												children: "High"
											})
										] })]
									})]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "grid grid-cols-1 gap-3 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "space-y-1.5 sm:col-span-1",
										children: [/* @__PURE__ */ jsx(Label, {
											htmlFor: "due_date",
											children: "Due date"
										}), /* @__PURE__ */ jsx(Input, {
											id: "due_date",
											type: "date",
											value: form.due_date,
											onChange: (e) => setForm({
												...form,
												due_date: e.target.value
											})
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "space-y-1.5 sm:col-span-1",
										children: [/* @__PURE__ */ jsx(Label, {
											htmlFor: "due_time",
											children: "Due time"
										}), /* @__PURE__ */ jsx(Input, {
											id: "due_time",
											type: "time",
											value: form.due_time,
											onChange: (e) => setForm({
												...form,
												due_time: e.target.value
											})
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "space-y-1.5 sm:col-span-1",
										children: [/* @__PURE__ */ jsx(Label, {
											htmlFor: "status",
											children: "Status"
										}), /* @__PURE__ */ jsxs(Select, {
											value: form.status,
											onValueChange: (v) => setForm({
												...form,
												status: v
											}),
											children: [/* @__PURE__ */ jsx(SelectTrigger, {
												id: "status",
												children: /* @__PURE__ */ jsx(SelectValue, {})
											}), /* @__PURE__ */ jsxs(SelectContent, { children: [
												/* @__PURE__ */ jsx(SelectItem, {
													value: "pending",
													children: "Pending"
												}),
												/* @__PURE__ */ jsx(SelectItem, {
													value: "in_progress",
													children: "In progress"
												}),
												/* @__PURE__ */ jsx(SelectItem, {
													value: "completed",
													children: "Completed"
												}),
												/* @__PURE__ */ jsx(SelectItem, {
													value: "archived",
													children: "Archived"
												})
											] })]
										})]
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, {
									htmlFor: "description",
									children: "Description"
								}), /* @__PURE__ */ jsx(Textarea, {
									id: "description",
									value: form.description,
									onChange: (e) => setForm({
										...form,
										description: e.target.value
									}),
									placeholder: "What needs to be done?",
									rows: 3,
									maxLength: 2e3
								})]
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
									placeholder: "Anything else to remember",
									rows: 2,
									maxLength: 2e3
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, {
									htmlFor: "file_url",
									children: "Attachment link (optional)"
								}), /* @__PURE__ */ jsx(Input, {
									id: "file_url",
									type: "url",
									value: form.file_url,
									onChange: (e) => setForm({
										...form,
										file_url: e.target.value
									}),
									placeholder: "https://…",
									maxLength: 500
								})]
							}),
							/* @__PURE__ */ jsxs(DialogFooter, { children: [/* @__PURE__ */ jsx(Button, {
								type: "button",
								variant: "outline",
								onClick: () => setDialogOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ jsx(Button, {
								type: "submit",
								disabled: upsert.isPending,
								className: "gradient-primary text-primary-foreground",
								children: upsert.isPending ? "Saving…" : form.id ? "Save changes" : "Create assignment"
							})] })
						]
					})]
				})
			}),
			/* @__PURE__ */ jsx(AlertDialog, {
				open: !!deleteId,
				onOpenChange: (o) => !o && setDeleteId(null),
				children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [/* @__PURE__ */ jsxs(AlertDialogHeader, { children: [/* @__PURE__ */ jsx(AlertDialogTitle, { children: "Delete this assignment?" }), /* @__PURE__ */ jsx(AlertDialogDescription, { children: "This action can't be undone. The assignment will be permanently removed." })] }), /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [/* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ jsx(AlertDialogAction, {
					onClick: () => deleteId && remove.mutate(deleteId),
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					children: "Delete"
				})] })] })
			})
		]
	});
}
function StatCard({ label, value, icon: Icon, tone }) {
	const bg = {
		primary: "bg-primary/10 text-primary",
		success: "bg-success/10 text-success",
		warning: "bg-warning/15 text-warning",
		destructive: "bg-destructive/10 text-destructive"
	}[tone];
	return /* @__PURE__ */ jsx(motion.div, {
		initial: {
			opacity: 0,
			y: 8
		},
		animate: {
			opacity: 1,
			y: 0
		},
		children: /* @__PURE__ */ jsx(Card, {
			className: "border-border/60 shadow-soft",
			children: /* @__PURE__ */ jsxs(CardContent, {
				className: "flex items-center gap-3 p-4",
				children: [/* @__PURE__ */ jsx("div", {
					className: cn("grid h-10 w-10 place-items-center rounded-xl", bg),
					children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" })
				}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
					className: "text-2xl font-bold leading-tight",
					children: value
				}), /* @__PURE__ */ jsx("div", {
					className: "text-xs text-muted-foreground",
					children: label
				})] })]
			})
		})
	});
}
function FilterSelect({ value, onChange, options, placeholder }) {
	return /* @__PURE__ */ jsxs(Select, {
		value,
		onValueChange: onChange,
		children: [/* @__PURE__ */ jsx(SelectTrigger, {
			className: "h-9 w-auto min-w-[140px] gap-2 text-xs",
			children: /* @__PURE__ */ jsx(SelectValue, { placeholder })
		}), /* @__PURE__ */ jsx(SelectContent, { children: options.map((o) => /* @__PURE__ */ jsx(SelectItem, {
			value: o.v,
			children: o.l
		}, o.v)) })]
	});
}
function priorityBadge(p) {
	return {
		high: "bg-destructive/10 text-destructive border-destructive/20",
		medium: "bg-warning/15 text-warning border-warning/20",
		low: "bg-success/10 text-success border-success/20"
	}[p];
}
function statusBadge(s) {
	return {
		pending: "bg-muted text-muted-foreground border-border",
		in_progress: "bg-info/10 text-info border-info/20",
		completed: "bg-success/10 text-success border-success/20",
		archived: "bg-muted text-muted-foreground border-border"
	}[s];
}
function statusLabel(s) {
	return {
		pending: "Pending",
		in_progress: "In progress",
		completed: "Completed",
		archived: "Archived"
	}[s];
}
function dueLabel(deadline) {
	if (!deadline) return {
		text: "No deadline",
		tone: "muted"
	};
	const d = new Date(deadline);
	const now = /* @__PURE__ */ new Date();
	if (isToday(d)) return {
		text: `Today · ${format(d, "h:mm a")}`,
		tone: "warning"
	};
	if (isTomorrow(d)) return {
		text: `Tomorrow · ${format(d, "h:mm a")}`,
		tone: "primary"
	};
	if (d < now) return {
		text: `Overdue · ${Math.abs(differenceInCalendarDays(d, now))}d ago`,
		tone: "destructive"
	};
	const days = differenceInCalendarDays(d, now);
	if (days <= 7) return {
		text: `In ${days}d · ${format(d, "EEE")}`,
		tone: "primary"
	};
	return {
		text: format(d, "MMM d, yyyy"),
		tone: "muted"
	};
}
var dueToneClass = {
	muted: "text-muted-foreground",
	warning: "text-warning",
	primary: "text-primary",
	destructive: "text-destructive"
};
function AssignmentCard({ a, onEdit, onDelete, onToggleComplete, onArchive }) {
	const due = dueLabel(a.deadline);
	const done = a.status === "completed";
	return /* @__PURE__ */ jsx(motion.div, {
		layout: true,
		initial: {
			opacity: 0,
			y: 10
		},
		animate: {
			opacity: 1,
			y: 0
		},
		exit: {
			opacity: 0,
			scale: .95
		},
		transition: { duration: .2 },
		children: /* @__PURE__ */ jsx(Card, {
			className: cn("group h-full border-border/60 shadow-soft transition hover:shadow-elevated", done && "opacity-70"),
			children: /* @__PURE__ */ jsxs(CardContent, {
				className: "flex h-full flex-col gap-3 p-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-1.5",
							children: [/* @__PURE__ */ jsxs(Badge, {
								variant: "outline",
								className: cn("border", priorityBadge(a.priority)),
								children: [/* @__PURE__ */ jsx(Flag, { className: "mr-1 h-3 w-3" }), a.priority]
							}), a.subject && /* @__PURE__ */ jsx(Badge, {
								variant: "outline",
								className: "border bg-primary/5 text-primary",
								children: a.subject
							})]
						}), /* @__PURE__ */ jsx(RowMenu, {
							onEdit,
							onDelete,
							onArchive,
							archived: a.status === "archived"
						})]
					}),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
						className: cn("text-base font-semibold leading-snug", done && "line-through"),
						children: a.title
					}), a.description && /* @__PURE__ */ jsx("p", {
						className: "mt-1 line-clamp-2 text-xs text-muted-foreground",
						children: a.description
					})] }),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-auto flex items-center justify-between gap-2 pt-2",
						children: [/* @__PURE__ */ jsxs("div", {
							className: cn("inline-flex items-center gap-1.5 text-xs font-medium", dueToneClass[due.tone]),
							children: [
								/* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }),
								" ",
								due.text
							]
						}), /* @__PURE__ */ jsx(Badge, {
							variant: "outline",
							className: cn("border text-[10px]", statusBadge(a.status)),
							children: statusLabel(a.status)
						})]
					}),
					/* @__PURE__ */ jsxs(Button, {
						variant: done ? "outline" : "secondary",
						size: "sm",
						className: "w-full gap-1.5",
						onClick: onToggleComplete,
						children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }), done ? "Mark as pending" : "Mark complete"]
					})
				]
			})
		})
	});
}
function AssignmentRow({ a, onEdit, onDelete, onToggleComplete, onArchive }) {
	const due = dueLabel(a.deadline);
	const done = a.status === "completed";
	return /* @__PURE__ */ jsxs(motion.li, {
		layout: true,
		initial: {
			opacity: 0,
			x: -8
		},
		animate: {
			opacity: 1,
			x: 0
		},
		exit: {
			opacity: 0,
			x: 8
		},
		transition: { duration: .18 },
		className: "flex items-center gap-3 px-4 py-3 hover:bg-muted/40",
		children: [
			/* @__PURE__ */ jsx("button", {
				onClick: onToggleComplete,
				className: cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition", done ? "border-success bg-success text-success-foreground" : "border-muted-foreground/40 hover:border-primary"),
				"aria-label": "Toggle complete",
				children: done && /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" })
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: cn("truncate text-sm font-medium", done && "line-through text-muted-foreground"),
							children: a.title
						}),
						/* @__PURE__ */ jsx(Badge, {
							variant: "outline",
							className: cn("border text-[10px]", priorityBadge(a.priority)),
							children: a.priority
						}),
						a.subject && /* @__PURE__ */ jsxs("span", {
							className: "text-xs text-muted-foreground",
							children: ["· ", a.subject]
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: cn("mt-0.5 inline-flex items-center gap-1.5 text-xs", dueToneClass[due.tone]),
					children: [
						/* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
						" ",
						due.text
					]
				})]
			}),
			/* @__PURE__ */ jsx(Badge, {
				variant: "outline",
				className: cn("hidden border text-[10px] sm:inline-flex", statusBadge(a.status)),
				children: statusLabel(a.status)
			}),
			/* @__PURE__ */ jsx(RowMenu, {
				onEdit,
				onDelete,
				onArchive,
				archived: a.status === "archived"
			})
		]
	});
}
function RowMenu({ onEdit, onDelete, onArchive, archived }) {
	return /* @__PURE__ */ jsxs(DropdownMenu, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ jsx(Button, {
			variant: "ghost",
			size: "icon",
			className: "h-8 w-8 shrink-0",
			children: /* @__PURE__ */ jsx(MoreVertical, { className: "h-4 w-4" })
		})
	}), /* @__PURE__ */ jsxs(DropdownMenuContent, {
		align: "end",
		className: "w-44",
		children: [
			/* @__PURE__ */ jsxs(DropdownMenuItem, {
				onClick: onEdit,
				children: [/* @__PURE__ */ jsx(Pencil, { className: "mr-2 h-4 w-4" }), " Edit"]
			}),
			/* @__PURE__ */ jsxs(DropdownMenuItem, {
				onClick: onArchive,
				children: [archived ? /* @__PURE__ */ jsx(ArchiveRestore, { className: "mr-2 h-4 w-4" }) : /* @__PURE__ */ jsx(Archive, { className: "mr-2 h-4 w-4" }), archived ? "Unarchive" : "Archive"]
			}),
			/* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
			/* @__PURE__ */ jsxs(DropdownMenuItem, {
				onClick: onDelete,
				className: "text-destructive focus:text-destructive",
				children: [/* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }), " Delete"]
			})
		]
	})] });
}
function EmptyState({ onAdd, hasAny }) {
	return /* @__PURE__ */ jsxs(motion.div, {
		initial: {
			opacity: 0,
			y: 10
		},
		animate: {
			opacity: 1,
			y: 0
		},
		className: "relative overflow-hidden rounded-3xl border bg-card p-10 text-center shadow-soft",
		children: [/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 gradient-hero opacity-60" }), /* @__PURE__ */ jsxs("div", {
			className: "relative",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "mx-auto grid h-16 w-16 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow",
					children: hasAny ? /* @__PURE__ */ jsx(Inbox, { className: "h-8 w-8" }) : /* @__PURE__ */ jsx(BookOpen, { className: "h-8 w-8" })
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "mt-6 text-xl font-semibold",
					children: hasAny ? "Nothing matches those filters" : "No assignments yet"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mx-auto mt-2 max-w-md text-sm text-muted-foreground",
					children: hasAny ? "Try changing your search or filters — or add a brand new assignment." : "Add your first assignment to start tracking deadlines, priorities and progress."
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-6",
					children: /* @__PURE__ */ jsxs(Button, {
						onClick: onAdd,
						className: "gradient-primary text-primary-foreground shadow-glow",
						children: [/* @__PURE__ */ jsx(Plus, { className: "mr-1.5 h-4 w-4" }), " New assignment"]
					})
				})
			]
		})]
	});
}
//#endregion
export { AssignmentsPage as component };
