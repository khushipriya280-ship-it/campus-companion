import { n as useTheme } from "./use-theme-BkcEFP8e.js";
import { t as supabase } from "./client-CjRwkL__.js";
import { n as useAuth } from "./use-auth-BE1JWkQ8.js";
import { t as cn } from "./utils-C_uf36nf.js";
import { t as Button } from "./button-BkEeRci-.js";
import { t as Input } from "./input-B8Q2ztVi.js";
import { t as Label } from "./label-DBD1bRRP.js";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-BXjpJ96D.js";
import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
import { Loader2, LogOut, Moon, Sun } from "lucide-react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
//#region src/components/ui/switch.tsx
var Switch = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SwitchPrimitives.Root, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ jsx(SwitchPrimitives.Thumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = SwitchPrimitives.Root.displayName;
//#endregion
//#region src/routes/_authenticated/settings.tsx?tsr-split=component
function SettingsPage() {
	const { user } = useAuth();
	const { theme, toggle } = useTheme();
	const navigate = useNavigate();
	const [fullName, setFullName] = useState("");
	const [university, setUniversity] = useState("");
	const [course, setCourse] = useState("");
	const [year, setYear] = useState("");
	const [loading, setLoading] = useState(false);
	useEffect(() => {
		if (!user) return;
		(async () => {
			const { data } = await supabase.from("profiles").select("full_name, university, course, year").eq("id", user.id).maybeSingle();
			if (data) {
				setFullName(data.full_name ?? "");
				setUniversity(data.university ?? "");
				setCourse(data.course ?? "");
				setYear(data.year ?? "");
			}
		})();
	}, [user]);
	const saveProfile = async () => {
		if (!user) return;
		setLoading(true);
		const { error } = await supabase.from("profiles").update({
			full_name: fullName,
			university,
			course,
			year
		}).eq("id", user.id);
		setLoading(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Profile saved");
	};
	const signOut = async () => {
		await supabase.auth.signOut();
		navigate({ to: "/auth" });
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
				className: "text-2xl font-bold tracking-tight",
				children: "Settings"
			}), /* @__PURE__ */ jsx("p", {
				className: "text-sm text-muted-foreground",
				children: "Manage your profile and preferences."
			})] }),
			/* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, {
				className: "text-base",
				children: "Profile"
			}) }), /* @__PURE__ */ jsxs(CardContent, {
				className: "space-y-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ jsx(Label, {
								htmlFor: "name",
								children: "Full name"
							}), /* @__PURE__ */ jsx(Input, {
								id: "name",
								value: fullName,
								onChange: (e) => setFullName(e.target.value)
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ jsx(Label, { children: "Email" }), /* @__PURE__ */ jsx(Input, {
								value: user?.email ?? "",
								disabled: true
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ jsx(Label, {
								htmlFor: "uni",
								children: "University / College"
							}), /* @__PURE__ */ jsx(Input, {
								id: "uni",
								value: university,
								onChange: (e) => setUniversity(e.target.value),
								placeholder: "e.g. IIT Bombay"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ jsx(Label, {
								htmlFor: "course",
								children: "Course"
							}), /* @__PURE__ */ jsx(Input, {
								id: "course",
								value: course,
								onChange: (e) => setCourse(e.target.value),
								placeholder: "e.g. B.Tech CSE"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ jsx(Label, {
								htmlFor: "year",
								children: "Year"
							}), /* @__PURE__ */ jsx(Input, {
								id: "year",
								value: year,
								onChange: (e) => setYear(e.target.value),
								placeholder: "e.g. 2nd year"
							})]
						})
					]
				}), /* @__PURE__ */ jsxs(Button, {
					onClick: saveProfile,
					disabled: loading,
					className: "gradient-primary text-primary-foreground",
					children: [loading && /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), " Save changes"]
				})]
			})] }),
			/* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, {
				className: "text-base",
				children: "Appearance"
			}) }), /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between rounded-xl border p-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [theme === "dark" ? /* @__PURE__ */ jsx(Moon, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Sun, { className: "h-5 w-5" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
						className: "text-sm font-medium",
						children: "Dark mode"
					}), /* @__PURE__ */ jsx("div", {
						className: "text-xs text-muted-foreground",
						children: "Switch between light and dark themes."
					})] })]
				}), /* @__PURE__ */ jsx(Switch, {
					checked: theme === "dark",
					onCheckedChange: toggle
				})]
			}) })] }),
			/* @__PURE__ */ jsxs(Card, { children: [/* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, {
				className: "text-base",
				children: "Account"
			}) }), /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Button, {
				variant: "outline",
				onClick: signOut,
				children: [/* @__PURE__ */ jsx(LogOut, { className: "mr-2 h-4 w-4" }), " Sign out"]
			}) })] })
		]
	});
}
//#endregion
export { SettingsPage as component };
