import {
	type FetchSearchbox,
	categorySchema,
	searchBoxParamsSchema,
	searchboxQuerySchema,
	searchboxSchema,
} from "@/lib/category";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import * as turf from "@turf/turf";
import { type } from "arktype";

export const Route = createFileRoute("/_authed/category/$name")({
	loaderDeps: ({ search }) => search,
	loader: async ({
		params: { name: category },
		context,
		deps: { limit, proximity },
	}) => {
		const parsedCategory = categorySchema(category);

		if (parsedCategory instanceof type.errors) {
			console.error("parseError: ", parsedCategory.summary);
			throw new Error(parsedCategory.summary);
		}

		const data = await context.queryClient.ensureQueryData(
			searchboxQueryOptions({
				category: parsedCategory,
				limit,
				proximity,
			}),
		);

		return data;
	},
	head: ({ params: { name: category } }) => ({
		meta: [{ title: category }],
	}),
	component: RouteComponent,
	validateSearch: searchboxQuerySchema,
});

// TODO: Add any information that may be helpful,
// such as a link, hours, phone number, etc.

function RouteComponent() {
	const routeSearch = Route.useSearch();
	const params = Route.useParams();
	const searchboxQuery = useSuspenseQuery(searchboxQueryOptions(routeSearch));

	if (searchboxQuery.data === null) {
		return null;
	}

	if (searchboxQuery.data.features.length === 0) {
		return (
			<div className="grid grid-cols-1 gap-4 rounded-lg border border-blue-300 bg-blue-100 p-4 dark:border-blue-400 dark:bg-blue-600">
				<h2 className="font-bold text-blue-600 dark:text-blue-100">Warning</h2>
				<p className="text-blue-800 dark:text-blue-200">No results found.</p>
				<p className="text-blue-800 dark:text-blue-200">
					You searched for &quot;{params.name}&quot; maybe try something similar
					without special characters.
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4">
			{searchboxQuery.data.features.map((feature) => {
				if (!feature.properties) {
					// Shouldn't happen filtered above
					return null;
				}
				return (
					<div
						key={feature.properties.external_ids.dataplor}
						className="rounded-lg bg-gray-800 p-4 dark:bg-gray-900 dark:text-white"
					>
						<h2 className="font-bold text-lg">{feature.properties.name}</h2>
						<p>
							<a
								href={`https://www.google.com/maps/search/?api=1&query=${feature.properties.address}`}
								target="_blank"
								rel="noreferrer"
							>
								{feature.properties.address}
							</a>
						</p>
					</div>
				);
			})}
		</div>
	);
}

const fetchSearchbox = createServerFn({ method: "GET" })
	.inputValidator((data) => {
		// TODO: Logging
		// console.log({ data });

		const parsed = searchBoxParamsSchema(data);

		if (parsed instanceof type.errors) {
			console.log("Tried to collect: ", data);
			console.error("parseError: ", parsed.summary);
			throw new Error(parsed.summary);
		}

		return parsed;
	})
	.handler(async ({ data }) => {
		// TODO: Handle caching somehow (on server we could use some sort of store?)
		// if (env.NODE_ENV === 'development') {
		//   const devJson = await import('~/lib/coffee.json');
		//   const parsed = searchboxSchema(devJson);

		//   const { category, limit, proximity } = data;
		//   const underscoredCategory = category.replaceAll(' ', '_');

		//   console.log({
		//     category,
		//     underscoredCategory,
		//   });

		//   if (parsed instanceof type.errors) {
		//     throw new Error(parsed.summary);
		//   }

		//   return parsed;
		// }

		const { category, radius, limit, proximity } = data;
		const turfPoint = turf.point(proximity);
		const buffer = turf.buffer(turfPoint, radius, { units: "kilometers" });

		if (!buffer) {
			throw new Error("Failed to create bbox");
		}

		const bbox = turf.bbox(buffer);

		// TODO: Logging
		// console.log({ bbox });

		// The category needs to be an `_` separated string instead of spaces.
		const underscoredCategory = category.replaceAll(" ", "_");
		const fetchUrl = new URL(
			`https://api.mapbox.com/search/searchbox/v1/category/${underscoredCategory}`,
		);
		// TODO: add access token ENV?
		fetchUrl.searchParams.set(
			"access_token",
			"pk.eyJ1Ijoicy1wZXRleSIsImEiOiJjbTZtZWN6ZWcwamd4Mm1wYjI5MGVmYmJrIn0.PvkJ6F2ngc9_iTBBuRB4nw",
		);

		// TODO: This is currently a magic number (see form too)
		const fetchLimit = limit * 5 < 25 ? limit * 5 : 25;
		fetchUrl.searchParams.set("limit", fetchLimit.toString());
		fetchUrl.searchParams.set("proximity", proximity.join(","));
		fetchUrl.searchParams.set("bbox", bbox.join(","));

		console.info("Fetching: ", fetchUrl.toString());

		const responseData = await fetch(fetchUrl);

		if (responseData.status === 404) {
			throw notFound();
		}

		if (!responseData.ok) {
			const body = await responseData.text();
			console.error(body);
			throw new Error("Failed to find your search");
		}

		const json = await responseData.json();

		// TODO: Logging.
		// console.log({ json });

		const parsed = searchboxSchema(json);

		if (parsed instanceof type.errors) {
			throw new Error(parsed.summary);
		}

		// Get a random subset of the results
		// TODO: Testing
		const features = parsed.features;
		const randomSubsetFeatures = features
			.sort(() => Math.random() - 0.5)
			.slice(0, limit);

		return {
			...parsed,
			features: randomSubsetFeatures,
		};
	});

function searchboxQueryOptions(params: Partial<FetchSearchbox>) {
	return queryOptions({
		queryKey: [
			"search",
			"searchbox",
			{
				category: params.category,
				proximity: params.proximity,
				limit: params.limit,
				radius: params.radius,
			},
		],
		queryFn: () => {
			const parsed = searchBoxParamsSchema(params);

			// Enabled is not working so the workaround recommended
			// is to use return null.
			if (parsed instanceof type.errors) {
				console.error("parseError: ", parsed.summary);
				return null;
			}

			const { category, limit, radius, proximity } = parsed;

			return fetchSearchbox({
				data: {
					category,
					limit,
					proximity,
					radius,
				},
			});
		},
		staleTime: 1000 * 60 * 100,
	});
}
