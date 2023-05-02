import { AttributeValue, ClickActionAttributes } from '@/firebase/constants';
import { Timestamp } from 'firebase-admin/firestore';
interface IGeoAPI {
  ip: string;
  network: string;
  version: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_name: string;
  country_code: string;
  country_code_iso3: string;
  country_capital: string;
  country_tld: string;
  continent_code: string;
  in_eu: boolean;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  country_calling_code: string;
  currency: string;
  currency_name: string;
  languages: string;
  country_area: number;
  country_population: number;
  asn: string;
  org: string;
}

interface IGeoAPINew {
  ip?: string;
  network?: string;
  version?: string;
  city?: string;
  region?: string;
  region_code?: string;
  country?: string;
  country_name?: string;
  country_code?: string;
  country_code_iso3?: string;
  country_capital?: string;
  country_tld?: string;
  continent_code?: string;
  in_eu?: boolean;
  postal?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  utc_offset?: string;
  country_calling_code?: string;
  currency?: string;
  currency_name?: string;
  languages?: string;
  country_area?: number;
  country_population?: number;
  asn?: string;
  org?: string;
}

interface ISessionData {
  connectedAt: number; // timestamp
  disconnectedAt: number; // timestamp
  duration: number;
  disconnectedForcefully: boolean;
}

interface IEventData {
  actionID: string;
  eventCount: number;
  eventTriggeredTimes: number[];
}

interface IUserData {
  uid?: string;
  email?: string;
}

type IAnalyticsData = {
  docPath: string;
  sessionID: string;
  ua: string;
  events: IEventData[]; // To be stored in a seperate collection

  // Viewed Sections
  workViewed: boolean;
  blogViewed: boolean;
  contactViewed: boolean;
  projectsViewed: boolean;
  awardsViewed: boolean;
  videosViewed: boolean;
  testimonialsViewed: boolean;
  techStackViewed: boolean;
} & IGeoAPI &
  ISessionData &
  IUserData;

type IFEData = { events: IEventData[] } & IGeoAPI;

interface ITransformData {
  data: IFEData;
  docPath: string;
  csrf: string;
  ua: string;
  sessionData: ISessionData;
}

interface IFingerPrint {
  fp_browserName?: string;
  fp_browserVersion?: string;
  fp_confidenceScore?: number;
  fp_device?: string;
  fp_firstSeenAt_global?: Timestamp;
  fp_firstSeenAt_subscription?: Timestamp;
  fp_incognito?: boolean;
  fp_ip?: string;
  fp_accuracyRadius?: number;
  fp_cityName?: string;
  fp_continentName?: string;
  fp_continentCode?: string;
  fp_country?: string;
  fp_countryCode?: string;
  fp_latitude?: number;
  fp_longitude?: number;
  fp_postCode?: string;
  fp_subDivision?: unknown[];
  fp_timezone?: string;
  fp_lastSeenAt_global?: Timestamp;
  fp_lastSeenAt_subscription?: Timestamp;
  fp_metaVersion?: string;
  fp_OS?: string;
  fp_OSVersion?: string;
  fp_Visitor?: boolean;
}

interface Identification {
  // must have data
  visitorID: string; // Secondary Key
  csrfToken: string; // Primary Key
  ua: string; // Secondary Key
  fp_visitorID?: string; // Secondary Key
}

export interface IViewedData {
  workViewed: boolean;
  blogViewed: boolean;
  contactViewed: boolean;
  projectsViewed: boolean;
  awardsViewed: boolean;
  videosViewed: boolean;
  testimonialsViewed: boolean;
  techStackViewed: boolean;
}

type IAnalyticsCollection = {
  // Manual User Identifier
  user: string;
  // Visibility
  workViewed?: boolean;
  blogViewed?: boolean;
  contactViewed?: boolean;
  projectsViewed?: boolean;
  awardsViewed?: boolean;
  videosViewed?: boolean;
  testimonialsViewed?: boolean;
  techStackViewed?: boolean;
  totalVisits?: number;
} & Identification &
  IFingerPrint &
  IGeoAPINew &
  IUserData;

export interface IAnalyticsInit {
  visitorID?: string;
  csrfToken: string;
  ua: string;
  fp_visitorID?: string;
}

export type FEData = {
  reqd: IAnalyticsInit;
  data: IFEGeo;
};

export type FEventData = {
  key: string;
  eventData: IEventData[];
  // Visibility
  workViewed?: boolean;
  blogViewed?: boolean;
  contactViewed?: boolean;
  projectsViewed?: boolean;
  awardsViewed?: boolean;
  videosViewed?: boolean;
  testimonialsViewed?: boolean;
  techStackViewed?: boolean;
  email?: string;
  uid?: string;
};

export interface IFEGeo {
  fp_visitorID?: string;
  fp_browserName?: string;
  fp_browserVersion?: string;
  fp_confidenceScore?: number;
  fp_device?: string;
  fp_firstSeenAt_global?: string;
  fp_firstSeenAt_subscription?: string;
  fp_incognito?: boolean;
  fp_ip?: string;
  fp_accuracyRadius?: number;
  fp_cityName?: string;
  fp_continentName?: string;
  fp_continentCode?: string;
  fp_country?: string;
  fp_countryCode?: string;
  fp_latitude?: number;
  fp_longitude?: number;
  fp_postCode?: string;
  fp_subDivision?: unknown[];
  fp_timezone?: string;
  fp_lastSeenAt_global?: string;
  fp_lastSeenAt_subscription?: string;
  fp_metaVersion?: string;
  fp_OS?: string;
  fp_OSVersion?: string;
  fp_Visitor?: boolean;

  // GEO API
  ip?: string;
  network?: string;
  version?: string;
  city?: string;
  region?: string;
  region_code?: string;
  country?: string;
  country_name?: string;
  country_code?: string;
  country_code_iso3?: string;
  country_capital?: string;
  country_tld?: string;
  continent_code?: string;
  in_eu?: boolean;
  postal?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  utc_offset?: string;
  country_calling_code?: string;
  currency?: string;
  currency_name?: string;
  languages?: string;
  country_area?: number;
  country_population?: number;
  asn?: string;
  org?: string;

  uid?: string;
  email?: string;
  visitorID?: string;

  // Visibility
  workViewed?: boolean;
  blogViewed?: boolean;
  contactViewed?: boolean;
  projectsViewed?: boolean;
  awardsViewed?: boolean;
  videosViewed?: boolean;
  testimonialsViewed?: boolean;
  techStackViewed?: boolean;
}

type ISessionCollection = {
  latestConnectedAt: Timestamp;
  latestDisconnectedAt: Timestamp;
  latestDuration: number;
  latestDisconnectedForcefully: boolean;
  totalConnections: number;
  lastHundredConnections: ISessionData[];
} & Identification;

type IFEStartSession = {
  uid?: string;
  email?: string;
  geo: IGeoAPINew;
  fp: IFingerprintAPI;
  csrfToken: string;
};

type IEventsCollection = IEventData & Identification;

interface IFingerprintAPI {
  requestId: string;
  browserName: string;
  browserVersion: string;
  confidence: {
    score: number;
  };
  device: string;
  firstSeenAt: {
    global: string | null;
    subscription: string | null;
  };
  incognito: boolean;
  ip: string;
  ipLocation?: {
    accuracyRadius?: number;

    latitude?: number;

    longitude?: number;

    timezone?: string;

    postalCode?: string;

    city?: {
      name: string;
    };

    subdivisions?: [
      {
        isoCode: string;
        name: string;
      },
    ];

    country?: {
      code: string;
      name: string;
    };

    continent?: {
      code: string;
      name: string;
    };
  };

  lastSeenAt: {
    global: string | null;
    subscription: string | null;
  };
  meta?: {
    version?: string;
  };
  os: string;
  osVersion: string;
  visitorFound: boolean;
  visitorId: string;
}

/*--------------------------Static Content ----------------------------------*/

interface INavigations {
  shouldSend: boolean;
  latestViewed: AttributeValue;
  viewedSections: Record<AttributeValue, boolean>;
}

interface IThemeInteractions {
  darkModeCount: number;
  darkMode: boolean;
  shouldSend: boolean;
}

interface IClickInteractions {
  clickIdentifier: string;
  clickPerformedAt: number;
  clickedTimes: number;
  clickDescription: string;
  identifier1?: string;
  identifier2?: string;
  identifier3?: string;
  identifier4?: string;
}

interface ISoundInteractions {
  playedSound: boolean;
  playedSoundDuration: number;
  shouldSend: boolean;
  playedTimes: number;
}

interface IBlogDetails {
  category: string;
  blogID: string;
  socialHandle: string;
  url: string;
}

interface IBlogView {
  blogID: string;
  category: string;
  timesClicked: number;
  actionType: 'rank-navigate' | 'category-navigate' | 'blog-navigate';
}

interface IExtraDetails {
  userID?: string;
  fingerprint: string;
  clickCount: number;
}

interface IBlogViews {
  ranksViewed: Record<string, IBlogView>;
  socialClicks: Record<string, IBlogDetails & IExtraDetails>;
  shouldSend: boolean;
}

interface IContactFormTrigger {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  shouldSend: boolean;
}

type StaticContent = {
  navigations: INavigations;
  themes: IThemeInteractions;
  sounds: ISoundInteractions;
  clicks: Record<ClickActionAttributes, IClickInteractions>;
  blogs: IBlogViews;
  contacts: IContactFormTrigger;
  viewedBackImage: boolean;
};

export type {
  IAnalyticsData,
  IEventData,
  ISessionData,
  IGeoAPI,
  IFEData,
  ITransformData,
  IAnalyticsCollection,
  ISessionCollection,
  IEventsCollection,
  IFEStartSession,
  StaticContent,
};
