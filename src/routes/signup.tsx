import { Auth } from "@/components/Auth";
import { useSignupMutation } from "@/lib/useSignup";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/signup")({
	component: SignupComp,
});

function SignupComp() {
	const router = useRouter();
	const signupMutation = useSignupMutation(router);

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] bg-white dark:bg-gray-900 text-black dark:text-white">
			<div className="p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800 w-full max-w-md">
				<Auth
					actionText="Sign Up"
					status={signupMutation.status}
					onSubmit={(e) => {
						const formData = new FormData(e.target as HTMLFormElement);
						signupMutation.mutate({
							email: formData.get("email") as string,
							password: formData.get("password") as string,
						});
					}}
					afterSubmit={
						signupMutation.error ? (
							<div className="text-red-400">{signupMutation.error.message}</div>
						) : null
					}
				/>

				<hr className="my-4" />
				<div className="text-center text-sm">or</div>
				<hr className="my-4" />
				<div className="flex justify-center">
					<Link
						to="/login"
						className="rounded-sm bg-cyan-600 px-2 py-2 font-black text-sm text-white uppercase hover:bg-cyan-700"
					>
						Have an account?
					</Link>
				</div>
			</div>
		</div>
	);
}
