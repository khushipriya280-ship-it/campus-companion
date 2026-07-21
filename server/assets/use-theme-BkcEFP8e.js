import { createContext, useContext, useEffect, useState } from "react";
import { jsx } from "react/jsx-runtime";
//#region src/hooks/use-theme.tsx
var ThemeContext = createContext({
	theme: "light",
	setTheme: () => {},
	toggle: () => {}
});
function ThemeProvider({ children }) {
	const [theme, setThemeState] = useState("light");
	useEffect(() => {
		const saved = typeof window !== "undefined" && localStorage.getItem("cb-theme") || null;
		const prefersDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
		setThemeState(saved ?? (prefersDark ? "dark" : "light"));
	}, []);
	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
		try {
			localStorage.setItem("cb-theme", theme);
		} catch {}
	}, [theme]);
	return /* @__PURE__ */ jsx(ThemeContext.Provider, {
		value: {
			theme,
			setTheme: setThemeState,
			toggle: () => setThemeState((t) => t === "dark" ? "light" : "dark")
		},
		children
	});
}
var useTheme = () => useContext(ThemeContext);
//#endregion
export { useTheme as n, ThemeProvider as t };
