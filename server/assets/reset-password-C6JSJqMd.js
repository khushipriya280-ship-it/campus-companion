import { t as supabase } from "./client-CjRwkL__.js";
import { t as Button } from "./button-BkEeRci-.js";
import { t as Input } from "./input-B8Q2ztVi.js";
import { t as Label } from "./label-DBD1bRRP.js";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, Lock } from "lucide-react";
//#region src/routes/reset-password.tsx?tsr-split=component
function ResetPasswordPage() {
	const navigate = useNavigate();
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const submit = async (e) => {
		e.preventDefault();
		const parsed = z.string().min(6, "At least 6 characters").max(72).safeParse(password);
		if (!parsed.success) {
			toast.error(parsed.error.issues[0].message);
			return;
		}
		setLoading(true);
		const { error } = await supabase.auth.updateUser({ password });
		setLoading(false);
		if (error) {
			toast.error(error.message);
			return;
		}
		toast.success("Password updated");
		navigate({ to: "/dashboard" });
	};
	return /* @__PURE__ */ jsx("div", {
		className: "grid min-h-screen place-items-center px-4",
		children: /* @__PURE__ */ jsxs("form", {
			onSubmit: submit,
			className: "w-full max-w-md rounded-3xl border bg-card p-6 shadow-elevated md:p-8 space-y-4",
			children: [
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-xl font-semibold",
					children: "Set a new password"
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Pick something you'll remember."
				})] }),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ jsx(Label, {
						htmlFor: "np",
						children: "New password"
					}), /* @__PURE__ */ jsxs("div", {
						className: "relative",
						children: [/* @__PURE__ */ jsx(Lock, { className: "pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ jsx(Input, {
							id: "np",
							type: "password",
							className: "pl-9",
							value: password,
							onChange: (e) => setPassword(e.target.value)
						})]
					})]
				}),
				/* @__PURE__ */ jsxs(Button, {
					type: "submit",
					className: "w-full gradient-primary text-primary-foreground",
					disabled: loading,
					children: [loading && /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Update password"]
				})
			]
		})
	});
}
//#endregion
export { ResetPasswordPage as component };
