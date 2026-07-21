import { t as supabase } from "./client-CjRwkL__.js";
import { n as useAuth } from "./use-auth-BE1JWkQ8.js";
import { t as Route } from "./auth-BnMfTp1y.js";
import { t as Button } from "./button-BkEeRci-.js";
import { t as Input } from "./input-B8Q2ztVi.js";
import { t as Label } from "./label-DBD1bRRP.js";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.js";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft, GraduationCap, Loader2, Lock, Mail, User } from "lucide-react";
import { motion } from "framer-motion";
import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
//#region src/integrations/lovable/index.ts
var lovableAuth = createLovableAuth();
var lovable = { auth: { signInWithOAuth: async (provider, opts) => {
	const result = await lovableAuth.signInWithOAuth(provider, {
		redirect_uri: opts?.redirect_uri,
		extraParams: { ...opts?.extraParams }
	});
	if (result.redirected) return result;
	if (result.error) return result;
	try {
		await supabase.auth.setSession(result.tokens);
	} catch (e) {
		return { error: e instanceof Error ? e : new Error(String(e)) };
	}
	return result;
} } };
//#endregion
//#region src/routes/auth.tsx?tsr-split=component
function AuthPage() {
	const { mode } = Route.useSearch();
	const navigate = useNavigate();
	const { user, loading } = useAuth();
	useEffect(() => {
		if (!loading && user) navigate({ to: "/dashboard" });
	}, [
		user,
		loading,
		navigate
	]);
	return /* @__PURE__ */ jsxs("div", {
		className: "relative grid min-h-screen place-items-center overflow-hidden px-4 py-10",
		children: [
			/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 gradient-hero" }),
			/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" }),
			/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-info/20 blur-3xl" }),
			/* @__PURE__ */ jsxs(motion.div, {
				initial: {
					opacity: 0,
					y: 16
				},
				animate: {
					opacity: 1,
					y: 0
				},
				transition: { duration: .4 },
				className: "relative z-10 w-full max-w-md",
				children: [/* @__PURE__ */ jsxs(Link, {
					to: "/",
					className: "mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground",
					children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }), " Back home"]
				}), /* @__PURE__ */ jsxs("div", {
					className: "rounded-3xl border border-border/60 bg-card/80 p-6 backdrop-blur-xl shadow-elevated md:p-8",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "mb-6 flex items-center gap-2",
						children: [/* @__PURE__ */ jsx("div", {
							className: "grid h-9 w-9 place-items-center rounded-xl gradient-primary shadow-glow",
							children: /* @__PURE__ */ jsx(GraduationCap, { className: "h-5 w-5 text-primary-foreground" })
						}), /* @__PURE__ */ jsx("span", {
							className: "text-lg font-bold tracking-tight",
							children: "Campus Buddy"
						})]
					}), mode === "forgot" ? /* @__PURE__ */ jsx(ForgotForm, {}) : /* @__PURE__ */ jsx(SigninSignup, { defaultTab: mode === "signup" ? "signup" : "signin" })]
				})]
			})
		]
	});
}
function SigninSignup({ defaultTab }) {
	return /* @__PURE__ */ jsxs(Tabs, {
		defaultValue: defaultTab,
		className: "w-full",
		children: [
			/* @__PURE__ */ jsxs(TabsList, {
				className: "grid w-full grid-cols-2",
				children: [/* @__PURE__ */ jsx(TabsTrigger, {
					value: "signin",
					children: "Sign in"
				}), /* @__PURE__ */ jsx(TabsTrigger, {
					value: "signup",
					children: "Sign up"
				})]
			}),
			/* @__PURE__ */ jsx(TabsContent, {
				value: "signin",
				className: "mt-6",
				children: /* @__PURE__ */ jsx(SignInForm, {})
			}),
			/* @__PURE__ */ jsx(TabsContent, {
				value: "signup",
				className: "mt-6",
				children: /* @__PURE__ */ jsx(SignUpForm, {})
			})
		]
	});
}
function GoogleButton() {
	const [loading, setLoading] = useState(false);
	const handleGoogle = async () => {
		setLoading(true);
		const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
		if (result.error) {
			toast.error(result.error.message || "Couldn't sign in with Google");
			setLoading(false);
			return;
		}
		if (result.redirected) return;
		window.location.href = "/dashboard";
	};
	return /* @__PURE__ */ jsxs(Button, {
		type: "button",
		variant: "outline",
		className: "w-full",
		onClick: handleGoogle,
		disabled: loading,
		children: [loading ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxs("svg", {
			className: "mr-2 h-4 w-4",
			viewBox: "0 0 24 24",
			children: [
				/* @__PURE__ */ jsx("path", {
					fill: "#4285F4",
					d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
				}),
				/* @__PURE__ */ jsx("path", {
					fill: "#34A853",
					d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
				}),
				/* @__PURE__ */ jsx("path", {
					fill: "#FBBC05",
					d: "M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18a11 11 0 0 0 0 9.87l3.66-2.84z"
				}),
				/* @__PURE__ */ jsx("path", {
					fill: "#EA4335",
					d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
				})
			]
		}), "Continue with Google"]
	});
}
var credsSchema = z.object({
	email: z.string().trim().email("Enter a valid email").max(255),
	password: z.string().min(6, "At least 6 characters").max(72)
});
function SignInForm() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const submit = async (e) => {
		e.preventDefault();
		const parsed = credsSchema.safeParse({
			email,
			password
		});
		if (!parsed.success) {
			toast.error(parsed.error.issues[0].message);
			return;
		}
		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword(parsed.data);
		setLoading(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Welcome back!");
		navigate({ to: "/dashboard" });
	};
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: submit,
		className: "space-y-4",
		children: [
			/* @__PURE__ */ jsx(GoogleButton, {}),
			/* @__PURE__ */ jsx(Divider, {}),
			/* @__PURE__ */ jsxs("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ jsx(Label, {
					htmlFor: "si-email",
					children: "Email"
				}), /* @__PURE__ */ jsxs("div", {
					className: "relative",
					children: [/* @__PURE__ */ jsx(Mail, { className: "pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ jsx(Input, {
						id: "si-email",
						type: "email",
						placeholder: "you@college.edu",
						className: "pl-9",
						value: email,
						onChange: (e) => setEmail(e.target.value)
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ jsx(Label, {
						htmlFor: "si-password",
						children: "Password"
					}), /* @__PURE__ */ jsx(Link, {
						to: "/auth",
						search: { mode: "forgot" },
						className: "text-xs text-primary hover:underline",
						children: "Forgot?"
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "relative",
					children: [/* @__PURE__ */ jsx(Lock, { className: "pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ jsx(Input, {
						id: "si-password",
						type: "password",
						placeholder: "••••••••",
						className: "pl-9",
						value: password,
						onChange: (e) => setPassword(e.target.value)
					})]
				})]
			}),
			/* @__PURE__ */ jsxs(Button, {
				type: "submit",
				className: "w-full gradient-primary text-primary-foreground shadow-soft",
				disabled: loading,
				children: [loading && /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Sign in"]
			})
		]
	});
}
var signupSchema = credsSchema.extend({ fullName: z.string().trim().min(2, "Name is too short").max(100) });
function SignUpForm() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const submit = async (e) => {
		e.preventDefault();
		const parsed = signupSchema.safeParse({
			fullName,
			email,
			password
		});
		if (!parsed.success) {
			toast.error(parsed.error.issues[0].message);
			return;
		}
		setLoading(true);
		const { error } = await supabase.auth.signUp({
			email: parsed.data.email,
			password: parsed.data.password,
			options: {
				emailRedirectTo: window.location.origin + "/dashboard",
				data: { full_name: parsed.data.fullName }
			}
		});
		setLoading(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Account created! Welcome to Campus Buddy 🎉");
		navigate({ to: "/dashboard" });
	};
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: submit,
		className: "space-y-4",
		children: [
			/* @__PURE__ */ jsx(GoogleButton, {}),
			/* @__PURE__ */ jsx(Divider, {}),
			/* @__PURE__ */ jsxs("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ jsx(Label, {
					htmlFor: "su-name",
					children: "Full name"
				}), /* @__PURE__ */ jsxs("div", {
					className: "relative",
					children: [/* @__PURE__ */ jsx(User, { className: "pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ jsx(Input, {
						id: "su-name",
						type: "text",
						placeholder: "Alex Kumar",
						className: "pl-9",
						value: fullName,
						onChange: (e) => setFullName(e.target.value)
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ jsx(Label, {
					htmlFor: "su-email",
					children: "Email"
				}), /* @__PURE__ */ jsxs("div", {
					className: "relative",
					children: [/* @__PURE__ */ jsx(Mail, { className: "pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ jsx(Input, {
						id: "su-email",
						type: "email",
						placeholder: "you@college.edu",
						className: "pl-9",
						value: email,
						onChange: (e) => setEmail(e.target.value)
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ jsx(Label, {
					htmlFor: "su-password",
					children: "Password"
				}), /* @__PURE__ */ jsxs("div", {
					className: "relative",
					children: [/* @__PURE__ */ jsx(Lock, { className: "pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ jsx(Input, {
						id: "su-password",
						type: "password",
						placeholder: "At least 6 characters",
						className: "pl-9",
						value: password,
						onChange: (e) => setPassword(e.target.value)
					})]
				})]
			}),
			/* @__PURE__ */ jsxs(Button, {
				type: "submit",
				className: "w-full gradient-primary text-primary-foreground shadow-soft",
				disabled: loading,
				children: [loading && /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Create account"]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-center text-xs text-muted-foreground",
				children: "By signing up you agree to our terms and privacy policy."
			})
		]
	});
}
function ForgotForm() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const submit = async (e) => {
		e.preventDefault();
		if (!z.string().email().safeParse(email).success) {
			toast.error("Enter a valid email");
			return;
		}
		setLoading(true);
		const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" });
		setLoading(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Check your inbox for a reset link");
	};
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: submit,
		className: "space-y-4",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
				className: "text-xl font-semibold",
				children: "Reset your password"
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "We'll email you a secure link."
			})] }),
			/* @__PURE__ */ jsxs("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ jsx(Label, {
					htmlFor: "fp-email",
					children: "Email"
				}), /* @__PURE__ */ jsxs("div", {
					className: "relative",
					children: [/* @__PURE__ */ jsx(Mail, { className: "pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ jsx(Input, {
						id: "fp-email",
						type: "email",
						placeholder: "you@college.edu",
						className: "pl-9",
						value: email,
						onChange: (e) => setEmail(e.target.value)
					})]
				})]
			}),
			/* @__PURE__ */ jsxs(Button, {
				type: "submit",
				className: "w-full gradient-primary text-primary-foreground shadow-soft",
				disabled: loading,
				children: [loading && /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Send reset link"]
			}),
			/* @__PURE__ */ jsx(Link, {
				to: "/auth",
				className: "block text-center text-xs text-primary hover:underline",
				children: "Back to sign in"
			})
		]
	});
}
function Divider() {
	return /* @__PURE__ */ jsxs("div", {
		className: "relative my-2",
		children: [/* @__PURE__ */ jsx("div", {
			className: "absolute inset-0 flex items-center",
			children: /* @__PURE__ */ jsx("div", { className: "w-full border-t" })
		}), /* @__PURE__ */ jsx("div", {
			className: "relative flex justify-center text-xs",
			children: /* @__PURE__ */ jsx("span", {
				className: "bg-card px-2 text-muted-foreground",
				children: "or with email"
			})
		})]
	});
}
//#endregion
export { AuthPage as component };
