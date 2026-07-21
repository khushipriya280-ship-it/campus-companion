import { t as Button } from "./button-BkEeRci-.js";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
//#region src/components/coming-soon.tsx
function ComingSoon({ icon: Icon, title, description }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
			className: "text-2xl font-bold tracking-tight",
			children: title
		}), /* @__PURE__ */ jsx("p", {
			className: "text-sm text-muted-foreground",
			children: description
		})] }), /* @__PURE__ */ jsxs(motion.div, {
			initial: {
				opacity: 0,
				y: 12
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
						children: /* @__PURE__ */ jsx(Icon, { className: "h-8 w-8" })
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "mt-6 text-xl font-semibold",
						children: "Launching in the next build"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mx-auto mt-2 max-w-md text-sm text-muted-foreground",
						children: "We're shipping Campus Buddy in phases. This module is queued for the next phase along with full CRUD, filtering and beautiful empty states."
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-6 inline-flex items-center gap-1.5 rounded-full border bg-card/70 px-3 py-1 text-xs font-medium backdrop-blur",
						children: [/* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" }), "Phase 2 — Core trackers"]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-6",
						children: /* @__PURE__ */ jsx(Link, {
							to: "/dashboard",
							children: /* @__PURE__ */ jsx(Button, {
								variant: "outline",
								children: "Back to dashboard"
							})
						})
					})
				]
			})]
		})]
	});
}
//#endregion
export { ComingSoon as t };
