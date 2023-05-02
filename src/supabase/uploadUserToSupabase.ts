import { z } from 'zod';
import Admin from '@/supabase/index';
import { tableNames } from './constants';
import { getAllDataFromCollection } from '@/firebase/getData';
import fs from 'fs';
const IVisitorSchemaS = z.object({
  country: z.string().optional(),
  country_population: z.number().optional(),
  fp_cityName: z.string().optional(),
  fp_continentCode: z.string().optional(),
  ua: z.string(),
  fp_latitude: z.number().optional(),
  fp_Visitor: z.boolean().optional(),
  country_calling_code: z.string().optional(),
  longitude: z.number().optional(),
  visitorID: z.string(),
  fp_continentName: z.string().optional(),
  ip: z.string().optional(),
  fp_OS: z.string().optional(),
  continent_code: z.string(),
  fp_timezone: z.string().optional(),
  fp_subDivision: z
    .array(
      z.object({
        isoCode: z.string(),
        name: z.string(),
      }),
    )
    .optional(),
  version: z.enum(['IPv4', 'IPv6']).optional(),
  country_code: z.string().optional(),
  csrfToken: z.string(),
  fp_firstSeenAt_subscription: z
    .object({
      _seconds: z.number(),
      _nanoseconds: z.number(),
    })
    .optional(),
  fp_browserName: z.string().optional(),
  postal: z.string().optional(),
  region: z.string().optional(),
  fp_countryCode: z.string().optional(),
  fp_longitude: z.number().optional(),
  fp_confidenceScore: z.number().optional(),
  fp_postCode: z.string().optional(),
  totalVisits: z.number().optional(),
  utc_offset: z.string().optional(),
  country_tld: z.string().optional(),
  city: z.string().optional(),
  timezone: z.string().optional(),
  latitude: z.number().optional(),
  fp_device: z.string().optional(),
  fp_incognito: z.boolean().optional(),
  network: z.string().optional(),
  country_area: z.number().optional(),
  country_code_iso3: z.string().optional(),
  fp_accuracyRadius: z.number().optional(),
  fp_browserVersion: z.string().optional(),
  country_name: z.string().optional(),
  currency: z.string().optional(),
  country_capital: z.string().optional(),
  fp_firstSeenAt_global: z
    .object({
      _seconds: z.number(),
      _nanoseconds: z.number(),
    })
    .optional(),
  currency_name: z.string().optional(),
  languages: z.string().optional(),
  org: z.string().optional(),
  fp_metaVersion: z.string().optional(),
  fp_ip: z.string().optional(),
  in_eu: z.boolean().optional().optional(),
  fp_visitorID: z.string().optional(),
  fp_OSVersion: z.string().optional(), // This field can be undefined, null or '11'
  fp_country: z.string().optional(),
  asn: z.string().optional(),
  region_code: z.string().optional(),
  user: z.string().optional().nullable(),
  techStackViewed: z.boolean().optional(),
  testimonialsViewed: z.boolean().optional(),
  projectsViewed: z.boolean().optional(),
  videosViewed: z.boolean().optional(),
  lastModified: z.object({
    _seconds: z.number(),
    _nanoseconds: z.number(),
  }),
});

type IVisitorSchema = z.infer<typeof IVisitorSchemaS>;

export const transferFromSupabaseToFirebase = async () => {
  const allData = (await getAllDataFromCollection('prod-geoAnalytics', true))
    .json as IVisitorSchema[];
  const startIndex = 40;
  const endIndex = 80;
  const sliced = allData.slice(startIndex, endIndex);
  fs.writeFileSync(
    `${process.cwd()}/src/temp/${startIndex}-${endIndex}.json`,
    JSON.stringify(sliced),
  );
  const allDataPromises = sliced.map(
    item =>
      new Promise(resolve =>
        uploadUserDetailsToSupabase(item).then(result => resolve(result)),
      ),
  );

  await Promise.all(allDataPromises);
  return {
    errored: false,
    json: null,
    status: 201,
  };
};
export const uploadUserDetailsToSupabase = async (data: IVisitorSchema) => {
  try {
    const parsed = IVisitorSchemaS.parse(data);
    const supabaseInfo = convertFirebaseToSupabase(parsed);
    return Admin.from(tableNames.USERS)
      .insert([supabaseInfo])
      .then(res => {
        return {
          errored: res.error != null,
          status: 201,
          json: res.error?.message ?? res.data,
        };
      });
  } catch (error) {
    return { errored: true, status: 500, json: JSON.stringify(data) };
  }
};

type FireStoreTime = {
  _seconds: number;
  _nanoseconds: number;
};
const _convertToTime = ({ _seconds, _nanoseconds }: FireStoreTime): string =>
  new Date(_seconds * 1000 + Math.floor(_nanoseconds / 1000000)).toISOString();
const convertFirebaseToSupabase = (info: IVisitorSchema) => ({
  visitorID: info.visitorID,
  user: info.user,
  uid: info.user,
  asn: info.asn,
  city: info.city,
  continent_code: info.continent_code,
  country: info.country,
  country_area: info.country_area,
  country_calling_code: info.country_calling_code,
  country_capital: info.country_capital,
  country_code: info.country_code,
  country_code_iso3: info.country_code_iso3,
  country_name: info.country_name,
  country_population: info.country_population,
  country_tld: info.country_tld,
  csrfToken: info.csrfToken,
  currency: info.currency,
  currency_name: info.currency_name,
  fp_OS: info.fp_OS,
  fp_OSVersion: info.fp_OSVersion,
  fp_Visitor: info.fp_Visitor,
  fp_accuracyRadius: info.fp_accuracyRadius,
  fp_browserName: info.fp_browserName,
  fp_browserVersion: info.fp_browserVersion,
  fp_cityName: info.fp_cityName,
  fp_confidenceScore: info.fp_confidenceScore,
  fp_continentCode: info.fp_continentCode,
  fp_continentName: info.fp_continentName,
  fp_country: info.fp_country,
  fp_countryCode: info.fp_countryCode,
  fp_device: info.fp_device,
  fp_firstSeenAt_global: info.fp_firstSeenAt_global
    ? _convertToTime(info.fp_firstSeenAt_global as FireStoreTime)
    : undefined,
  fp_firstSeenAt_subscription: info.fp_firstSeenAt_subscription
    ? _convertToTime(info.fp_firstSeenAt_subscription as FireStoreTime)
    : undefined,
  fp_incognito: info.fp_incognito,
  fp_ip: info.fp_ip,
  fp_latitude: info.fp_latitude,
  fp_longitude: info.fp_longitude,
  fp_metaVersion: info.fp_metaVersion,
  fp_postCode: info.fp_postCode,
  fp_subDivision: info.fp_subDivision,
  fp_timezone: info.fp_timezone,
  in_eu: info.in_eu,
  ip: info.ip,
  languages: info.languages,
  lastModified: _convertToTime(info.lastModified as FireStoreTime),
  latitude: info.latitude,
  longitude: info.longitude,
  network: info.network,
  org: info.org,
  postal: info.postal,
  region: info.region,
  region_code: info.region_code,
  timezone: info.timezone,
  totalVisits: info.totalVisits,
  ua: info.ua,
  utc_offset: info.utc_offset,
  version: info.version,
});
