import Admin from '@/supabase/index';
import { z } from 'zod';
import { schemas, tableNames, columns } from '@/supabase/constants';
import { info } from '@/utils/dev-utils';
const INavigationEvent = z.object({
  viewedSections: z.record(z.boolean()),
  visitorID: z.string().optional(),
});
type INavigationEvent = z.infer<typeof INavigationEvent>;
const INavigationEntry = schemas[tableNames.NAVIGATION];
type INavigationEntry = z.infer<typeof INavigationEntry>;

export const handleNavigationEvent = async (
  event: INavigationEvent,
): Promise<{ error: boolean }> => {
  try {
    const payload = INavigationEvent.parse(event);
    const { viewedSections, visitorID } = payload;
    let viewPayload: INavigationEntry[] = [];
    if (!visitorID) {
      viewPayload = createViewPayload('unknown', viewedSections);
    }
    // query to Supabase
    return Admin.from(tableNames.USERS)
      .select(
        [
          columns[tableNames.USERS].visitorID,
          columns[tableNames.USERS].user,
          columns[tableNames.USERS].uid,
        ].join(','),
      )
      .eq(columns[tableNames.USERS].visitorID, visitorID)
      .then(({ error, data }) => {
        if (error) {
          info('Here with error', error);
          return { error: true };
        }
        viewPayload = createViewPayload(
          visitorID,
          viewedSections,
          (data as any).uid,
          (data as any).user,
        );
        return Admin.from(tableNames.NAVIGATION)
          .upsert(viewPayload, {
            onConflict: [
              columns[tableNames.NAVIGATION].visitorID,
              columns[tableNames.NAVIGATION].viewName,
            ].join(','),
          })
          .then(({ error }) => {
            if (error) {
              info(error.message);
              return { error: true };
            }
            return { error: false };
          });
      });
  } catch (err) {
    info(err.message);
    return { error: true };
  }
};

const createViewPayload = (
  visitorID: string,
  sections: Record<string, boolean>,
  uid?: string,
  user?: string,
): INavigationEntry[] => {
  const viewedSections = Object.keys(sections).filter(
    section => sections[section],
  );
  return viewedSections.map(
    item =>
      ({
        [columns[tableNames.NAVIGATION].user]: user,
        [columns[tableNames.NAVIGATION].visitorID]: visitorID,
        [columns[tableNames.NAVIGATION].uid]: uid,
        [columns[tableNames.NAVIGATION].viewName]: item,
        [columns[tableNames.NAVIGATION].viewedAt]: new Date().toISOString(),
      } as INavigationEntry),
  );
};
