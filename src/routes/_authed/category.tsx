import { categorySchema, searchboxQuerySchema } from "@/lib/category";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { type } from "arktype";
import { useState } from "react";

export const Route = createFileRoute("/_authed/category")({
	component: RouteComponent,
});

type FormErrors = Partial<{
	category: string;
	limit: string;
	proximity: string;
	radius: string;
}>;

function RouteComponent() {
	const navigate = useNavigate({ from: Route.fullPath });
	const [errors, setErrors] = useState<FormErrors>({});

	// TODO: Hoist the form state into the URL bar, so it can persist on submit?
	const [formState, setFormState] = useState<{
		category: string;
		limit: number;
		longitude: number | null;
		latitude: number | null;
		radius: number;
	}>({
		category: "",
		limit: 1,
		longitude: null,
		latitude: null,
		radius: 3,
	});

	function requestGeoLocation() {
		navigator.geolocation.getCurrentPosition(geoSuccess, geoError, {
			enableHighAccuracy: true,
			maximumAge: 0,
		});
	}

	const geoSuccess: PositionCallback = (position) => {
		const { latitude, longitude } = position.coords;

		setFormState((prev) => ({
			...prev,
			latitude,
			longitude,
		}));
	};

	const geoError: PositionErrorCallback = (error) => {
		console.error(error);
		// TODO....
		setErrors({
			proximity: error.message,
		});
	};

	return (
		<div className="grid grid-cols-1 gap-4 p-2">
			<form
				className="grid grid-cols-1 gap-4"
				onSubmit={(event) => {
					event.preventDefault();
					const {
						category: rawCategory,
						limit,
						longitude,
						latitude,
						radius,
					} = formState;

					const category = categorySchema(rawCategory);

					if (category instanceof type.errors) {
						setErrors({
							category: category.summary,
						});
						return;
					}

					if (
						typeof longitude !== "number" ||
						typeof latitude !== "number" ||
						Number.isNaN(longitude) ||
						Number.isNaN(latitude)
					) {
						setErrors({
							proximity: "Proximity is required",
						});
						return;
					}

					if (!radius) {
						setErrors({
							radius: "Radius is required",
						});
						return;
					}

					const result = searchboxQuerySchema.pick("limit")({
						limit: Number(limit),
					});

					if (result instanceof type.errors) {
						setErrors({
							limit: result.summary,
						});
						return;
					}

					setErrors({});

					const proximity: [number, number] = [longitude, latitude];

					navigate({
						to: "/category/$name",
						params: { name: category },
						search: () => ({
							category,
							proximity,
							limit: result.limit,
							radius,
						}),
					});
				}}
			>
				<label className="block" htmlFor="category">
					Category
					<input
						className="block appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-slate-500 leading-normal shadow-sm transition duration-150 ease-in-out focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:col-span-2 sm:mt-0"
						type="text"
						name="category"
						id="category"
						placeholder="café"
						required={true}
						value={formState.category}
						onChange={(event) =>
							setFormState((prev) => ({
								...prev,
								category: event.target.value,
							}))
						}
					/>
					{(errors.category ?? "").length > 0 && (
						<p className="mt-2 text-red-600 text-sm">{errors.category}</p>
					)}
				</label>

				<div className="flex gap-4">
					<label htmlFor="longitude">
						Longitude
						<input
							className="block appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-slate-500 leading-normal shadow-sm transition duration-150 ease-in-out focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
							type="number"
							name="longitude"
							id="longitude"
							required={true}
							value={formState.longitude ?? ""}
							onChange={(event) => {
								const longitude = Number(event.target.value);

								if (Number.isNaN(longitude)) {
									setErrors({
										proximity: "Invalid longitude",
									});
									return;
								}

								setErrors({
									proximity: undefined,
								});

								setFormState((prev) => ({
									...prev,
									longitude,
								}));
							}}
						/>
					</label>
					<label htmlFor="latitude">
						Latitude
						<input
							className="block appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-slate-500 leading-normal shadow-sm transition duration-150 ease-in-out focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
							type="number"
							name="latitude"
							id="latitude"
							required={true}
							value={formState.latitude ?? ""}
							onChange={(event) => {
								const latitude = Number(event.target.value);

								if (Number.isNaN(latitude)) {
									setErrors({
										proximity: "Invalid latitude",
									});
									return;
								}

								setErrors({
									proximity: undefined,
								});

								setFormState((prev) => ({
									...prev,
									latitude,
								}));
							}}
						/>
					</label>
				</div>

				<div>
					<button
						className="rounded-md border border-transparent bg-green-600 px-4 py-2 text-white transition duration-150 ease-in-out hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
						type="button"
						onClick={requestGeoLocation}
					>
						Use current location
					</button>
					{(errors.proximity ?? "").length > 0 && (
						<p className="mt-2 text-red-600 text-sm">
							Error: {errors.proximity}
						</p>
					)}
				</div>

				<label className="block" htmlFor="limit">
					Limit
					<div className="flex items-center">
						<button
							className={`rounded-l-md border border-gray-300 bg-gray-200 px-4 py-2 font-bold text-gray-500 duration-150 hover:bg-gray-300 ${
								formState.limit < 2 && "pointer-events-none opacity-50"
							}`}
							disabled={formState.limit < 2}
							type="button"
							onClick={() => {
								if (formState.limit >= 2) {
									setFormState((prev) => ({
										...prev,
										limit: prev.limit - 1,
									}));
								}
							}}
						>
							&#8722;
						</button>
						<input
							className="appearance-none rounded-none border border-gray-300 bg-white px-3 py-2 text-base text-slate-500 leading-normal shadow-sm transition duration-150 ease-in-out focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
							type="number"
							name="limit"
							id="limit"
							value={formState.limit}
							min={1}
							max={5}
							onChange={(e) =>
								setFormState((prev) => ({
									...prev,
									limit: Number.parseInt(e.target.value, 10),
								}))
							}
						/>
						<button
							className={`rounded-r-md border border-gray-300 bg-gray-200 px-4 py-2 font-bold text-gray-500 hover:bg-gray-300 ${
								formState.limit >= 5 && "pointer-events-none opacity-50"
							}`}
							disabled={formState.limit >= 5}
							type="button"
							onClick={() => {
								if (formState.limit < 5) {
									setFormState((prev) => ({
										...prev,
										limit: prev.limit + 1,
									}));
								}
							}}
						>
							&#43;
						</button>
					</div>
					{(errors.limit ?? "").length > 0 && (
						<p className="mt-2 text-red-600 text-sm">{errors.limit}</p>
					)}
				</label>

				<label className="block" htmlFor="radius">
					Radius (km)
					<input
						className="block appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-slate-500 leading-normal shadow-sm transition duration-150 ease-in-out focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
						type="number"
						name="radius"
						id="radius"
						value={formState.radius}
						onChange={(e) =>
							setFormState((prev) => ({
								...prev,
								radius: Number.parseFloat(e.target.value),
							}))
						}
						step="1"
						min="1"
						max="25"
						required={true}
					/>
					{(errors.radius ?? "").length > 0 && (
						<p className="mt-2 text-red-600 text-sm">{errors.radius}</p>
					)}
				</label>

				<div className="flex gap-2">
					<button
						className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-white transition duration-150 ease-in-out hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						type="submit"
					>
						Search
					</button>
					<button
						className="rounded-md border border-transparent bg-gray-600 px-4 py-2 text-white transition duration-150 ease-in-out hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
						type="button"
						onClick={() => {
							setFormState((prev) => ({
								...prev,
								longLat: null,
							}));
							navigate({
								to: "/category",
							});
						}}
					>
						Reset
					</button>
				</div>
			</form>

			<Outlet />
		</div>
	);
}
