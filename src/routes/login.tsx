import { Auth } from "@/components/Auth";
import { useLoginMutation } from "@/lib/useLogin";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
	component: LoginComp,
});

function LoginComp() {
	const router = useRouter();
	const { mutate, status, error } = useLoginMutation(router);

	return (
		<>
			<Auth
				actionText="Login"
				status={status}
				onSubmit={(e) => {
					const formData = new FormData(e.target as HTMLFormElement);

					mutate({
						email: formData.get("email") as string,
						password: formData.get("password") as string,
					});
				}}
				afterSubmit={
					error?.message ? (
						<>
							<div className="text-red-400">{error.message}</div>
						</>
					) : null
				}
				// TODO: Consider the following:
				// afterSubmit={
				// loginMutation.data ? (
				//   <>
				//     <div className='text-red-400'>{loginMutation.data.message}</div>
				//     {loginMutation.data.userNotFound ? (
				//       <div>
				//         <button
				//           className='text-blue-500'
				//           onClick={(e) => {
				//             const formData = new FormData(
				//               (e.target as HTMLButtonElement).form!
				//             );

				//             signupMutation.mutate({
				//               email: formData.get('email') as string,
				//               password: formData.get('password') as string,
				//             });
				//           }}
				//           type='button'
				//         >
				//           Sign up instead?
				//         </button>
				//       </div>
				//     ) : null}
				//   </>
				// ) : null
				// }
			/>
			<hr className="my-4" />
			<div className="text-center text-sm">or</div>
			<hr className="my-4" />
			<div className="flex justify-center">
				<Link
					to="/signup"
					className="rounded-sm bg-cyan-600 px-2 py-2 font-black text-sm text-white uppercase hover:bg-cyan-700"
				>
					Sign up instead?
				</Link>
			</div>
		</>
	);
}
