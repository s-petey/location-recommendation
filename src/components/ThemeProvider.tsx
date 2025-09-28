import { ScriptOnce } from "@tanstack/react-router";
import { createClientOnlyFn, createIsomorphicFn } from "@tanstack/react-start";
import { type } from "arktype";
import { type ReactNode, createContext, use, useState } from "react";

const UserThemeSchema = type.or("'light'", "'dark'");
export type UserTheme = type.infer<typeof UserThemeSchema>;

const THEME_STORAGE_KEY = "loc-rec-theme";

const getStoredUserTheme = createIsomorphicFn()
	.server((): UserTheme => "light")
	.client((): UserTheme => {
		const stored = localStorage.getItem(THEME_STORAGE_KEY);
		const result = UserThemeSchema(stored);
		if (result instanceof type.errors) {
			return "light";
		}
		return result;
	});

const setStoredTheme = createClientOnlyFn((theme: UserTheme) => {
	const validatedTheme = UserThemeSchema(theme);
	if (validatedTheme instanceof type.errors) {
		throw new Error("Invalid theme");
	}

	localStorage.setItem(THEME_STORAGE_KEY, validatedTheme);
});

const handleThemeChange = createClientOnlyFn((userTheme: UserTheme) => {
	const validatedTheme = UserThemeSchema(userTheme);
	if (validatedTheme instanceof type.errors) {
		throw new Error("Invalid theme");
	}

	const root = document.documentElement;
	root.classList.remove("light", "dark", "system");

	root.classList.add(validatedTheme);
});

const themeScript = (() => {
	function themeFn() {
		try {
			const storedTheme = localStorage.getItem(
				"loc-rec-theme" satisfies typeof THEME_STORAGE_KEY,
			);
			let validTheme: UserTheme = "light";
			if (storedTheme === "light" || storedTheme === "dark") {
				validTheme = storedTheme;
			}

			document.documentElement.classList.add(validTheme);
		} catch (e) {
			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
				.matches
				? "dark"
				: "light";
			document.documentElement.classList.add(systemTheme, "system");
		}
	}
	return `(${themeFn.toString()})();`;
})();

type ThemeContextProps = {
	userTheme: UserTheme;
	setTheme: (theme: UserTheme) => void;
};
const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

type ThemeProviderProps = {
	children: ReactNode;
};
export function ThemeProvider({ children }: ThemeProviderProps) {
	const [userTheme, setUserTheme] = useState<UserTheme>(getStoredUserTheme);

	const setTheme = (newUserTheme: UserTheme) => {
		const validatedTheme = UserThemeSchema(newUserTheme);
		if (validatedTheme instanceof type.errors) {
			throw new Error("Invalid theme");
		}

		setUserTheme(validatedTheme);
		setStoredTheme(validatedTheme);
		handleThemeChange(validatedTheme);
	};

	return (
		<ThemeContext value={{ userTheme, setTheme }}>
			{/* biome-ignore lint/correctness/noChildrenProp: <explanation> */}
			<ScriptOnce children={themeScript} />

			{children}
		</ThemeContext>
	);
}

export const useTheme = () => {
	const context = use(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
};
