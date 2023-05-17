import { Request } from 'express';
import { IApiHandler } from '@/interfaces/rest';
import { eventInterceptor } from '@/supabase/analytics';
import { IWSResult } from '@/interfaces/webSocket';
import withDevIntercept from '@/middlewares/withDevIntercept';
import { store } from '@/firebase/index';
import { info } from '../../utils/dev-utils';
import { DocumentData } from 'firebase-admin/firestore';
import { IAnalyticsCollection } from '@/interfaces/analytics';

const eventInterceptorHandler: IApiHandler<IWSResult<unknown>> = async (
  req: Request,
) => {
  const { identifier, opType } = req.query;

  return eventInterceptor(
    opType as string,
    req.body,
    identifier as string,
  ).then(result => ({
    errored: result.status > 299,
    status: result.status,
    json: result,
  }));
};

const getAllCollectionData: IApiHandler<DocumentData[]> = async (
  req: Request,
) => {
  const { collectionName } = req.query;
  if (!collectionName || typeof collectionName !== 'string')
    return { errored: true, status: 404, message: 'Collection not found' };

  return store
    .collection(collectionName)
    .get()
    .then(data => {
      const json = data.docs.map(doc => doc.data()) as DocumentData[];
      return {
        errored: false,
        status: 200,
        json,
      };
    })
    .catch(err => {
      info(`Error occured: ${err.message}`);
      return {
        errored: false,
        status: 200,
        message: err.message,
      };
    });
};

const addUsersToSupabase: IApiHandler<unknown> = async (req: Request) => {
  const { collectionName } = req.query;
  if (!collectionName || typeof collectionName !== 'string')
    return { errored: true, status: 404, message: 'Collection not found' };

  return store
    .collection(collectionName)
    .get()
    .then(result => {
      const docs = result.docs.map(doc => doc.data()) as IAnalyticsCollection[];
      const supabasePayload = docs.map(data => ({
        visitorID: data.visitorID ?? 'unknown',
        user: 'unknown',
        uid: data.uid,
        asn: data.asn,
        city: data.city,
        continent_code: data.continent_code,
        country: data.country,
        country_area: data.country_area,
        country_calling_code: data.country_calling_code.replace('+', ''),
        country_capital: data.country_capital,
        country_code: data.country_code,
        country_code_iso3: data.country_code_iso3,
        country_name: data.country_name,
        country_population: data.country_population,
        country_tld: data.country_tld,
        csrfToken: data.csrfToken,
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
        totalVisits: data.totalVisits,
        ua: data.ua,
        utc_offset: data.utc_offset,
        version: data.version,
      }));
      return {
        errored: false,
        status: 200,
        json: supabasePayload,
      };
    })
    .catch(err => {
      info(`Error occured: ${err.message}`);
      return {
        errored: false,
        status: 200,
        message: err.message,
      };
    });
};

const handler = {
  eventInterceptor: withDevIntercept(eventInterceptorHandler),
  collectionFromFirebase: withDevIntercept(getAllCollectionData),
  migrateFromFirebase: withDevIntercept(addUsersToSupabase),
};

export default handler;
