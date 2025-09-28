import { useMutation } from "@tanstack/react-query";
import type { useRouter } from "@tanstack/react-router";
import { type } from "arktype";
import { authClient } from "./auth-client";
import { emailAuthSchema } from "./auth.helpers";

export function useSignupMutation(router: ReturnType<typeof useRouter>) {
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

			return await authClient.signUp.email(
				{
					email: result.email,
					password: result.password,
					name: result.email,
				},
				{
					onError: () => {
						throw new Error("Signup failed. Please try again.");
					},
					onSuccess: () => {
						router.navigate({
							to: "redirectUrl" in data ? data.redirectUrl : "/category",
						});
					},
				},
			);
		},
	});
}
