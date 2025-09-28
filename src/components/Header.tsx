import { authClient } from "@/lib/auth-client";
import { useLogoutMutation } from "@/lib/useLogout";
import { Link, useMatch, useRouter } from "@tanstack/react-router";
import { useTheme } from "@/integrations/tanstack-query/root-provider";

export default function Header() {
	const router = useRouter();
	const { data } = authClient.useSession();
	const { mutate } = useLogoutMutation(router);
	const { theme, toggleTheme } = useTheme();

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
		<header className="p-2 flex gap-2 bg-white dark:bg-gray-900 text-black dark:text-white justify-between border-b border-gray-200 dark:border-gray-800">
			<nav className="flex flex-row w-full items-center">
				{!matchesLoginOrSignup && (
					<div className="flex gap-2 p-2 text-lg flex-1">
						<Link
							to="/"
							activeProps={{
								className:
									"font-bold text-cyan-600 dark:text-cyan-400 underline underline-offset-4",
							}}
							className="hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
							activeOptions={{ exact: true }}
						>
							Home
						</Link>{" "}
						<Link
							to="/category"
							activeProps={{
								className:
									"font-bold text-cyan-600 dark:text-cyan-400 underline underline-offset-4",
							}}
							disabled={!data?.user}
							className={
								!data?.user
									? "pointer-events-none opacity-50"
									: "hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
							}
						>
							Category
						</Link>{" "}
						<div className="ml-auto">
							{data?.user ? (
								<>
									<span className="mr-2">{data.user.email}</span>
									<button
										type="button"
										onClick={() => mutate()}
										className="rounded-sm bg-cyan-600 px-2 py-1 font-black text-sm text-white uppercase hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800 transition-colors"
									>
										Logout
									</button>
								</>
							) : (
								<Link
									to="/login"
									className="rounded-sm bg-cyan-600 px-2 py-1 font-black text-sm text-white uppercase hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-800 transition-colors"
								>
									Login
								</Link>
							)}
						</div>
					</div>
				)}
				<button
					onClick={toggleTheme}
					className="ml-4 flex items-center justify-center rounded-full p-2 transition-colors bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
					aria-label="Toggle dark mode"
					type="button"
				>
					{theme === "dark" ? (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5 text-yellow-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<title>Light Mode</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z"
							/>
						</svg>
					) : (
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5 text-gray-700 dark:text-gray-200"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<title>Dark Mode</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
							/>
						</svg>
					)}
				</button>
			</nav>
		</header>
	);
}
