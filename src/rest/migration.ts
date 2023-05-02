import { getAllDataFromCollection } from '@/firebase/getData';
import { IApiHandler, IResponse } from '@/interfaces/rest';
import withDevIntercept from '@/middlewares/withDevIntercept';
import { handleNavigationEvent } from '@/supabase/updateAnalytics';
import { transferFromSupabaseToFirebase } from '@/supabase/uploadUserToSupabase';
import { info } from '@/utils/dev-utils';
import { Request } from 'express';

const getDocs: IApiHandler<unknown> = async (req: Request) => {
  const { dbName, getFromCollection } = req.query;
  if (!dbName || typeof dbName !== 'string')
    return {
      errored: true,
      status: 404,
      json: 'DB Name not found',
    };
  return getAllDataFromCollection(dbName, getFromCollection != null)
    .then(res => {
      return res;
    })
    .catch(err => {
      info('Error occured = ', err.message);
      return { errored: true, json: err.message } as IResponse<unknown>;
    });
};

const uploadToSB: IApiHandler<unknown> = async () => {
  return transferFromSupabaseToFirebase()
    .then(res => res as IResponse<unknown>)
    .catch(err => {
      info('Error occured = ', err.message);
      return { errored: true, json: err.message } as IResponse<unknown>;
    });
};

const upsertASampleEvent: IApiHandler<unknown> = async () => {
  return handleNavigationEvent({
    viewedSections: { About: true },
    visitorID: 'ajkK8iXHlm5Vt3iNjTkE',
  }).then(res => {
    return {
      errored: res.error,
      json: null,
      status: res.error ? 500 : 201,
    };
  });
};
const handler = {
  // Fully Dev Routes
  getGeoDocs: withDevIntercept(getDocs),
  uploadDocument: withDevIntercept(uploadToSB),
  upsertASampleEvent: withDevIntercept(upsertASampleEvent),
};

export default handler;
