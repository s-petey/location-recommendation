import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	type PropsWithChildren,
	createContext,
	useContext,
	useEffect,
	useLayoutEffect,
	useState,
} from "react";

// Theme context
export type Theme = "light" | "dark";

interface ThemeContextType {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): Theme {
	if (typeof window !== "undefined" && window.matchMedia) {
		return window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	}
	return "light";
}

function getStoredTheme(): Theme | null {
	if (typeof window !== "undefined") {
		return (localStorage.getItem("theme") as Theme) || null;
	}
	return null;
}

export function ThemeProvider({ children }: PropsWithChildren) {
	const [theme, setThemeState] = useState<Theme>(
		() => getStoredTheme() || getSystemTheme(),
	);

	// Set theme on body and persist
	useLayoutEffect(() => {
		// Only update if not already set (prevents double re-render on mount)
		if (!document.documentElement.classList.contains(theme)) {
			document.documentElement.classList.remove("light", "dark");
			document.documentElement.classList.add(theme);
		}
		localStorage.setItem("theme", theme);
		document.cookie = `theme=${theme}; path=/; max-age=31536000`;
	}, [theme]);

	// Listen to system changes
	useEffect(() => {
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = (e: MediaQueryListEvent) => {
			if (!getStoredTheme()) {
				setThemeState(e.matches ? "dark" : "light");
			}
		};
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	const setTheme = (t: Theme) => setThemeState(t);
	const toggleTheme = () =>
		setThemeState((t) => (t === "dark" ? "light" : "dark"));

	return (
		<ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
	return ctx;
}

export function getContext() {
	const queryClient = new QueryClient();
	return {
		queryClient,
	};
}

export function Provider({
	children,
	queryClient,
}: PropsWithChildren<{
	queryClient: QueryClient;
}>) {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider>{children}</ThemeProvider>
		</QueryClientProvider>
	);
}
