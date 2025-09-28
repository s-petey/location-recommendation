import { useMutation } from "@tanstack/react-query";
import type { useRouter } from "@tanstack/react-router";
import { authClient } from "./auth-client";

export function useLogoutMutation(router: ReturnType<typeof useRouter>) {
	return useMutation({
		mutationFn: async () => {
			return await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						router.navigate({
							to: "/login",
						});
					},
					onError: (error) => {
						console.error("Logout error: ", error);
					},
				},
			});
		},
	});
}
