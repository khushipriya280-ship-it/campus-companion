import { t as supabase } from "./client-CjRwkL__.js";
import { createContext, useContext, useEffect, useState } from "react";
import { jsx } from "react/jsx-runtime";
//#region src/hooks/use-auth.tsx
var AuthContext = createContext({
	user: null,
	session: null,
	loading: true
});
function AuthProvider({ children }) {
	const [session, setSession] = useState(null);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
			setSession(s);
		});
		supabase.auth.getSession().then(({ data }) => {
			setSession(data.session);
			setLoading(false);
		});
		return () => sub.subscription.unsubscribe();
	}, []);
	return /* @__PURE__ */ jsx(AuthContext.Provider, {
		value: {
			user: session?.user ?? null,
			session,
			loading
		},
		children
	});
}
var useAuth = () => useContext(AuthContext);
//#endregion
export { useAuth as n, AuthProvider as t };
