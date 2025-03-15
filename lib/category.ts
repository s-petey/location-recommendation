import { type } from 'arktype';

const categorySchema = type('string.trim').pipe(type('string >= 1'));

const searchBoxParamsSchema = type({
  category: categorySchema,
  limit: 'number',
  proximity: type(['number', 'number']).describe('[longitude, latitude]'),
  radius: 'number = 3',
});

const searchboxQuerySchema = type({
  limit: 'number = 2',
  proximity: type(['number', 'number']).describe('[longitude, latitude]'),
});

const featureSchema = type({
  type: '"Feature"',
  geometry: type({
    type: '"Point"',
    coordinates: ['number', 'number'],
  }),
  properties: type({
    name: 'string',
    mapbox_id: 'string',
    feature_type: '"poi"',
    address: 'string',
    full_address: 'string',
    place_formatted: 'string',
    context: type({
      country: type({
        name: 'string',
        country_code: 'string',
        country_code_alpha_3: 'string',
      }),
      region: type({
        name: 'string',
        region_code: 'string',
        region_code_full: 'string',
      }).optional(),
      postcode: type({
        id: 'string',
        name: 'string',
      }),
      place: type({
        id: 'string',
        name: 'string',
      }),
      address: type({
        name: 'string',
        address_number: 'string',
        street_name: 'string',
      }).optional(),
      street: type({
        name: 'string',
      }).optional(),
    }).optional(),
    coordinates: type({
      latitude: 'number',
      longitude: 'number',
      routable_points: type({
        name: '"POI"',
        latitude: 'number',
        longitude: 'number',
      }).array(),
    }),
    language: 'string',
    maki: 'string',
    poi_category: type('string').array(),

    poi_category_ids: type('string').array(),
    'brand?': type('string').array(),
    'brand_id?': type('string').array(),
    external_ids: type({
      'golden?': 'string',
      dataplor: 'string',
    }),
    metadata: type({
      'phone?': 'string',
      open_hours: type({
        periods: type({
          open: type({
            day: 'number',
            time: 'string',
          }),
          close: type({
            day: 'number',
            time: 'string',
          }),
        })
          .array()
          .optional(),
      }).optional(),
    }),
  }),
});

const searchboxSchema = type({
  type: '"FeatureCollection"',
  features: featureSchema.array(),
  attribution: 'string',
  response_id: 'string',
});

type FetchSearchbox = typeof searchBoxParamsSchema.infer;

export {
  categorySchema,
  searchBoxParamsSchema,
  searchboxQuerySchema,
  searchboxSchema,
};

export type { FetchSearchbox };
