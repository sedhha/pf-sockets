import { IWSResult } from '@/interfaces/webSocket';

type SupportedEvents = 'view';
interface IEventRequest<T> {
  payload: T;
  event: SupportedEvents;
}

type EventLogCallback = <T1, T2>(
  visitorID: string,
  payload: T1,
) => IWSResult<T2>;

interface ILogEvent<T> {
  payload: T;
  eventType: string;
  visitorID: string;
}

export { IEventRequest, EventLogCallback, ILogEvent };
