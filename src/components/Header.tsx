import { authClient } from "@/lib/auth-client";
import { useLogoutMutation } from "@/lib/useLogout";
import { Link, useMatch, useRouter } from "@tanstack/react-router";

export default function Header() {
	const router = useRouter();
	const { data } = authClient.useSession();
	const { mutate } = useLogoutMutation(router);

	const matchLogin = useMatch({
		from: "/login",
		shouldThrow: false,
	});

	const matchSignup = useMatch({
		from: "/signup",
		shouldThrow: false,
	});

	const matchesLoginOrSignup =
		matchLogin?.status === "success" || matchSignup?.status === "success";

	return (
		<header className="p-2 flex gap-2 bg-white text-black justify-between">
			<nav className="flex flex-row">
				{!matchesLoginOrSignup && (
					<div className="flex gap-2 p-2 text-lg">
						<Link
							to="/"
							activeProps={{
								className: "font-bold",
							}}
							activeOptions={{ exact: true }}
						>
							Home
						</Link>{" "}
						<Link
							to="/category"
							activeProps={{
								className: "font-bold",
							}}
							disabled={!data?.user}
							className={!data?.user ? "pointer-events-none opacity-50" : ""}
						>
							Category
						</Link>{" "}
						<div className="ml-auto">
							{data?.user ? (
								<>
									<span className="mr-2">{data.user.email}</span>
									<button type="button" onClick={() => mutate()}>
										Logout
									</button>
								</>
							) : (
								<Link to="/login">Login</Link>
							)}
						</div>
					</div>
				)}
			</nav>
		</header>
	);
}
