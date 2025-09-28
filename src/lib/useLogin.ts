import { useMutation } from "@tanstack/react-query";
import type { useRouter } from "@tanstack/react-router";
import { type } from "arktype";
import { emailAuthSchema } from "./auth.helpers.js";
import { authClient } from "./auth-client.js";

export function useLoginMutation(router: ReturnType<typeof useRouter>) {
	return useMutation({
		mutationFn: async (data: {
			email: string;
			password: string;
			redirectUrl?: string;
		}) => {
			const result = emailAuthSchema(data);

			if (result instanceof type.errors) {
				console.error("parseError: ", result.summary);

				throw new Error(result.summary);
			}

			return await authClient.signIn.email(
				{
					email: result.email,
					password: result.password,
				},
				{
					onSuccess: (data) => {
						router.navigate({
							to:
								"redirectUrl" in data && typeof data.redirectUrl === "string"
									? data.redirectUrl
									: "/category",
						});
					},
					onError: () => {
						throw new Error("Login failed. Please try again.");
					},
				},
			);
		},
	});
}
