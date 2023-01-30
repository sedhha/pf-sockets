import { Request } from 'express';
import session from '@/firebase/csrf';
import withGenericIntercept from '@/middlewares/withGenericIntercept';
import { IApiHandler } from '@/interfaces/rest';

const addSession: IApiHandler<string> = async (req: Request) => {
  const userAgent = req.headers['user-agent']?.toLowerCase() ?? '';
  if (req.method !== 'GET' || !req.headers['user-agent'] || !req.headers['user-agent'].length)
    return {
      errored: true,
      status: 422,
    };
  const sessionKey = session.addSession(userAgent);
  return {
    errored: false,
    status: 201,
    json: sessionKey,
  };
};

const getSession: IApiHandler<null> = async (req: Request) => {
  const userAgent = req.headers['user-agent']?.toLowerCase() ?? '';
  const sessionKey = (req.query.session as string) ?? '';
  const activeSession = session.getSession(sessionKey, userAgent);
  return {
    errored: !activeSession,
    status: activeSession ? 200 : 404,
  };
};

const handler = {
  addSession: withGenericIntercept(addSession),
  getSession: withGenericIntercept(getSession),
};

export default handler;
