import { IWSResult } from '@/interfaces/webSocket';
import { identifiers } from './utils';
const viewEvent = (
  visitorID: string,
  payload: { name: string },
): IWSResult<null> => ({
  message: 'Successfully added view :' + payload.name,
  status: 200,
  identifier: identifiers.EVENT_LOG_SUCCESS,
});

export { viewEvent };
