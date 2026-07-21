import { t as supabase } from "./client-CjRwkL__.js";
import { n as useAuth } from "./use-auth-BE1JWkQ8.js";
import { t as cn } from "./utils-C_uf36nf.js";
import { t as Progress } from "./progress-DOIEKRJF.js";
import { t as Button } from "./button-BkEeRci-.js";
import { t as Input } from "./input-B8Q2ztVi.js";
import { t as Label } from "./label-DBD1bRRP.js";
import { t as Badge } from "./badge-D1Dupn2y.js";
import { n as CardContent, t as Card } from "./card-BXjpJ96D.js";
import { _ as DialogDescription, a as AlertDialogContent, b as DialogTitle, c as AlertDialogHeader, d as SelectContent, f as SelectItem, g as DialogContent, h as Dialog, i as AlertDialogCancel, l as AlertDialogTitle, m as SelectValue, n as AlertDialog, o as AlertDialogDescription, p as SelectTrigger, r as AlertDialogAction, s as AlertDialogFooter, t as Skeleton, u as Select, v as DialogFooter, y as DialogHeader } from "./skeleton-C2rdUIQW.js";
import { useEffect, useMemo, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, ArrowUpDown, BookOpen, Check, Pencil, Plus, Search, ShieldCheck, Trash2, TrendingDown, TrendingUp, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
//#region src/routes/_authenticated/attendance.tsx?tsr-split=component
function pct(attended, total) {
	if (total <= 0) return 0;
	return Math.round(attended / total * 1e3) / 10;
}
function statusOf(p, target) {
	if (p >= 85) return "safe";
	if (p >= target) return "warning";
	return "critical";
}
function classesNeeded(attended, total, target) {
	const t = target / 100;
	if (total === 0) return 0;
	if (attended / total >= t) return 0;
	const x = Math.ceil((t * total - attended) / (1 - t));
	return Math.max(0, x);
}
function safeToMiss(attended, total, target) {
	const t = target / 100;
	if (total === 0) return 0;
	if (attended / total < t) return 0;
	const x = Math.floor(attended / t - total);
	return Math.max(0, x);
}
function AttendancePage() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [sortBy, setSortBy] = useState("percentage");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [deleting, setDeleting] = useState(null);
	const { data: subjects = [], isLoading } = useQuery({
		queryKey: ["subjects", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data, error } = await supabase.from("subjects").select("*").order("created_at", { ascending: true });
			if (error) throw error;
			return data ?? [];
		}
	});
	const upsert = useMutation({
		mutationFn: async (s) => {
			if (s.id) {
				const { error } = await supabase.from("subjects").update({
					name: s.name,
					code: s.code ?? null,
					faculty: s.faculty ?? null,
					semester: s.semester ?? null,
					target_percentage: s.target_percentage ?? 75,
					total_classes: s.total_classes ?? 0,
					attended_classes: s.attended_classes ?? 0
				}).eq("id", s.id);
				if (error) throw error;
			} else {
				const { error } = await supabase.from("subjects").insert({
					user_id: user.id,
					name: s.name,
					code: s.code ?? null,
					faculty: s.faculty ?? null,
					semester: s.semester ?? null,
					target_percentage: s.target_percentage ?? 75,
					total_classes: s.total_classes ?? 0,
					attended_classes: s.attended_classes ?? 0
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
		onError: (e) => toast.error(e.message)
	});
	const remove = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("subjects").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["subjects"] });
			setDeleting(null);
			toast.success("Subject deleted");
		},
		onError: (e) => toast.error(e.message)
	});
	const mark = useMutation({
		mutationFn: async ({ s, present }) => {
			const { error } = await supabase.from("subjects").update({
				total_classes: s.total_classes + 1,
				attended_classes: s.attended_classes + (present ? 1 : 0)
			}).eq("id", s.id);
			if (error) throw error;
		},
		onSuccess: (_d, vars) => {
			qc.invalidateQueries({ queryKey: ["subjects"] });
			toast.success(vars.present ? "Marked present" : "Marked absent");
		},
		onError: (e) => toast.error(e.message)
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
				canMiss: safeToMiss(s.attended_classes, s.total_classes, s.target_percentage)
			};
		});
	}, [subjects]);
	const filtered = useMemo(() => {
		let list = enriched.filter((s) => [
			s.name,
			s.code,
			s.faculty
		].filter(Boolean).some((v) => v.toLowerCase().includes(search.toLowerCase())));
		if (statusFilter !== "all") list = list.filter((s) => s.status === statusFilter);
		list = [...list].sort((a, b) => {
			if (sortBy === "name") return a.name.localeCompare(b.name);
			return a.pct - b.pct;
		});
		return list;
	}, [
		enriched,
		search,
		statusFilter,
		sortBy
	]);
	const analytics = useMemo(() => {
		if (enriched.length === 0) return {
			overall: 0,
			avg: 0,
			best: null,
			worst: null
		};
		const overall = pct(enriched.reduce((s, x) => s + x.attended_classes, 0), enriched.reduce((s, x) => s + x.total_classes, 0));
		const avg = Math.round(enriched.reduce((s, x) => s + x.pct, 0) / enriched.length * 10) / 10;
		const sorted = [...enriched].sort((a, b) => b.pct - a.pct);
		return {
			overall,
			avg,
			best: sorted[0],
			worst: sorted[sorted.length - 1]
		};
	}, [enriched]);
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6 pb-24 md:pb-0",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold tracking-tight md:text-3xl",
					children: "Attendance"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-sm text-muted-foreground",
					children: "Track every subject and know exactly how many classes you can skip."
				})] }), /* @__PURE__ */ jsxs(Button, {
					onClick: () => {
						setEditing(null);
						setDialogOpen(true);
					},
					className: "gradient-primary hidden text-primary-foreground md:inline-flex",
					children: [/* @__PURE__ */ jsx(Plus, { className: "mr-1 h-4 w-4" }), " Add subject"]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-2 gap-3 md:grid-cols-4",
				children: [
					/* @__PURE__ */ jsx(AnalyticsCard, {
						label: "Overall",
						value: `${analytics.overall}%`,
						icon: ShieldCheck,
						tone: analytics.overall >= 85 ? "success" : analytics.overall >= 75 ? "warning" : "destructive"
					}),
					/* @__PURE__ */ jsx(AnalyticsCard, {
						label: "Average",
						value: `${analytics.avg}%`,
						icon: TrendingUp,
						tone: "primary"
					}),
					/* @__PURE__ */ jsx(AnalyticsCard, {
						label: "Best",
						value: analytics.best ? `${analytics.best.pct}%` : "—",
						hint: analytics.best?.name,
						icon: TrendingUp,
						tone: "success"
					}),
					/* @__PURE__ */ jsx(AnalyticsCard, {
						label: "Lowest",
						value: analytics.worst ? `${analytics.worst.pct}%` : "—",
						hint: analytics.worst?.name,
						icon: TrendingDown,
						tone: "destructive"
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-2 md:flex-row md:items-center",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "relative flex-1",
						children: [/* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ jsx(Input, {
							value: search,
							onChange: (e) => setSearch(e.target.value),
							placeholder: "Search subject, code or faculty…",
							className: "pl-9"
						})]
					}),
					/* @__PURE__ */ jsxs(Select, {
						value: statusFilter,
						onValueChange: (v) => setStatusFilter(v),
						children: [/* @__PURE__ */ jsx(SelectTrigger, {
							className: "md:w-44",
							children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Status" })
						}), /* @__PURE__ */ jsxs(SelectContent, { children: [
							/* @__PURE__ */ jsx(SelectItem, {
								value: "all",
								children: "All status"
							}),
							/* @__PURE__ */ jsx(SelectItem, {
								value: "safe",
								children: "🟢 Safe"
							}),
							/* @__PURE__ */ jsx(SelectItem, {
								value: "warning",
								children: "🟡 Warning"
							}),
							/* @__PURE__ */ jsx(SelectItem, {
								value: "critical",
								children: "🔴 Critical"
							})
						] })]
					}),
					/* @__PURE__ */ jsxs(Select, {
						value: sortBy,
						onValueChange: (v) => setSortBy(v),
						children: [/* @__PURE__ */ jsxs(SelectTrigger, {
							className: "md:w-44",
							children: [/* @__PURE__ */ jsx(ArrowUpDown, { className: "mr-1 h-3.5 w-3.5" }), /* @__PURE__ */ jsx(SelectValue, {})]
						}), /* @__PURE__ */ jsxs(SelectContent, { children: [/* @__PURE__ */ jsx(SelectItem, {
							value: "percentage",
							children: "Sort by %"
						}), /* @__PURE__ */ jsx(SelectItem, {
							value: "name",
							children: "Sort by name"
						})] })]
					})
				]
			}),
			isLoading ? /* @__PURE__ */ jsx("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: [
					0,
					1,
					2
				].map((i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-56 rounded-2xl" }, i))
			}) : filtered.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {
				onAdd: () => {
					setEditing(null);
					setDialogOpen(true);
				},
				hasAny: subjects.length > 0
			}) : /* @__PURE__ */ jsx("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: /* @__PURE__ */ jsx(AnimatePresence, {
					mode: "popLayout",
					children: filtered.map((s) => /* @__PURE__ */ jsx(motion.div, {
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
							scale: .96
						},
						transition: { duration: .2 },
						children: /* @__PURE__ */ jsx(SubjectCard, {
							s,
							onEdit: () => {
								setEditing(s);
								setDialogOpen(true);
							},
							onDelete: () => setDeleting(s),
							onPresent: () => mark.mutate({
								s,
								present: true
							}),
							onAbsent: () => mark.mutate({
								s,
								present: false
							})
						})
					}, s.id))
				})
			}),
			/* @__PURE__ */ jsx("button", {
				onClick: () => {
					setEditing(null);
					setDialogOpen(true);
				},
				className: "fixed bottom-20 right-4 z-40 grid h-14 w-14 place-items-center rounded-full gradient-primary text-primary-foreground shadow-elevated md:hidden",
				"aria-label": "Add subject",
				children: /* @__PURE__ */ jsx(Plus, { className: "h-6 w-6" })
			}),
			/* @__PURE__ */ jsx(SubjectDialog, {
				open: dialogOpen,
				onOpenChange: (o) => {
					setDialogOpen(o);
					if (!o) setEditing(null);
				},
				initial: editing,
				onSubmit: (v) => upsert.mutate(v),
				submitting: upsert.isPending
			}),
			/* @__PURE__ */ jsx(AlertDialog, {
				open: !!deleting,
				onOpenChange: (o) => !o && setDeleting(null),
				children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [/* @__PURE__ */ jsxs(AlertDialogHeader, { children: [/* @__PURE__ */ jsx(AlertDialogTitle, { children: "Delete this subject?" }), /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
					"\"",
					deleting?.name,
					"\" and all its attendance data will be permanently removed."
				] })] }), /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [/* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ jsx(AlertDialogAction, {
					onClick: () => deleting && remove.mutate(deleting.id),
					className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
					children: "Delete"
				})] })] })
			})
		]
	});
}
function AnalyticsCard({ label, value, hint, icon: Icon, tone }) {
	const bg = {
		primary: "bg-primary/10 text-primary",
		success: "bg-success/10 text-success",
		warning: "bg-warning/15 text-warning",
		destructive: "bg-destructive/10 text-destructive"
	}[tone];
	return /* @__PURE__ */ jsx(Card, {
		className: "border-border/60 shadow-soft",
		children: /* @__PURE__ */ jsxs(CardContent, {
			className: "p-4",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "flex items-center justify-between",
					children: /* @__PURE__ */ jsx("div", {
						className: cn("grid h-9 w-9 place-items-center rounded-xl", bg),
						children: /* @__PURE__ */ jsx(Icon, { className: "h-[18px] w-[18px]" })
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-3 text-2xl font-bold tracking-tight",
					children: value
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "text-xs text-muted-foreground",
					children: [label, hint ? ` · ${hint}` : ""]
				})
			]
		})
	});
}
function SubjectCard({ s, onEdit, onDelete, onPresent, onAbsent }) {
	const ring = ringColor(s.status);
	return /* @__PURE__ */ jsx(Card, {
		className: "overflow-hidden border-border/60 shadow-soft transition hover:shadow-elevated",
		children: /* @__PURE__ */ jsxs(CardContent, {
			className: "p-5",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "truncate text-base font-semibold",
								children: s.name
							}), s.status === "critical" && /* @__PURE__ */ jsxs(Badge, {
								variant: "outline",
								className: "border-destructive/30 bg-destructive/10 text-[10px] text-destructive",
								children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "mr-1 h-3 w-3" }), " Low"]
							})]
						}), /* @__PURE__ */ jsx("div", {
							className: "mt-0.5 truncate text-xs text-muted-foreground",
							children: [
								s.code,
								s.faculty,
								s.semester
							].filter(Boolean).join(" · ") || "No details"
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex gap-1",
						children: [/* @__PURE__ */ jsx(Button, {
							size: "icon",
							variant: "ghost",
							onClick: onEdit,
							className: "h-8 w-8",
							children: /* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" })
						}), /* @__PURE__ */ jsx(Button, {
							size: "icon",
							variant: "ghost",
							onClick: onDelete,
							className: "h-8 w-8 text-destructive hover:text-destructive",
							children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
						})]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-4 flex items-center gap-4",
					children: [/* @__PURE__ */ jsx(Ring, {
						value: s.pct,
						status: s.status
					}), /* @__PURE__ */ jsxs("div", {
						className: "grid flex-1 grid-cols-2 gap-2 text-center text-xs",
						children: [
							/* @__PURE__ */ jsx(Stat, {
								label: "Attended",
								value: s.attended_classes
							}),
							/* @__PURE__ */ jsx(Stat, {
								label: "Total",
								value: s.total_classes
							}),
							/* @__PURE__ */ jsx(Stat, {
								label: "Missed",
								value: s.missed
							}),
							/* @__PURE__ */ jsx(Stat, {
								label: "Target",
								value: `${s.target_percentage}%`
							})
						]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-4 space-y-1.5",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between text-[11px] text-muted-foreground",
						children: [/* @__PURE__ */ jsx("span", { children: "Progress to target" }), /* @__PURE__ */ jsxs("span", { children: [Math.min(100, Math.round(s.pct / s.target_percentage * 100)), "%"] })]
					}), /* @__PURE__ */ jsx(Progress, {
						value: Math.min(100, s.pct / s.target_percentage * 100),
						className: cn("h-2", ring.track)
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-3 grid grid-cols-2 gap-2 text-[11px]",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "rounded-lg bg-muted/50 p-2",
						children: [/* @__PURE__ */ jsx("div", {
							className: "text-muted-foreground",
							children: "Can skip"
						}), /* @__PURE__ */ jsx("div", {
							className: "text-sm font-semibold text-success",
							children: s.canMiss
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "rounded-lg bg-muted/50 p-2",
						children: [/* @__PURE__ */ jsx("div", {
							className: "text-muted-foreground",
							children: "Need to attend"
						}), /* @__PURE__ */ jsx("div", {
							className: "text-sm font-semibold text-warning",
							children: s.needed
						})]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-4 flex gap-2",
					children: [/* @__PURE__ */ jsxs(Button, {
						onClick: onPresent,
						size: "sm",
						className: "flex-1 bg-success/15 text-success hover:bg-success/25",
						children: [/* @__PURE__ */ jsx(Check, { className: "mr-1 h-4 w-4" }), " Present"]
					}), /* @__PURE__ */ jsxs(Button, {
						onClick: onAbsent,
						size: "sm",
						variant: "outline",
						className: "flex-1 border-destructive/30 text-destructive hover:bg-destructive/10",
						children: [/* @__PURE__ */ jsx(X, { className: "mr-1 h-4 w-4" }), " Absent"]
					})]
				})
			]
		})
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-lg bg-muted/40 py-1.5",
		children: [/* @__PURE__ */ jsx("div", {
			className: "text-sm font-semibold",
			children: value
		}), /* @__PURE__ */ jsx("div", {
			className: "text-[10px] text-muted-foreground",
			children: label
		})]
	});
}
function ringColor(s) {
	if (s === "safe") return {
		stroke: "oklch(from var(--success) l c h)",
		track: "bg-success/20 [&>div]:bg-success"
	};
	if (s === "warning") return {
		stroke: "oklch(from var(--warning) l c h)",
		track: "bg-warning/20 [&>div]:bg-warning"
	};
	return {
		stroke: "oklch(from var(--destructive) l c h)",
		track: "bg-destructive/20 [&>div]:bg-destructive"
	};
}
function Ring({ value, status }) {
	const size = 84, stroke = 8;
	const r = (size - stroke) / 2;
	const c = 2 * Math.PI * r;
	const offset = c - Math.min(100, value) / 100 * c;
	const color = ringColor(status).stroke;
	return /* @__PURE__ */ jsxs("div", {
		className: "relative shrink-0",
		style: {
			width: size,
			height: size
		},
		children: [/* @__PURE__ */ jsxs("svg", {
			width: size,
			height: size,
			className: "-rotate-90",
			children: [/* @__PURE__ */ jsx("circle", {
				cx: size / 2,
				cy: size / 2,
				r,
				stroke: "oklch(from var(--muted) l c h)",
				strokeWidth: stroke,
				fill: "none"
			}), /* @__PURE__ */ jsx("circle", {
				cx: size / 2,
				cy: size / 2,
				r,
				stroke: color,
				strokeWidth: stroke,
				fill: "none",
				strokeDasharray: c,
				strokeDashoffset: offset,
				strokeLinecap: "round",
				className: "transition-[stroke-dashoffset] duration-500"
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "absolute inset-0 grid place-items-center",
			children: /* @__PURE__ */ jsxs("div", {
				className: "text-base font-bold",
				children: [value, "%"]
			})
		})]
	});
}
function EmptyState({ onAdd, hasAny }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col items-center justify-center rounded-3xl border border-dashed py-16 text-center",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary",
				children: /* @__PURE__ */ jsx(BookOpen, { className: "h-7 w-7" })
			}),
			/* @__PURE__ */ jsx("h3", {
				className: "mt-4 text-base font-semibold",
				children: hasAny ? "No subjects match your filters" : "No subjects added yet"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-1 max-w-xs text-sm text-muted-foreground",
				children: hasAny ? "Try clearing filters or search." : "Add your first subject to start tracking attendance."
			}),
			!hasAny && /* @__PURE__ */ jsxs(Button, {
				onClick: onAdd,
				className: "mt-5 gradient-primary text-primary-foreground",
				children: [/* @__PURE__ */ jsx(Plus, { className: "mr-1 h-4 w-4" }), " Add subject"]
			})
		]
	});
}
function SubjectDialog({ open, onOpenChange, initial, onSubmit, submitting }) {
	const [form, setForm] = useState({
		name: "",
		code: "",
		faculty: "",
		semester: "",
		target_percentage: 75,
		total_classes: 0,
		attended_classes: 0
	});
	useEffect(() => {
		if (open) setForm({
			name: initial?.name ?? "",
			code: initial?.code ?? "",
			faculty: initial?.faculty ?? "",
			semester: initial?.semester ?? "",
			target_percentage: initial?.target_percentage ?? 75,
			total_classes: initial?.total_classes ?? 0,
			attended_classes: initial?.attended_classes ?? 0
		});
	}, [open, initial]);
	return /* @__PURE__ */ jsx(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "max-w-md",
			children: [/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: initial ? "Edit subject" : "Add subject" }), /* @__PURE__ */ jsx(DialogDescription, { children: initial ? "Update subject info or attendance counts." : "Add a subject and set your attendance target." })] }), /* @__PURE__ */ jsxs("form", {
				onSubmit: (e) => {
					e.preventDefault();
					if (!form.name.trim()) return toast.error("Subject name is required");
					if (form.attended_classes > form.total_classes) return toast.error("Attended can't exceed total classes");
					onSubmit({
						...form,
						id: initial?.id
					});
				},
				className: "space-y-3",
				children: [
					/* @__PURE__ */ jsx(Field, {
						label: "Subject name *",
						children: /* @__PURE__ */ jsx(Input, {
							value: form.name,
							onChange: (e) => setForm({
								...form,
								name: e.target.value
							}),
							placeholder: "Data Structures"
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ jsx(Field, {
							label: "Code",
							children: /* @__PURE__ */ jsx(Input, {
								value: form.code,
								onChange: (e) => setForm({
									...form,
									code: e.target.value
								}),
								placeholder: "CS201"
							})
						}), /* @__PURE__ */ jsx(Field, {
							label: "Semester",
							children: /* @__PURE__ */ jsx(Input, {
								value: form.semester,
								onChange: (e) => setForm({
									...form,
									semester: e.target.value
								}),
								placeholder: "Sem 3"
							})
						})]
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "Faculty",
						children: /* @__PURE__ */ jsx(Input, {
							value: form.faculty,
							onChange: (e) => setForm({
								...form,
								faculty: e.target.value
							}),
							placeholder: "Prof. Sharma"
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid grid-cols-3 gap-3",
						children: [
							/* @__PURE__ */ jsx(Field, {
								label: "Target %",
								children: /* @__PURE__ */ jsx(Input, {
									type: "number",
									min: 1,
									max: 100,
									value: form.target_percentage,
									onChange: (e) => setForm({
										...form,
										target_percentage: Number(e.target.value) || 0
									})
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Attended",
								children: /* @__PURE__ */ jsx(Input, {
									type: "number",
									min: 0,
									value: form.attended_classes,
									onChange: (e) => setForm({
										...form,
										attended_classes: Number(e.target.value) || 0
									})
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Total",
								children: /* @__PURE__ */ jsx(Input, {
									type: "number",
									min: 0,
									value: form.total_classes,
									onChange: (e) => setForm({
										...form,
										total_classes: Number(e.target.value) || 0
									})
								})
							})
						]
					}),
					/* @__PURE__ */ jsxs(DialogFooter, { children: [/* @__PURE__ */ jsx(Button, {
						type: "button",
						variant: "outline",
						onClick: () => onOpenChange(false),
						children: "Cancel"
					}), /* @__PURE__ */ jsx(Button, {
						type: "submit",
						disabled: submitting,
						className: "gradient-primary text-primary-foreground",
						children: submitting ? "Saving…" : initial ? "Save changes" : "Add subject"
					})] })
				]
			})]
		})
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ jsx(Label, {
			className: "text-xs",
			children: label
		}), children]
	});
}
//#endregion
export { AttendancePage as component };
