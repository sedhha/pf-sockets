import { supportedOperations } from '@/firebase/constants';
import { IWSResult } from '@/interfaces/webSocket';
import { ZodError, ZodSchema, z } from 'zod';
import { identifiers } from './utils';
import { EventLogCallback } from '@/interfaces/supabase/analytics/ws';
import { trackSession } from './trackSession';

const handleEventWithPayload = <T1, T2>(
  payload: T1,
  eventType: string,
  visitorID: string,
  operatorFunction: EventLogCallback,
  schema?: ZodSchema,
): Promise<IWSResult<T2>> | IWSResult<T2> => {
  if (!schema) return operatorFunction(visitorID, payload);
  try {
    const actual = schema.parse(payload);
    return operatorFunction(visitorID, actual);
  } catch (err) {
    console.log('Error = ', (err as ZodError).errors);
    return {
      message: `Invalid JSON payload for: ${eventType} | Payload: ${JSON.stringify(
        payload,
      )}`,
      status: 422,
      identifier: identifiers.EVENT_LOG_ERROR,
    };
  }
};

const eventInterceptor = async <T1, T2>(
  eventType: string,
  incomingPayload: T1,
  visitorID: string,
): Promise<IWSResult<T2>> => {
  const notFound = {
    status: 404,
    message: 'Unknown event type',
    identifier: identifiers.EVENT_LOG_ERROR,
  };
  if (typeof eventType !== 'string' || typeof visitorID !== 'string')
    return notFound;
  let schema: ZodSchema;
  let callback: EventLogCallback;
  switch (eventType) {
    case supportedOperations.recordGeoData: {
      schema = z.object({
        fp_visitorID: z.string().optional(),
        fp_browserName: z.string().optional(),
        fp_browserVersion: z.string().optional(),
        fp_confidenceScore: z.number().optional(),
        fp_device: z.string().optional(),
        fp_firstSeenAt_global: z.string().optional(),
        fp_firstSeenAt_subscription: z.string().optional(),
        fp_incognito: z.boolean().optional(),
        fp_ip: z.string().optional(),
        fp_accuracyRadius: z.number().optional(),
        fp_cityName: z.string().optional(),
        fp_continentName: z.string().optional(),
        fp_continentCode: z.string().optional(),
        fp_country: z.string().optional(),
        fp_countryCode: z.string().optional(),
        fp_latitude: z.number().optional(),
        fp_longitude: z.number().optional(),
        fp_postCode: z.string().optional(),
        fp_subDivision: z.array(z.unknown()).optional(),
        fp_timezone: z.string().optional(),
        fp_lastSeenAt_global: z.string().optional(),
        fp_lastSeenAt_subscription: z.string().optional(),
        fp_metaVersion: z.string().optional(),
        fp_OS: z.string().optional(),
        fp_OSVersion: z.number().optional(),
        fp_Visitor: z.boolean().optional(),

        ip: z.string().optional(),
        network: z.string().optional(),
        version: z.string().optional(),
        city: z.string().optional(),
        region: z.string().optional(),
        region_code: z.string().optional(),
        country: z.string().optional(),
        country_name: z.string().optional(),
        country_code: z.string().optional(),
        country_code_iso3: z.string().optional(),
        country_capital: z.string().optional(),
        country_tld: z.string().optional(),
        continent_code: z.string().optional(),
        in_eu: z.boolean().optional(),
        postal: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        timezone: z.string().optional(),
        utc_offset: z.string().optional(),
        country_calling_code: z.string().optional(),
        currency: z.string().optional(),
        currency_name: z.string().optional(),
        languages: z.string().optional(),
        country_area: z.number().optional(),
        country_population: z.number().optional(),
        asn: z.string().optional(),
        org: z.string().optional(),

        uid: z.string().optional(),
        email: z.string().optional(),
        visitorID: z.string().optional(),
      });
      callback = trackSession;
      break;
    }
    default:
      return notFound;
  }
  return handleEventWithPayload(
    incomingPayload,
    eventType,
    visitorID,
    callback,
    schema,
  );
};

export { eventInterceptor };
