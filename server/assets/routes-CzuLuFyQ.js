import { n as useAuth } from "./use-auth-BE1JWkQ8.js";
import { t as Button } from "./button-BkEeRci-.js";
import { useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { ArrowRight, BookOpen, Briefcase, CalendarCheck, CheckCircle2, GraduationCap, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
//#region src/routes/index.tsx?tsr-split=component
function Landing() {
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	useEffect(() => {
		if (!loading && user) navigate({ to: "/dashboard" });
	}, [
		user,
		loading,
		navigate
	]);
	const features = [
		{
			icon: BookOpen,
			title: "Assignments",
			desc: "Never miss a deadline."
		},
		{
			icon: CalendarCheck,
			title: "Attendance",
			desc: "Stay above 75% effortlessly."
		},
		{
			icon: GraduationCap,
			title: "Exam Planner",
			desc: "Countdown & revision tracker."
		},
		{
			icon: Briefcase,
			title: "Internships",
			desc: "Kanban for every application."
		},
		{
			icon: TrendingUp,
			title: "Projects",
			desc: "Ship side projects with progress tracking."
		},
		{
			icon: Sparkles,
			title: "Portfolio",
			desc: "Skills, certs, links — one profile."
		}
	];
	return /* @__PURE__ */ jsxs("div", {
		className: "relative min-h-screen overflow-hidden",
		children: [
			/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 gradient-hero" }),
			/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" }),
			/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-info/20 blur-3xl" }),
			/* @__PURE__ */ jsxs("header", {
				className: "relative z-10 flex items-center justify-between px-6 py-5 md:px-12",
				children: [/* @__PURE__ */ jsxs(Link, {
					to: "/",
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx("div", {
						className: "grid h-9 w-9 place-items-center rounded-xl gradient-primary shadow-glow",
						children: /* @__PURE__ */ jsx(GraduationCap, { className: "h-5 w-5 text-primary-foreground" })
					}), /* @__PURE__ */ jsx("span", {
						className: "text-lg font-bold tracking-tight",
						children: "Campus Buddy"
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsx(Link, {
						to: "/auth",
						children: /* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "sm",
							children: "Sign in"
						})
					}), /* @__PURE__ */ jsx(Link, {
						to: "/auth",
						search: { mode: "signup" },
						children: /* @__PURE__ */ jsx(Button, {
							size: "sm",
							className: "gradient-primary text-primary-foreground shadow-soft",
							children: "Get started"
						})
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("main", {
				className: "relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-12 md:pt-20",
				children: [/* @__PURE__ */ jsxs(motion.div, {
					initial: {
						opacity: 0,
						y: 24
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: { duration: .6 },
					className: "text-center",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium backdrop-blur",
							children: [/* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" }), "Your complete student life manager"]
						}),
						/* @__PURE__ */ jsxs("h1", {
							className: "text-4xl font-bold tracking-tight md:text-6xl",
							children: [
								"Replace 10 student apps with",
								" ",
								/* @__PURE__ */ jsx("span", {
									className: "text-gradient",
									children: "one beautiful"
								}),
								" dashboard."
							]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg",
							children: "Assignments, attendance, exams, projects, internships and your portfolio — all in one place. Designed for students who want their life on track without the chaos."
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row",
							children: [/* @__PURE__ */ jsx(Link, {
								to: "/auth",
								search: { mode: "signup" },
								children: /* @__PURE__ */ jsxs(Button, {
									size: "lg",
									className: "gradient-primary text-primary-foreground shadow-glow",
									children: ["Start for free ", /* @__PURE__ */ jsx(ArrowRight, { className: "ml-1 h-4 w-4" })]
								})
							}), /* @__PURE__ */ jsx(Link, {
								to: "/auth",
								children: /* @__PURE__ */ jsx(Button, {
									size: "lg",
									variant: "outline",
									children: "I already have an account"
								})
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ jsxs("span", {
									className: "inline-flex items-center gap-1.5",
									children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-success" }), " Free forever"]
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "inline-flex items-center gap-1.5",
									children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-success" }), " No credit card"]
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "inline-flex items-center gap-1.5",
									children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-success" }), " Built for students"]
								})
							]
						})
					]
				}), /* @__PURE__ */ jsx("div", {
					className: "mt-20 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
					children: features.map((f, i) => /* @__PURE__ */ jsxs(motion.div, {
						initial: {
							opacity: 0,
							y: 16
						},
						whileInView: {
							opacity: 1,
							y: 0
						},
						viewport: { once: true },
						transition: {
							delay: i * .05,
							duration: .4
						},
						className: "rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "mb-3 inline-grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary",
								children: /* @__PURE__ */ jsx(f.icon, { className: "h-5 w-5" })
							}),
							/* @__PURE__ */ jsx("h3", {
								className: "font-semibold",
								children: f.title
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: f.desc
							})
						]
					}, f.title))
				})]
			})
		]
	});
}
//#endregion
export { Landing as component };
