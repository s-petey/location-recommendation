import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { type ReactNode, StrictMode, Suspense, lazy } from "react";

import appCss from "../styles.css?url";

import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import Header from "@/components/Header";
import { NotFound } from "@/components/NotFound";
import { ThemeProvider } from "@/components/ThemeProvider";
import { env } from "@/lib/env";
import { seo } from "@/lib/seo";
import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				name: "apple-mobile-web-app-title",
				content: "Location Recommendation",
			},
			...seo({
				title: "Location Recommendation | Leave decision fatigue behind",
				description: "Give us a category we make a decision for you.",
			}),
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "96x96",
				href: "/favicon-96x96.png",
			},
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg",
			},
			{
				rel: "shortcut icon",
				href: "/favicon.ico",
			},
			{ rel: "manifest", href: "/manifest.json", color: "#fffff" },
			{ rel: "icon", href: "/favicon.ico" },
		],
	}),

	shellComponent: RootComponent,
	errorComponent: (props) => {
		return (
			<RootDocument>
				<DefaultCatchBoundary {...props} />
			</RootDocument>
		);
	},
	notFoundComponent: () => <NotFound />,
});

function RootComponent() {
	return (
		<StrictMode>
			<ThemeProvider>
				<RootDocument>
					<Outlet />
				</RootDocument>
			</ThemeProvider>
		</StrictMode>
	);
}

function RootDocument({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white transition-colors">
				<Header />
				{children}

				{env.DEV_TOOLS && (
					<Suspense fallback={null}>
						<TanStackDevtools
							config={{
								position: "bottom-left",
							}}
							plugins={[
								TanStackRouterDevtoolsPlugin,
								TanStackQueryDevtoolsPlugin,
							]}
						/>
					</Suspense>
				)}

				<Scripts />
			</body>
		</html>
	);
}

// Lazy load devtools
const TanStackDevtools = lazy(() =>
	import("@tanstack/react-devtools").then((m) => ({
		default: m.TanStackDevtools,
	})),
);
const TanStackRouterDevtoolsPanel = lazy(() =>
	import("@tanstack/react-router-devtools").then((m) => ({
		default: m.TanStackRouterDevtoolsPanel,
	})),
);

// Plugin wrappers for lazy loading
const TanStackRouterDevtoolsPlugin = {
	name: "Tanstack Router",
	render: (
		<Suspense fallback={null}>
			<TanStackRouterDevtoolsPanel />
		</Suspense>
	),
};
const TanStackQueryDevtoolsPanel = lazy(() =>
	import("@tanstack/react-query-devtools").then((m) => ({
		default: m.ReactQueryDevtoolsPanel,
	})),
);

const TanStackQueryDevtoolsPlugin = {
	name: "Tanstack Query",
	render: (
		<Suspense fallback={null}>
			<TanStackQueryDevtoolsPanel />
		</Suspense>
	),
};
