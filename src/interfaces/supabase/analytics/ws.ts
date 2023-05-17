import { IWSResult } from '@/interfaces/webSocket';

type SupportedEvents = 'view';
interface IEventRequest<T> {
  payload: T;
  event: SupportedEvents;
}

export type MetaProps = {
  csrfToken: string;
  ua: string;
};

type EventLogCallback = <T1, T2>(
  visitorID: string,
  payload: T1,
  metaProps?: MetaProps,
) => Promise<IWSResult<T2>>;

interface ILogEvent<T> {
  payload: T;
  eventType: string;
  visitorID: string;
}

export { IEventRequest, EventLogCallback, ILogEvent };
