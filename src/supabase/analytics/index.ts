import { supportedOperations } from '@/firebase/constants';
import { IWSResult } from '@/interfaces/webSocket';
import { ZodSchema, z } from 'zod';
import { identifiers } from './utils';
import { viewEvent } from './viewEvent';
import { EventLogCallback } from '@/interfaces/supabase/analytics/ws';

const handleEventWithPayload = <T1, T2>(
  payload: T1,
  schema: ZodSchema,
  eventType: string,
  visitorID: string,
  operatorFunction: EventLogCallback,
): IWSResult<T2> => {
  try {
    const actual = schema.parse(payload);
    return operatorFunction(visitorID, actual);
  } catch (err) {
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
  switch (eventType) {
    case supportedOperations.viewEvents: {
      const zodSchema = z.object({
        name: z.string(),
      });
      return handleEventWithPayload(
        incomingPayload,
        zodSchema,
        eventType,
        visitorID,
        viewEvent as EventLogCallback,
      );
    }
    default:
      return notFound;
  }
};

export { eventInterceptor };
