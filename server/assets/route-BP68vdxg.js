import { n as useTheme } from "./use-theme-BkcEFP8e.js";
import { t as supabase } from "./client-CjRwkL__.js";
import { n as useAuth } from "./use-auth-BE1JWkQ8.js";
import { t as cn } from "./utils-C_uf36nf.js";
import { t as Button } from "./button-BkEeRci-.js";
import { t as Input } from "./input-B8Q2ztVi.js";
import { a as DropdownMenuSeparator, i as DropdownMenuLabel, n as DropdownMenuContent, o as DropdownMenuTrigger, r as DropdownMenuItem, t as DropdownMenu } from "./dropdown-menu-BtjXROHi.js";
import * as React from "react";
import { useState } from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
import { Bell, BookOpen, Briefcase, CalendarCheck, CalendarDays, FolderKanban, GraduationCap, LayoutDashboard, LogOut, Menu, Moon, Search, Settings, Sun, UserSquare2, X } from "lucide-react";
import { cva } from "class-variance-authority";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
//#region src/components/ui/avatar.tsx
var Avatar = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AvatarPrimitive.Root, {
	ref,
	className: cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className),
	...props
}));
Avatar.displayName = AvatarPrimitive.Root.displayName;
var AvatarImage = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AvatarPrimitive.Image, {
	ref,
	className: cn("aspect-square h-full w-full", className),
	...props
}));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;
var AvatarFallback = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AvatarPrimitive.Fallback, {
	ref,
	className: cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className),
	...props
}));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
//#endregion
//#region src/components/ui/sheet.tsx
var Sheet = SheetPrimitive.Root;
var SheetPortal = SheetPrimitive.Portal;
var SheetOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SheetPrimitive.Overlay, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = React.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxs(SheetPortal, { children: [/* @__PURE__ */ jsx(SheetOverlay, {}), /* @__PURE__ */ jsxs(SheetPrimitive.Content, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ jsxs(SheetPrimitive.Close, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ jsx(X, { className: "h-4 w-4" }), /* @__PURE__ */ jsx("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = SheetPrimitive.Content.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ jsx("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SheetPrimitive.Title, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = SheetPrimitive.Title.displayName;
var SheetDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SheetPrimitive.Description, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = SheetPrimitive.Description.displayName;
//#endregion
//#region src/components/app-shell.tsx
var nav = [
	{
		label: "Dashboard",
		to: "/dashboard",
		icon: LayoutDashboard
	},
	{
		label: "Assignments",
		to: "/assignments",
		icon: BookOpen
	},
	{
		label: "Attendance",
		to: "/attendance",
		icon: CalendarCheck
	},
	{
		label: "Exams",
		to: "/exams",
		icon: GraduationCap
	},
	{
		label: "Projects",
		to: "/projects",
		icon: FolderKanban
	},
	{
		label: "Internships",
		to: "/internships",
		icon: Briefcase
	},
	{
		label: "Portfolio",
		to: "/portfolio",
		icon: UserSquare2
	},
	{
		label: "Calendar",
		to: "/calendar",
		icon: CalendarDays
	}
];
var mobileNav = nav.slice(0, 5);
function AppShell({ children }) {
	const [mobileOpen, setMobileOpen] = useState(false);
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ jsx("aside", {
				className: "fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border bg-sidebar md:block",
				children: /* @__PURE__ */ jsx(SidebarContent, {})
			}),
			/* @__PURE__ */ jsx(Sheet, {
				open: mobileOpen,
				onOpenChange: setMobileOpen,
				children: /* @__PURE__ */ jsx(SheetContent, {
					side: "left",
					className: "w-72 p-0 bg-sidebar",
					children: /* @__PURE__ */ jsx(SidebarContent, { onNavigate: () => setMobileOpen(false) })
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "md:pl-64",
				children: [/* @__PURE__ */ jsx(TopBar, { onMenu: () => setMobileOpen(true) }), /* @__PURE__ */ jsx("main", {
					className: "mx-auto w-full max-w-7xl px-4 pb-24 pt-4 md:px-8 md:pb-10 md:pt-6",
					children
				})]
			}),
			/* @__PURE__ */ jsx(MobileBottomNav, {})
		]
	});
}
function SidebarContent({ onNavigate }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ jsxs("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ jsxs(Link, {
				to: "/dashboard",
				onClick: onNavigate,
				className: "flex items-center gap-2 px-5 py-5",
				children: [/* @__PURE__ */ jsx("div", {
					className: "grid h-9 w-9 place-items-center rounded-xl gradient-primary shadow-glow",
					children: /* @__PURE__ */ jsx(GraduationCap, { className: "h-5 w-5 text-primary-foreground" })
				}), /* @__PURE__ */ jsxs("div", {
					className: "leading-tight",
					children: [/* @__PURE__ */ jsx("div", {
						className: "text-base font-bold tracking-tight",
						children: "Campus Buddy"
					}), /* @__PURE__ */ jsx("div", {
						className: "text-[10px] uppercase tracking-wider text-muted-foreground",
						children: "Student manager"
					})]
				})]
			}),
			/* @__PURE__ */ jsx("nav", {
				className: "mt-2 flex-1 space-y-1 px-3",
				children: nav.map((item) => {
					const active = pathname === item.to || pathname.startsWith(item.to + "/");
					return /* @__PURE__ */ jsxs(Link, {
						to: item.to,
						onClick: onNavigate,
						className: cn("group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"),
						children: [/* @__PURE__ */ jsx(item.icon, { className: cn("h-[18px] w-[18px]", active && "text-primary") }), item.label]
					}, item.to);
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "border-t p-3",
				children: /* @__PURE__ */ jsxs(Link, {
					to: "/settings",
					onClick: onNavigate,
					className: "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground",
					children: [/* @__PURE__ */ jsx(Settings, { className: "h-[18px] w-[18px]" }), " Settings"]
				})
			})
		]
	});
}
function TopBar({ onMenu }) {
	const { theme, toggle } = useTheme();
	return /* @__PURE__ */ jsx("header", {
		className: "sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl",
		children: /* @__PURE__ */ jsxs("div", {
			className: "mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:px-8",
			children: [
				/* @__PURE__ */ jsx(Button, {
					variant: "ghost",
					size: "icon",
					className: "md:hidden",
					onClick: onMenu,
					children: /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "relative hidden flex-1 max-w-md md:block",
					children: [/* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ jsx(Input, {
						placeholder: "Search assignments, exams, projects…",
						className: "pl-9 bg-muted/40 border-transparent focus-visible:bg-background"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "ml-auto flex items-center gap-1",
					children: [
						/* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "icon",
							onClick: toggle,
							"aria-label": "Toggle theme",
							children: theme === "dark" ? /* @__PURE__ */ jsx(Sun, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Moon, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "Notifications",
							children: /* @__PURE__ */ jsx(Bell, { className: "h-5 w-5" })
						}),
						/* @__PURE__ */ jsx(ProfileMenu, {})
					]
				})
			]
		})
	});
}
function ProfileMenu() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";
	const avatar = user?.user_metadata?.avatar_url;
	const initials = name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
	const signOut = async () => {
		await supabase.auth.signOut();
		toast.success("Signed out");
		navigate({ to: "/auth" });
	};
	return /* @__PURE__ */ jsxs(DropdownMenu, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ jsx("button", {
			className: "ml-1 inline-flex items-center gap-2 rounded-full p-0.5 outline-none transition hover:ring-2 hover:ring-primary/30",
			children: /* @__PURE__ */ jsxs(Avatar, {
				className: "h-9 w-9",
				children: [/* @__PURE__ */ jsx(AvatarImage, {
					src: avatar,
					alt: name
				}), /* @__PURE__ */ jsx(AvatarFallback, {
					className: "bg-primary/10 text-primary text-xs font-semibold",
					children: initials
				})]
			})
		})
	}), /* @__PURE__ */ jsxs(DropdownMenuContent, {
		align: "end",
		className: "w-56",
		children: [
			/* @__PURE__ */ jsxs(DropdownMenuLabel, { children: [/* @__PURE__ */ jsx("div", {
				className: "text-sm font-medium",
				children: name
			}), /* @__PURE__ */ jsx("div", {
				className: "text-xs font-normal text-muted-foreground",
				children: user?.email
			})] }),
			/* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
			/* @__PURE__ */ jsx(DropdownMenuItem, {
				asChild: true,
				children: /* @__PURE__ */ jsxs(Link, {
					to: "/settings",
					children: [/* @__PURE__ */ jsx(Settings, { className: "mr-2 h-4 w-4" }), "Settings"]
				})
			}),
			/* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
			/* @__PURE__ */ jsxs(DropdownMenuItem, {
				onClick: signOut,
				className: "text-destructive focus:text-destructive",
				children: [/* @__PURE__ */ jsx(LogOut, { className: "mr-2 h-4 w-4" }), " Sign out"]
			})
		]
	})] });
}
function MobileBottomNav() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ jsx("nav", {
		className: "fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 backdrop-blur-xl md:hidden",
		children: /* @__PURE__ */ jsx("ul", {
			className: "mx-auto grid max-w-md grid-cols-5",
			children: mobileNav.map((item) => {
				const active = pathname === item.to || pathname.startsWith(item.to + "/");
				return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(Link, {
					to: item.to,
					className: cn("flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition", active ? "text-primary" : "text-muted-foreground"),
					children: [/* @__PURE__ */ jsx(item.icon, { className: "h-5 w-5" }), item.label]
				}) }, item.to);
			})
		})
	});
}
//#endregion
//#region src/routes/_authenticated/route.tsx?tsr-split=component
var SplitComponent = () => /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsx(Outlet, {}) });
//#endregion
export { SplitComponent as component };
