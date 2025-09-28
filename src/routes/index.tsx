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
		<div className="text-center">
			<div className="p-2">
				<h3>Log in to get random suggestions!</h3>
			</div>
		</div>
	);
}
