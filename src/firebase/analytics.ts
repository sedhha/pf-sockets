/* eslint-disable @typescript-eslint/no-unused-vars */
// BE Only
import {
  IAnalyticsCollection,
  IViewedData,
  ISessionCollection,
  IEventsCollection,
  IFEGeo,
  IAnalyticsInit,
  FEventData,
  IEventData,
  IExpectedWSPayload,
  INavigationEvent,
} from '@/interfaces/analytics';
import { firestore } from 'firebase-admin';
import crypto from 'crypto';
import {
  getEventPath,
  getGeoPath,
  getSessionPath,
  isAnalyticsEnabled,
  supportedOperations,
} from '@/firebase/constants';
import { store } from '@/firebase/index';
import session from './csrf';
import { eventInterceptor } from '@/supabase/analytics';
import { IWSResult } from '@/interfaces/webSocket';

interface IPaths {
  geoCollectionPath: string;
  sessionCollectionPath: string;
  eventsCollectionPath: string;
}
export type IData = {
  generic: IAnalyticsCollection;
  session: ISessionCollection;
  events: IEventsCollection[];
  paths: IPaths;
};

const getGenericInit = (
  visitorID: string,
  csrfToken: string,
  ua: string,
): IAnalyticsCollection => ({
  user: 'Unknown',
  visitorID: visitorID,
  csrfToken: csrfToken ?? 'Unknown',
  ua: ua ?? 'Unknown',
  fp_visitorID: visitorID,
  ip: 'Initiated Session',
  network: 'Initiated Session',
  version: 'Initiated Session',
  city: 'Initiated Session',
  region: 'Initiated Session',
  region_code: 'Initiated Session',
  country: 'Initiated Session',
  country_name: 'Initiated Session',
  country_code: 'Initiated Session',
  country_code_iso3: 'Initiated Session',
  country_capital: 'Initiated Session',
  country_tld: 'Initiated Session',
  continent_code: 'Initiated Session',
  in_eu: false,
  postal: 'Initiated Session',
  latitude: -1,
  longitude: -1,
  timezone: 'Initiated Session',
  utc_offset: 'Initiated Session',
  country_calling_code: 'Initiated Session',
  currency: 'Initiated Session',
  currency_name: 'Initiated Session',
  languages: 'Initiated Session',
  country_area: -1,
  country_population: -1,
  asn: 'Initiated Session',
  org: 'Initiated Session',
  totalVisits: 1,
});

const getSessionInit = (
  identifier: string,
  csrfToken: string,
  ua: string,
): ISessionCollection => ({
  visitorID: identifier,
  csrfToken: csrfToken,
  fp_visitorID: identifier,
  ua: ua,
  lastHundredConnections: [],
  latestConnectedAt: firestore.Timestamp.now(),
  latestDisconnectedAt: firestore.Timestamp.now(),
  latestDuration: 0,
  latestDisconnectedForcefully: false,
  totalConnections: 0,
});
const initiateGeoEntry = async (path: string, data: IAnalyticsCollection) => {
  return (
    isAnalyticsEnabled &&
    (await store
      .doc(path)
      .get()
      .then(async snapshot => {
        const filteredData = Object.fromEntries(
          Object.entries(data).filter(([_, value]) => value != null),
        );
        if (snapshot.exists)
          await store.doc(path).update({
            ...filteredData,
            lastModified: firestore.Timestamp.now(),
          } as Record<string, any>);
        else {
          const filteredData = Object.fromEntries(
            Object.entries(data).filter(([_, value]) => value != null),
          );
          await store
            .doc(path)
            .set({ ...filteredData, lastModified: firestore.Timestamp.now() });
        }
      }))
  );
};

const updateGeoEntry = async (path: string, data: IViewedData) =>
  isAnalyticsEnabled &&
  (await store
    .doc(path)
    .get()
    .then(snapshot => {
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([key, value]) => value != null),
      );
      if (snapshot.exists)
        store.doc(path).update({
          ...filteredData,
          lastModified: firestore.Timestamp.now(),
        } as Record<string, any>);
    }));

const getInitEntry = async (
  path: string,
): Promise<boolean | IAnalyticsCollection> =>
  isAnalyticsEnabled &&
  (await store
    .doc(path)
    .get()
    .then(snapshot => {
      if (snapshot.exists) return snapshot.data() as IAnalyticsCollection;
      else return false;
    }));

const addEvents = async (eventData: IEventsCollection[], eventPath: string) => {
  if (!isAnalyticsEnabled) return;
  const eventPromises = eventData.map(
    event =>
      new Promise(async resolve => {
        const eventDoc = store.collection(`${eventPath}`).doc();
        await eventDoc.set(event).then(() => resolve(true));
      }),
  );
  await Promise.all(eventPromises);
};

const addSessionData = async (
  sessionPath: string,
  newSnapshot: ISessionCollection,
) => {
  if (!isAnalyticsEnabled) return;
  const doc = store.doc(sessionPath);
  await doc.get().then(async snapshot => {
    if (snapshot.exists) {
      const existingSnapshot = snapshot.data() as ISessionCollection;
      const filteredData = Object.fromEntries(
        Object.entries(newSnapshot).filter(([key, value]) => value != null),
      );
      const lastHundredConnections = existingSnapshot.lastHundredConnections
        .slice(0, 99)
        .concat({
          connectedAt: newSnapshot.latestConnectedAt.toMillis(),
          disconnectedAt: newSnapshot.latestDisconnectedAt.toMillis(),
          duration: newSnapshot.latestDuration,
          disconnectedForcefully: newSnapshot.latestDisconnectedForcefully,
        });
      await doc.update({
        ...filteredData,
        lastHundredConnections,
        totalConnections: existingSnapshot.totalConnections + 1,
      });
    } else {
      await doc.set(newSnapshot);
    }
  });
};

class Analytics {
  data: Record<string, IData>;

  constructor() {
    this.data = {};
  }

  async createEntity({
    fp_visitorID,
    visitorID,
    csrfToken,
    ua,
  }: IAnalyticsInit): Promise<string> {
    let identifier = '';
    if (!(fp_visitorID ?? visitorID)) identifier = crypto.randomUUID();
    else identifier = (visitorID ?? fp_visitorID) as string;
    if (this.data[identifier]) return identifier;
    const geoCollectionPath = getGeoPath(identifier);
    const sessionCollectionPath = getSessionPath(identifier);
    const eventsCollectionPath = getEventPath();
    const genericData = await getInitEntry(geoCollectionPath);
    if (!this.data[identifier])
      this.data[identifier] = {
        generic: genericData
          ? {
              ...(genericData as IAnalyticsCollection),
              totalVisits:
                ((genericData as IAnalyticsCollection).totalVisits ?? 1) + 1,
              csrfToken,
            }
          : getGenericInit(identifier, csrfToken, ua),
        session: getSessionInit(identifier, csrfToken, ua),
        events: [],
        paths: {
          geoCollectionPath,
          sessionCollectionPath,
          eventsCollectionPath,
        },
      };
    this.data[identifier].paths = {
      geoCollectionPath,
      sessionCollectionPath,
      eventsCollectionPath,
    };
    return identifier;
  }
  async upsertGeoData(identifier: string, data: IFEGeo) {
    if (!this.data[identifier]) return;
    this.data[identifier].generic = {
      ...this.data[identifier].generic,
      fp_visitorID: data.fp_visitorID,
      fp_browserName: data.fp_browserName,
      fp_browserVersion: data.fp_browserVersion,
      fp_confidenceScore: data.fp_confidenceScore,
      fp_device: data.fp_device,
      fp_firstSeenAt_global: data.fp_firstSeenAt_global
        ? firestore.Timestamp.fromDate(new Date(data.fp_firstSeenAt_global))
        : undefined,
      fp_firstSeenAt_subscription: data.fp_firstSeenAt_subscription
        ? firestore.Timestamp.fromDate(
            new Date(data.fp_firstSeenAt_subscription),
          )
        : undefined,
      fp_incognito: data.fp_incognito,
      fp_ip: data.fp_ip,
      fp_accuracyRadius: data.fp_accuracyRadius,
      fp_cityName: data.fp_cityName,
      fp_continentName: data.fp_continentName,
      fp_continentCode: data.fp_continentCode,
      fp_country: data.fp_country,
      fp_countryCode: data.fp_countryCode,
      fp_latitude: data.fp_latitude,
      fp_longitude: data.fp_longitude,
      fp_postCode: data.fp_postCode,
      fp_subDivision: data.fp_subDivision,
      fp_timezone: data.fp_timezone,
      fp_lastSeenAt_global: data.fp_lastSeenAt_global
        ? firestore.Timestamp.fromDate(new Date(data.fp_lastSeenAt_global))
        : undefined,
      fp_lastSeenAt_subscription: data.fp_lastSeenAt_subscription
        ? firestore.Timestamp.fromDate(
            new Date(data.fp_lastSeenAt_subscription),
          )
        : undefined,
      fp_metaVersion: data.fp_metaVersion,
      fp_OS: data.fp_OS,
      fp_OSVersion: data.fp_OSVersion,
      fp_Visitor: data.fp_Visitor,

      ip: data.ip,
      network: data.network,
      version: data.version,
      city: data.city,
      region: data.region,
      region_code: data.region_code,
      country: data.country,
      country_name: data.country_name,
      country_code: data.country_code,
      country_code_iso3: data.country_code_iso3,
      country_capital: data.country_capital,
      country_tld: data.country_tld,
      continent_code: data.continent_code,
      in_eu: data.in_eu,
      postal: data.postal,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      utc_offset: data.utc_offset,
      country_calling_code: data.country_calling_code,
      currency: data.currency,
      currency_name: data.currency_name,
      languages: data.languages,
      country_area: data.country_area,
      country_population: data.country_population,
      asn: data.asn,
      org: data.org,

      uid: data.uid,
      email: data.email,
    };
    await initiateGeoEntry(
      this.data[identifier].paths.geoCollectionPath,
      this.data[identifier].generic,
    );
  }
  upsertEventData(identifier: string, data: IEventData[]): IData | void {
    if (!this.data[identifier]) return;
    const { visitorID, csrfToken, fp_visitorID, ua } =
      this.data[identifier].generic;
    this.data[identifier].events = data.map(event => ({
      ...event,
      visitorID,
      csrfToken,
      fp_visitorID,
      ua,
    }));
    return this.data[identifier];
  }

  getSessionData(identifier: string): FEventData | void {
    if (!this.data[identifier]) return;
    const data: FEventData = {
      key: identifier,
      eventData: this.data[identifier].events,
      workViewed: this.data[identifier].generic.workViewed,
      awardsViewed: this.data[identifier].generic.awardsViewed,
      blogViewed: this.data[identifier].generic.blogViewed,
      contactViewed: this.data[identifier].generic.contactViewed,
      projectsViewed: this.data[identifier].generic.projectsViewed,
      videosViewed: this.data[identifier].generic.videosViewed,
      testimonialsViewed: this.data[identifier].generic.testimonialsViewed,
      techStackViewed: this.data[identifier].generic.techStackViewed,
      email: this.data[identifier].generic.email,
      uid: this.data[identifier].generic.uid,
    };
    return data;
  }

  async closeSessionAbruptly(data: FEventData): Promise<void> {
    const identifier = data.key;
    if (!this.data[identifier]) return;
    this.data[identifier].session.latestDisconnectedAt =
      firestore.Timestamp.now();
    this.data[identifier].session.latestDuration =
      (this.data[identifier].session.latestDisconnectedAt.toMillis() -
        this.data[identifier].session.latestConnectedAt.toMillis()) /
      1000;
    this.data[identifier].session.latestDisconnectedForcefully = true;

    // View Details
    this.data[identifier].generic.workViewed = data.workViewed;
    this.data[identifier].generic.awardsViewed = data.awardsViewed;
    this.data[identifier].generic.blogViewed = data.blogViewed;
    this.data[identifier].generic.contactViewed = data.contactViewed;
    this.data[identifier].generic.projectsViewed = data.projectsViewed;
    this.data[identifier].generic.videosViewed = data.videosViewed;
    this.data[identifier].generic.testimonialsViewed = data.testimonialsViewed;
    this.data[identifier].generic.techStackViewed = data.techStackViewed;
    if (data.email) this.data[identifier].generic.email = data.email;
    if (data.uid) this.data[identifier].generic.uid = data.uid;

    await Promise.all([
      updateGeoEntry(this.data[identifier].paths.geoCollectionPath, {
        workViewed: this.data[identifier].generic.workViewed ?? false,
        awardsViewed: this.data[identifier].generic.awardsViewed ?? false,
        blogViewed: this.data[identifier].generic.blogViewed ?? false,
        contactViewed: this.data[identifier].generic.contactViewed ?? false,
        projectsViewed: this.data[identifier].generic.projectsViewed ?? false,
        videosViewed: this.data[identifier].generic.videosViewed ?? false,
        testimonialsViewed:
          this.data[identifier].generic.testimonialsViewed ?? false,
        techStackViewed: this.data[identifier].generic.techStackViewed ?? false,
      }),
      addEvents(
        data.eventData.map(item => ({
          ...item,
          visitorID: this.data[identifier].generic.visitorID,
          csrfToken: this.data[identifier].generic.csrfToken,
          ua: this.data[identifier].generic.ua,
          fp_visitorID: this.data[identifier].generic.fp_visitorID,
        })),
        this.data[identifier].paths.eventsCollectionPath,
      ),
      addSessionData(
        this.data[identifier].paths.sessionCollectionPath,
        this.data[identifier].session,
      ),
    ]);
    if (this.data[identifier]?.generic?.csrfToken)
      session.removeSession(this.data[identifier].generic.csrfToken);
    delete this.data[identifier];
  }
  async closeSession(data: FEventData): Promise<void> {
    const identifier = data.key;
    if (!this.data[identifier]) return;
    this.data[identifier].session.latestDisconnectedAt =
      firestore.Timestamp.now();
    this.data[identifier].session.latestDuration =
      (this.data[identifier].session.latestDisconnectedAt.toMillis() -
        this.data[identifier].session.latestConnectedAt.toMillis()) /
      1000;

    // View Details
    this.data[identifier].generic.workViewed = data.workViewed;
    this.data[identifier].generic.awardsViewed = data.awardsViewed;
    this.data[identifier].generic.blogViewed = data.blogViewed;
    this.data[identifier].generic.contactViewed = data.contactViewed;
    this.data[identifier].generic.projectsViewed = data.projectsViewed;
    this.data[identifier].generic.videosViewed = data.videosViewed;
    this.data[identifier].generic.testimonialsViewed = data.testimonialsViewed;
    this.data[identifier].generic.techStackViewed = data.techStackViewed;
    if (data.email) this.data[identifier].generic.email = data.email;
    if (data.uid) this.data[identifier].generic.uid = data.uid;

    await Promise.all([
      updateGeoEntry(this.data[identifier].paths.geoCollectionPath, {
        workViewed: this.data[identifier].generic.workViewed ?? false,
        awardsViewed: this.data[identifier].generic.awardsViewed ?? false,
        blogViewed: this.data[identifier].generic.blogViewed ?? false,
        contactViewed: this.data[identifier].generic.contactViewed ?? false,
        projectsViewed: this.data[identifier].generic.projectsViewed ?? false,
        videosViewed: this.data[identifier].generic.videosViewed ?? false,
        testimonialsViewed:
          this.data[identifier].generic.testimonialsViewed ?? false,
        techStackViewed: this.data[identifier].generic.techStackViewed ?? false,
      }),
      addEvents(
        data.eventData.map(item => ({
          ...item,
          visitorID: this.data[identifier].generic.visitorID,
          csrfToken: this.data[identifier].generic.csrfToken,
          ua: this.data[identifier].generic.ua,
          fp_visitorID: this.data[identifier].generic.fp_visitorID,
        })),
        this.data[identifier].paths.eventsCollectionPath,
      ),
      addSessionData(
        this.data[identifier].paths.sessionCollectionPath,
        this.data[identifier].session,
      ),
    ]);

    delete this.data[identifier];
  }
}

const analytics = new Analytics();

const operationHandler = async <T extends IExpectedWSPayload, T2>(
  opType: string,
  csrfToken: string,
  ua: string,
  opProps?: T,
): Promise<{ error: boolean; data?: string | IData | IWSResult<T2> }> => {
  switch (opType) {
    case supportedOperations.start: {
      if (!opProps) return { error: true };
      const reqd: IAnalyticsInit = {
        csrfToken,
        ua,
        visitorID: (opProps as IFEGeo).visitorID,
        fp_visitorID: (opProps as IFEGeo).fp_visitorID,
      };
      return analytics.createEntity(reqd).then(async res => {
        session.updateSession(csrfToken, { ua, identifier: res });
        if (!opProps) return { error: true };
        await analytics.upsertGeoData(res, opProps as IFEGeo);
        return { error: false, data: res };
      });
    }
    case supportedOperations.close: {
      if (!opProps) return { error: true };
      await analytics.closeSession(opProps as FEventData);
      return {
        error: false,
      };
    }
    case supportedOperations.forceClose: {
      const activeSession = session.getSession(csrfToken);
      if (!activeSession?.identifier) return { error: true };
      const data = analytics.getSessionData(activeSession.identifier);
      if (!data) return { error: true };
      await analytics.closeSessionAbruptly(data as FEventData);
      return {
        error: false,
      };
    }
    case supportedOperations.viewEvents: {
      const activeSession = session.getSession(csrfToken);
      if (!activeSession?.identifier || !opProps) return { error: true };

      const result = (await eventInterceptor(
        activeSession.identifier,
        opProps,
        opType,
      )) as IWSResult<T2>;
      return {
        error: result.status > 299,
        data: result,
      };
    }
    default:
      return { error: true };
  }
};
export default operationHandler;

// Helper Functions

// Initialize Analytics Collection
