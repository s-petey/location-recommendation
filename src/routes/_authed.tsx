import { serverFetchSession } from "@/lib/auth.helpers";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed")({
	beforeLoad: async () => {
		const authSession = await serverFetchSession();

		if (!authSession?.session?.token) {
			throw redirect({
				to: "/login",
				replace: true,
				throw: true,
				// TODO: Get proper from...
				// from:
			});
		}
	},
});
