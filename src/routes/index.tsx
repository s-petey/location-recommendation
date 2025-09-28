import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: App,
	// beforeLoad: async () => {
	// 	const authed = await serverFetchSession();

	// 	if (authed?.session?.token) {
	// 		throw redirect({
	// 			to: "/category",
	// 		});
	// 	}
	// },
});

function App() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] bg-white dark:bg-gray-900 text-black dark:text-white">
			<div className="p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800">
				<h3 className="text-2xl font-bold mb-2">Log in to get random suggestions!</h3>
				<p className="text-gray-600 dark:text-gray-300">Sign up or log in to start using the app and get personalized recommendations.</p>
			</div>
		</div>
	);
}
