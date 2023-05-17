import { IFEGeo } from '@/interfaces/analytics';
import Admin from '@/supabase/index';
import { tableNames, columns } from '@/supabase/constants';
import {
  EventLogCallback,
  MetaProps,
} from '@/interfaces/supabase/analytics/ws';
import { IWSResult } from '@/interfaces/webSocket';
import { identifiers } from './utils';
const trackSession: EventLogCallback = async (
  visitorID: string,
  data: IFEGeo,
  metaProps: MetaProps,
): Promise<IWSResult<null>> => {
  const { ua, csrfToken } = metaProps;
  const existingData =
    (
      await Admin.from(tableNames.USERS)
        .select(columns.users.totalVisits)
        .eq(columns.users.visitorID, visitorID ?? 'unknown')
    ).data ?? [];
  const currentTotalVisits =
    existingData.length === 0
      ? 1
      : (existingData[0] as unknown as { totalVisits: number }).totalVisits ??
        0 + 1;

  return Admin.from(tableNames.USERS)
    .upsert(
      {
        visitorID: visitorID ?? 'unknown',
        user: 'unknown',
        uid: data.uid,
        asn: data.asn,
        city: data.city,
        continent_code: data.continent_code,
        country: data.country,
        country_area: data.country_area,
        country_calling_code: data.country_calling_code,
        country_capital: data.country_capital,
        country_code: data.country_code,
        country_code_iso3: data.country_code_iso3,
        country_name: data.country_name,
        country_population: data.country_population,
        country_tld: data.country_tld,
        csrfToken: csrfToken,
        currency: data.currency,
        currency_name: data.currency_name,
        fp_OS: data.fp_OS,
        fp_OSVersion: data.fp_OSVersion,
        fp_Visitor: data.fp_Visitor,
        fp_accuracyRadius: data.fp_accuracyRadius,
        fp_browserName: data.fp_browserName,
        fp_browserVersion: data.fp_browserVersion,
        fp_cityName: data.fp_cityName,
        fp_confidenceScore: data.fp_confidenceScore,
        fp_continentCode: data.fp_continentCode,
        fp_continentName: data.fp_continentName,
        fp_country: data.fp_country,
        fp_countryCode: data.fp_countryCode,
        fp_device: data.fp_device,
        fp_firstSeenAt_global: data.fp_firstSeenAt_global,
        fp_firstSeenAt_subscription: data.fp_firstSeenAt_subscription,
        fp_incognito: data.fp_incognito,
        fp_ip: data.fp_ip,
        fp_latitude: data.fp_latitude,
        fp_longitude: data.fp_longitude,
        fp_metaVersion: data.fp_metaVersion,
        fp_postCode: data.fp_postCode,
        fp_subDivision: JSON.stringify(data.fp_subDivision),
        fp_timezone: data.fp_timezone,
        in_eu: data.in_eu,
        ip: data.ip,
        languages: data.languages,
        lastModified: new Date().toISOString(),
        latitude: data.latitude,
        longitude: data.longitude,
        network: data.network,
        org: data.org,
        postal: data.postal,
        region: data.region,
        region_code: data.region_code,
        timezone: data.timezone,
        totalVisits: currentTotalVisits,
        ua: ua,
        utc_offset: data.utc_offset,
        version: data.version,
      },
      {
        onConflict: columns.users.visitorID,
      },
    )
    .then(({ error }) =>
      error
        ? { status: 500, identifier: identifiers.USER_ADD_FAILURE }
        : { status: 201, identifier: identifiers.USER_ADD_SUCCESS },
    );
};

export { trackSession };
