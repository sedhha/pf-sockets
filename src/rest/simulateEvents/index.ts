import { Request } from 'express';
import { IApiHandler } from '@/interfaces/rest';
import { eventInterceptor } from '@/supabase/analytics';
import { IWSResult } from '@/interfaces/webSocket';
import withDevIntercept from '@/middlewares/withDevIntercept';

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

const handler = {
  eventInterceptor: withDevIntercept(eventInterceptorHandler),
};

export default handler;
