import { t as supabase } from "./client-CjRwkL__.js";
import { n as useAuth } from "./use-auth-BE1JWkQ8.js";
import { t as cn } from "./utils-C_uf36nf.js";
import { t as Button } from "./button-BkEeRci-.js";
import { t as Badge } from "./badge-D1Dupn2y.js";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BXjpJ96D.js";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Briefcase, CalendarCheck, CheckCircle2, Clock, Flag, FolderKanban, GraduationCap, Plus, Sparkles, TrendingUp, UserSquare2 } from "lucide-react";
import { motion } from "framer-motion";
import { differenceInCalendarDays, differenceInMilliseconds, format, isPast, isToday, isTomorrow } from "date-fns";
//#region src/routes/_authenticated/dashboard.tsx?tsr-split=component
function Dashboard() {
	const { user } = useAuth();
	const name = (user?.user_metadata?.full_name)?.split(" ")[0] || user?.email?.split("@")[0] || "there";
	const greeting = (() => {
		const h = (/* @__PURE__ */ new Date()).getHours();
		if (h < 12) return "Good morning";
		if (h < 17) return "Good afternoon";
		return "Good evening";
	})();
	const today = (/* @__PURE__ */ new Date()).toLocaleDateString(void 0, {
		weekday: "long",
		month: "long",
		day: "numeric"
	});
	const { data: assignments = [] } = useQuery({
		queryKey: ["assignments-dashboard", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data, error } = await supabase.from("assignments").select("id,title,subject,priority,status,deadline");
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: subjects = [] } = useQuery({
		queryKey: ["subjects-dashboard", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data, error } = await supabase.from("subjects").select("id,name,attended_classes,total_classes,target_percentage");
			if (error) throw error;
			return data ?? [];
		}
	});
	const { data: exams = [] } = useQuery({
		queryKey: ["exams-dashboard", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data, error } = await supabase.from("exams").select("id,subject,title,exam_type,exam_date,exam_time,status,revision_progress,room");
			if (error) throw error;
			return data ?? [];
		}
	});
	const [now, setNow] = useState(() => /* @__PURE__ */ new Date());
	useEffect(() => {
		const id = window.setInterval(() => setNow(/* @__PURE__ */ new Date()), 6e4);
		return () => window.clearInterval(id);
	}, []);
	const examEnriched = exams.map((e) => {
		const t = e.exam_time ?? "09:00:00";
		const dt = /* @__PURE__ */ new Date(`${e.exam_date}T${t.length === 5 ? t + ":00" : t}`);
		let computed = e.status;
		if (computed !== "completed") computed = differenceInMilliseconds(now, dt) > 360 * 60 * 1e3 ? "missed" : "upcoming";
		return {
			...e,
			_dt: dt,
			_computed: computed
		};
	});
	const nextExam = examEnriched.filter((e) => e._computed === "upcoming").sort((a, b) => a._dt.getTime() - b._dt.getTime())[0];
	const examCounts = {
		upcoming: examEnriched.filter((e) => e._computed === "upcoming").length,
		today: examEnriched.filter((e) => isToday(e._dt)).length,
		completed: examEnriched.filter((e) => e._computed === "completed").length
	};
	const attendance = (() => {
		if (subjects.length === 0) return {
			overall: 0,
			count: 0,
			lowest: null,
			status: "—"
		};
		const totA = subjects.reduce((s, x) => s + x.attended_classes, 0);
		const totT = subjects.reduce((s, x) => s + x.total_classes, 0);
		const overall = totT > 0 ? Math.round(totA / totT * 1e3) / 10 : 0;
		const lowest = [...subjects.map((s) => ({
			name: s.name,
			pct: s.total_classes > 0 ? Math.round(s.attended_classes / s.total_classes * 1e3) / 10 : 0
		}))].sort((a, b) => a.pct - b.pct)[0];
		const status = overall >= 85 ? "Safe" : overall >= 75 ? "Warning" : "Critical";
		return {
			overall,
			count: subjects.length,
			lowest,
			status
		};
	})();
	const counts = (() => {
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
	})();
	const upcomingList = assignments.filter((a) => a.status !== "completed" && a.status !== "archived" && a.deadline).sort((a, b) => (a.deadline ?? "").localeCompare(b.deadline ?? "")).slice(0, 5);
	const dueCount = counts.dueToday + counts.upcoming + counts.overdue;
	const stats = [
		{
			label: "Assignments due",
			value: String(dueCount),
			icon: BookOpen,
			tint: "primary"
		},
		{
			label: "Attendance",
			value: attendance.count > 0 ? `${attendance.overall}%` : "—",
			icon: CalendarCheck,
			tint: attendance.overall >= 85 ? "success" : attendance.overall >= 75 ? "warning" : "info"
		},
		{
			label: "Upcoming exams",
			value: String(examCounts.upcoming),
			icon: GraduationCap,
			tint: "warning"
		},
		{
			label: "Active projects",
			value: "0",
			icon: FolderKanban,
			tint: "info"
		}
	];
	const quickActions = [
		{
			label: "Add assignment",
			to: "/assignments",
			icon: BookOpen
		},
		{
			label: "Add attendance",
			to: "/attendance",
			icon: CalendarCheck
		},
		{
			label: "Add exam",
			to: "/exams",
			icon: GraduationCap
		},
		{
			label: "Add project",
			to: "/projects",
			icon: FolderKanban
		},
		{
			label: "Add internship",
			to: "/internships",
			icon: Briefcase
		},
		{
			label: "Add portfolio item",
			to: "/portfolio",
			icon: UserSquare2
		}
	];
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ jsxs(motion.div, {
				initial: {
					opacity: 0,
					y: 12
				},
				animate: {
					opacity: 1,
					y: 0
				},
				transition: { duration: .4 },
				className: "relative overflow-hidden rounded-3xl border bg-card p-6 shadow-soft md:p-8",
				children: [
					/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 gradient-hero opacity-80" }),
					/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" }),
					/* @__PURE__ */ jsxs("div", {
						className: "relative",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "inline-flex items-center gap-1.5 rounded-full bg-card/70 px-2.5 py-1 text-[11px] font-medium backdrop-blur",
								children: [
									/* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3 text-primary" }),
									" ",
									today
								]
							}),
							/* @__PURE__ */ jsxs("h1", {
								className: "mt-3 text-2xl font-bold tracking-tight md:text-3xl",
								children: [
									greeting,
									", ",
									/* @__PURE__ */ jsx("span", {
										className: "text-gradient",
										children: name
									}),
									" 👋"
								]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "Here's a quick look at your day. Let's make it productive."
							})
						]
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4",
				children: stats.map((s, i) => /* @__PURE__ */ jsx(motion.div, {
					initial: {
						opacity: 0,
						y: 12
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: { delay: i * .05 },
					children: /* @__PURE__ */ jsx(Card, {
						className: "border-border/60 shadow-soft",
						children: /* @__PURE__ */ jsxs(CardContent, {
							className: "p-4 md:p-5",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ jsx("div", {
										className: "grid h-9 w-9 place-items-center rounded-xl " + tintBg(s.tint),
										children: /* @__PURE__ */ jsx(s.icon, { className: "h-[18px] w-[18px] " + tintText(s.tint) })
									}), /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4 text-muted-foreground/60" })]
								}),
								/* @__PURE__ */ jsx("div", {
									className: "mt-3 text-2xl font-bold tracking-tight",
									children: s.value
								}),
								/* @__PURE__ */ jsx("div", {
									className: "text-xs text-muted-foreground",
									children: s.label
								})
							]
						})
					})
				}, s.label))
			}),
			/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsxs("h2", {
				className: "mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground",
				children: [/* @__PURE__ */ jsx(BookOpen, { className: "h-4 w-4" }), " Assignments overview"]
			}), /* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-2 gap-3 md:grid-cols-4",
				children: [
					/* @__PURE__ */ jsx(MiniStat, {
						label: "Due today",
						value: counts.dueToday,
						icon: Clock,
						tone: "warning",
						to: "/assignments"
					}),
					/* @__PURE__ */ jsx(MiniStat, {
						label: "Upcoming",
						value: counts.upcoming,
						icon: BookOpen,
						tone: "primary",
						to: "/assignments"
					}),
					/* @__PURE__ */ jsx(MiniStat, {
						label: "Overdue",
						value: counts.overdue,
						icon: Flag,
						tone: "destructive",
						to: "/assignments"
					}),
					/* @__PURE__ */ jsx(MiniStat, {
						label: "Completed",
						value: counts.completed,
						icon: CheckCircle2,
						tone: "success",
						to: "/assignments"
					})
				]
			})] }),
			/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsxs("h2", {
				className: "mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground",
				children: [/* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }), " Quick actions"]
			}), /* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6",
				children: quickActions.map((a) => /* @__PURE__ */ jsx(Link, {
					to: a.to,
					children: /* @__PURE__ */ jsxs(Button, {
						variant: "outline",
						className: "h-auto w-full justify-start gap-2 rounded-xl py-3 text-sm font-medium hover:border-primary/40 hover:bg-primary/5",
						children: [
							/* @__PURE__ */ jsx(a.icon, { className: "h-4 w-4 text-primary" }),
							" ",
							a.label
						]
					})
				}, a.to))
			})] }),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6",
				children: [
					/* @__PURE__ */ jsxs(Card, {
						className: "border-border/60 shadow-soft lg:col-span-2",
						children: [/* @__PURE__ */ jsxs(CardHeader, {
							className: "flex flex-row items-center justify-between space-y-0 pb-3",
							children: [/* @__PURE__ */ jsx(CardTitle, {
								className: "text-base",
								children: "Upcoming assignments"
							}), /* @__PURE__ */ jsx(Link, {
								to: "/assignments",
								className: "text-xs text-primary hover:underline",
								children: "View all"
							})]
						}), /* @__PURE__ */ jsx(CardContent, { children: upcomingList.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {
							icon: BookOpen,
							title: "No upcoming assignments",
							description: "You're all caught up. Add a new task to start tracking deadlines.",
							cta: /* @__PURE__ */ jsx(Link, {
								to: "/assignments",
								children: /* @__PURE__ */ jsxs(Button, {
									size: "sm",
									className: "gradient-primary text-primary-foreground",
									children: [/* @__PURE__ */ jsx(Plus, { className: "mr-1 h-4 w-4" }), " Add assignment"]
								})
							})
						}) : /* @__PURE__ */ jsx("ul", {
							className: "divide-y",
							children: upcomingList.map((a) => {
								const d = a.deadline ? new Date(a.deadline) : null;
								const tone = !d ? "muted" : isToday(d) ? "warning" : d < /* @__PURE__ */ new Date() ? "destructive" : "primary";
								const label = !d ? "No deadline" : isToday(d) ? `Today · ${format(d, "h:mm a")}` : isTomorrow(d) ? `Tomorrow · ${format(d, "h:mm a")}` : d < /* @__PURE__ */ new Date() ? `Overdue · ${Math.abs(differenceInCalendarDays(d, /* @__PURE__ */ new Date()))}d ago` : format(d, "MMM d · h:mm a");
								return /* @__PURE__ */ jsxs("li", {
									className: "flex items-center gap-3 py-2.5",
									children: [
										/* @__PURE__ */ jsx("div", {
											className: cn("grid h-9 w-9 place-items-center rounded-xl", tintBg("primary")),
											children: /* @__PURE__ */ jsx(BookOpen, { className: cn("h-4 w-4", tintText("primary")) })
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ jsx("span", {
													className: "truncate text-sm font-medium",
													children: a.title
												}), a.subject && /* @__PURE__ */ jsxs("span", {
													className: "hidden text-xs text-muted-foreground sm:inline",
													children: ["· ", a.subject]
												})]
											}), /* @__PURE__ */ jsx("div", {
												className: cn("text-xs", toneText(tone)),
												children: label
											})]
										}),
										/* @__PURE__ */ jsx(Badge, {
											variant: "outline",
											className: cn("border text-[10px]", priorityClass(a.priority)),
											children: a.priority
										})
									]
								}, a.id);
							})
						}) })]
					}),
					/* @__PURE__ */ jsx(Link, {
						to: "/attendance",
						className: "lg:col-span-1",
						children: /* @__PURE__ */ jsxs(Card, {
							className: "h-full border-border/60 shadow-soft transition hover:shadow-elevated",
							children: [/* @__PURE__ */ jsxs(CardHeader, {
								className: "flex flex-row items-center justify-between space-y-0 pb-3",
								children: [/* @__PURE__ */ jsx(CardTitle, {
									className: "text-base",
									children: "Attendance"
								}), attendance.count > 0 && /* @__PURE__ */ jsx(Badge, {
									variant: "outline",
									className: cn("text-[10px]", attendance.status === "Safe" && "border-success/30 bg-success/10 text-success", attendance.status === "Warning" && "border-warning/30 bg-warning/15 text-warning", attendance.status === "Critical" && "border-destructive/30 bg-destructive/10 text-destructive"),
									children: attendance.status
								})]
							}), /* @__PURE__ */ jsxs(CardContent, {
								className: "flex flex-col items-center justify-center py-6",
								children: [/* @__PURE__ */ jsx(RingProgress, { value: attendance.overall }), attendance.count === 0 ? /* @__PURE__ */ jsx("p", {
									className: "mt-3 text-center text-xs text-muted-foreground",
									children: "Add subjects in the attendance tracker to see your % here."
								}) : /* @__PURE__ */ jsxs("div", {
									className: "mt-3 w-full space-y-1 text-center text-xs text-muted-foreground",
									children: [/* @__PURE__ */ jsxs("div", { children: [
										attendance.count,
										" subject",
										attendance.count === 1 ? "" : "s",
										" tracked"
									] }), attendance.lowest && /* @__PURE__ */ jsxs("div", { children: [
										"Lowest: ",
										/* @__PURE__ */ jsx("span", {
											className: "font-medium text-foreground",
											children: attendance.lowest.name
										}),
										" · ",
										attendance.lowest.pct,
										"%"
									] })]
								})]
							})]
						})
					}),
					/* @__PURE__ */ jsxs(Card, {
						className: "border-border/60 shadow-soft lg:col-span-2",
						children: [/* @__PURE__ */ jsxs(CardHeader, {
							className: "flex flex-row items-center justify-between space-y-0 pb-3",
							children: [/* @__PURE__ */ jsx(CardTitle, {
								className: "text-base",
								children: "Active projects"
							}), /* @__PURE__ */ jsx(Link, {
								to: "/projects",
								className: "text-xs text-primary hover:underline",
								children: "View all"
							})]
						}), /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(EmptyState, {
							icon: FolderKanban,
							title: "No projects tracked",
							description: "Start a project to track progress, links and deadlines."
						}) })]
					}),
					/* @__PURE__ */ jsx(Link, {
						to: "/exams",
						children: /* @__PURE__ */ jsxs(Card, {
							className: "h-full border-border/60 shadow-soft transition hover:shadow-elevated",
							children: [/* @__PURE__ */ jsxs(CardHeader, {
								className: "flex flex-row items-center justify-between space-y-0 pb-3",
								children: [/* @__PURE__ */ jsx(CardTitle, {
									className: "text-base",
									children: "Next exam countdown"
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-primary hover:underline",
									children: "Open planner →"
								})]
							}), /* @__PURE__ */ jsx(CardContent, { children: nextExam ? /* @__PURE__ */ jsx(NextExamWidget, {
								subject: nextExam.subject,
								title: nextExam.title,
								dt: nextExam._dt,
								now
							}) : /* @__PURE__ */ jsxs("div", {
								className: "flex flex-col items-center justify-center py-8 text-center",
								children: [
									/* @__PURE__ */ jsx("div", {
										className: "text-3xl",
										children: "🎉"
									}),
									/* @__PURE__ */ jsx("div", {
										className: "mt-2 text-sm font-semibold",
										children: "No upcoming exams"
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: "You're all caught up!"
									})
								]
							}) })]
						})
					})
				]
			})
		]
	});
}
function NextExamWidget({ subject, title, dt, now }) {
	const ms = Math.max(0, differenceInMilliseconds(dt, now));
	const totalMin = Math.floor(ms / 6e4);
	const days = Math.floor(totalMin / 1440);
	const hours = Math.floor((totalMin - days * 60 * 24) / 60);
	const mins = totalMin - days * 60 * 24 - hours * 60;
	const tone = ms <= 0 ? "destructive" : days < 3 ? "destructive" : days < 7 ? "warning" : days < 30 ? "primary" : "success";
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
			className: "truncate text-base font-semibold",
			children: title ?? subject
		}), /* @__PURE__ */ jsxs("div", {
			className: "text-xs text-muted-foreground",
			children: [
				"📅 ",
				format(dt, "d MMM yyyy"),
				" • ",
				format(dt, "h:mm a")
			]
		})] }), /* @__PURE__ */ jsxs("div", {
			className: "rounded-2xl border bg-muted/30 p-3",
			children: [/* @__PURE__ */ jsx("div", {
				className: "text-[10px] uppercase tracking-wider text-muted-foreground",
				children: "⏳ Starts in"
			}), /* @__PURE__ */ jsxs("div", {
				className: "mt-1 flex items-end gap-3",
				children: [
					/* @__PURE__ */ jsx(CountdownStat, {
						value: days,
						label: "Days",
						tone
					}),
					/* @__PURE__ */ jsx(CountdownStat, {
						value: hours,
						label: "Hours",
						tone
					}),
					/* @__PURE__ */ jsx(CountdownStat, {
						value: mins,
						label: "Min",
						tone
					})
				]
			})]
		})]
	});
}
function CountdownStat({ value, label, tone }) {
	const color = {
		destructive: "text-destructive",
		warning: "text-warning",
		primary: "text-primary",
		success: "text-success"
	}[tone];
	return /* @__PURE__ */ jsxs("div", {
		className: "text-center",
		children: [/* @__PURE__ */ jsx("div", {
			className: cn("text-2xl font-bold tabular-nums", color),
			children: value.toString().padStart(2, "0")
		}), /* @__PURE__ */ jsx("div", {
			className: "text-[10px] uppercase tracking-wider text-muted-foreground",
			children: label
		})]
	});
}
function MiniStat({ label, value, icon: Icon, tone, to }) {
	const bg = {
		primary: "bg-primary/10 text-primary",
		success: "bg-success/10 text-success",
		warning: "bg-warning/15 text-warning",
		destructive: "bg-destructive/10 text-destructive"
	}[tone];
	return /* @__PURE__ */ jsx(Link, {
		to,
		children: /* @__PURE__ */ jsx(Card, {
			className: "border-border/60 shadow-soft transition hover:shadow-elevated",
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
		})
	});
}
function priorityClass(p) {
	return {
		high: "bg-destructive/10 text-destructive border-destructive/20",
		medium: "bg-warning/15 text-warning border-warning/20",
		low: "bg-success/10 text-success border-success/20"
	}[p];
}
function toneText(t) {
	return {
		muted: "text-muted-foreground",
		warning: "text-warning",
		destructive: "text-destructive",
		primary: "text-primary"
	}[t];
}
function tintBg(tint) {
	return {
		primary: "bg-primary/10",
		success: "bg-success/10",
		warning: "bg-warning/15",
		info: "bg-info/10"
	}[tint];
}
function tintText(tint) {
	return {
		primary: "text-primary",
		success: "text-success",
		warning: "text-warning",
		info: "text-info"
	}[tint];
}
function EmptyState({ icon: Icon, title, description, cta }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col items-center justify-center rounded-2xl border border-dashed py-10 text-center",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "grid h-12 w-12 place-items-center rounded-2xl bg-muted text-muted-foreground",
				children: /* @__PURE__ */ jsx(Icon, { className: "h-6 w-6" })
			}),
			/* @__PURE__ */ jsx("h3", {
				className: "mt-3 text-sm font-semibold",
				children: title
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-1 max-w-xs text-xs text-muted-foreground",
				children: description
			}),
			cta && /* @__PURE__ */ jsx("div", {
				className: "mt-4",
				children: cta
			})
		]
	});
}
function RingProgress({ value }) {
	const size = 120;
	const stroke = 10;
	const r = (size - stroke) / 2;
	const c = 2 * Math.PI * r;
	const offset = c - value / 100 * c;
	return /* @__PURE__ */ jsxs("div", {
		className: "relative",
		style: {
			width: size,
			height: size
		},
		children: [
			/* @__PURE__ */ jsxs("svg", {
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
					stroke: "oklch(from var(--primary) l c h)",
					strokeWidth: stroke,
					fill: "none",
					strokeDasharray: c,
					strokeDashoffset: offset,
					strokeLinecap: "round",
					className: "transition-[stroke-dashoffset] duration-700"
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "absolute inset-0 grid place-items-center",
				children: /* @__PURE__ */ jsxs("div", {
					className: "text-2xl font-bold",
					children: [value, "%"]
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "absolute inset-x-0 -bottom-1 grid place-items-center",
				children: /* @__PURE__ */ jsx("div", {
					className: "rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground",
					children: "Target 75%"
				})
			})
		]
	});
}
//#endregion
export { Dashboard as component };
