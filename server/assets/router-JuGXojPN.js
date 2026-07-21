import { t as ThemeProvider } from "./use-theme-BkcEFP8e.js";
import { t as supabase } from "./client-CjRwkL__.js";
import { t as AuthProvider } from "./use-auth-BE1JWkQ8.js";
import { t as Route$13 } from "./auth-BnMfTp1y.js";
import { useEffect } from "react";
import { HeadContent, Link, Outlet, Scripts, createFileRoute, createRootRouteWithContext, createRouter, lazyRouteComponent, redirect, useRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
//#region src/styles.css?url
var styles_default = "/campus-companion/assets/styles-CQs_Fv5k.css";
//#endregion
//#region src/lib/lovable-error-reporting.ts
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
//#endregion
//#region src/routes/__root.tsx
function NotFoundComponent() {
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-7xl font-bold text-gradient",
					children: "404"
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "mt-4 text-xl font-semibold",
					children: "Page not found"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-6",
					children: /* @__PURE__ */ jsx(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	useEffect(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-xl font-semibold tracking-tight",
					children: "Something went wrong"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Please try again or head home."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ jsx("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft",
						children: "Try again"
					}), /* @__PURE__ */ jsx("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$12 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Campus Buddy — Your Complete Student Life Manager" },
			{
				name: "description",
				content: "Campus Buddy is the all-in-one student productivity app for assignments, attendance, exams, projects, internships and career prep."
			},
			{
				property: "og:title",
				content: "Campus Buddy — Student Life Manager"
			},
			{
				property: "og:description",
				content: "Manage assignments, attendance, exams, projects and internships from one beautiful place."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "en",
		children: [/* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }), /* @__PURE__ */ jsxs("body", { children: [children, /* @__PURE__ */ jsx(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$12.useRouteContext();
	return /* @__PURE__ */ jsx(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ jsx(ThemeProvider, { children: /* @__PURE__ */ jsxs(AuthProvider, { children: [/* @__PURE__ */ jsx(Outlet, {}), /* @__PURE__ */ jsx(Toaster, {
			position: "top-right",
			richColors: true,
			closeButton: true
		})] }) })
	});
}
//#endregion
//#region src/routes/reset-password.tsx
var $$splitComponentImporter$11 = () => import("./reset-password-C6JSJqMd.js");
var Route$11 = createFileRoute("/reset-password")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
//#endregion
//#region src/routes/_authenticated/route.tsx
var $$splitComponentImporter$10 = () => import("./route-BP68vdxg.js");
var Route$10 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) throw redirect({ to: "/auth" });
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
//#endregion
//#region src/routes/index.tsx
var $$splitComponentImporter$9 = () => import("./routes-CzuLuFyQ.js");
var Route$9 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
//#endregion
//#region src/routes/_authenticated/settings.tsx
var $$splitComponentImporter$8 = () => import("./settings-CEZrczC1.js");
var Route$8 = createFileRoute("/_authenticated/settings")({
	head: () => ({ meta: [{ title: "Settings · Campus Buddy" }] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
//#endregion
//#region src/routes/_authenticated/projects.tsx
var $$splitComponentImporter$7 = () => import("./projects-DSdKreQH.js");
var Route$7 = createFileRoute("/_authenticated/projects")({
	head: () => ({ meta: [{ title: "Projects · Campus Buddy" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
//#endregion
//#region src/routes/_authenticated/portfolio.tsx
var $$splitComponentImporter$6 = () => import("./portfolio-BGPJB6uX.js");
var Route$6 = createFileRoute("/_authenticated/portfolio")({
	head: () => ({ meta: [{ title: "Portfolio · Campus Buddy" }] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
//#endregion
//#region src/routes/_authenticated/internships.tsx
var $$splitComponentImporter$5 = () => import("./internships-CLXuv-hy.js");
var Route$5 = createFileRoute("/_authenticated/internships")({
	head: () => ({ meta: [{ title: "Internships · Campus Buddy" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
//#endregion
//#region src/routes/_authenticated/exams.tsx
var $$splitComponentImporter$4 = () => import("./exams-D5iN0Fs_.js");
var Route$4 = createFileRoute("/_authenticated/exams")({
	head: () => ({ meta: [{ title: "Exams · Campus Buddy" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
//#endregion
//#region src/routes/_authenticated/dashboard.tsx
var $$splitComponentImporter$3 = () => import("./dashboard-CqnqK32m.js");
var Route$3 = createFileRoute("/_authenticated/dashboard")({
	head: () => ({ meta: [{ title: "Dashboard · Campus Buddy" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
//#endregion
//#region src/routes/_authenticated/calendar.tsx
var $$splitComponentImporter$2 = () => import("./calendar-Bpi9aqle.js");
var Route$2 = createFileRoute("/_authenticated/calendar")({
	head: () => ({ meta: [{ title: "Calendar · Campus Buddy" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
//#endregion
//#region src/routes/_authenticated/attendance.tsx
var $$splitComponentImporter$1 = () => import("./attendance-BMYfb9vo.js");
var Route$1 = createFileRoute("/_authenticated/attendance")({
	head: () => ({ meta: [{ title: "Attendance · Campus Buddy" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
//#endregion
//#region src/routes/_authenticated/assignments.tsx
var $$splitComponentImporter = () => import("./assignments-D1wT0ZM_.js");
var Route = createFileRoute("/_authenticated/assignments")({
	head: () => ({ meta: [{ title: "Assignments · Campus Buddy" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
//#region src/routeTree.gen.ts
var ResetPasswordRoute = Route$11.update({
	id: "/reset-password",
	path: "/reset-password",
	getParentRoute: () => Route$12
});
var AuthRoute = Route$13.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$12
});
var AuthenticatedRouteRoute = Route$10.update({
	id: "/_authenticated",
	getParentRoute: () => Route$12
});
var IndexRoute = Route$9.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$12
});
var AuthenticatedSettingsRoute = Route$8.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedProjectsRoute = Route$7.update({
	id: "/projects",
	path: "/projects",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedPortfolioRoute = Route$6.update({
	id: "/portfolio",
	path: "/portfolio",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedInternshipsRoute = Route$5.update({
	id: "/internships",
	path: "/internships",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedExamsRoute = Route$4.update({
	id: "/exams",
	path: "/exams",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDashboardRoute = Route$3.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedCalendarRoute = Route$2.update({
	id: "/calendar",
	path: "/calendar",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedAttendanceRoute = Route$1.update({
	id: "/attendance",
	path: "/attendance",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedRouteRouteChildren = {
	AuthenticatedAssignmentsRoute: Route.update({
		id: "/assignments",
		path: "/assignments",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedAttendanceRoute,
	AuthenticatedCalendarRoute,
	AuthenticatedDashboardRoute,
	AuthenticatedExamsRoute,
	AuthenticatedInternshipsRoute,
	AuthenticatedPortfolioRoute,
	AuthenticatedProjectsRoute,
	AuthenticatedSettingsRoute
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AuthRoute,
	ResetPasswordRoute
};
var routeTree = Route$12._addFileChildren(rootRouteChildren)._addFileTypes();
//#endregion
//#region src/router.tsx
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0,
		basepath: "/campus-companion"
	});
};
//#endregion
export { getRouter };
