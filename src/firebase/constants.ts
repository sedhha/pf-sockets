import { throwAndLogError } from '@/utils/dev-utils';
const getEnvPrefix = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'prod';
    case 'development':
    default:
      return 'dev';
  }
};
const isProd = process.env.NODE_ENV === 'production';
const isAnalyticsEnabled = JSON.parse(
  process.env.NEXT_PUBLIC_ANALYTICS_ENABLED ?? 'false',
);
export const storeCollectionPaths = {
  feedback: 'feedback',
  newsletters: 'newsletters',
  geoAnalytics: 'geoAnalytics',
  sessionAnalytics: 'sessionAnalytics',
  eventAnalytics: 'eventAnalytics',
};

export const getCollectionPath = (path: string): string => {
  const prefix = getEnvPrefix();
  const storagePath =
    storeCollectionPaths[path as keyof typeof storeCollectionPaths];
  if (!storagePath) {
    throwAndLogError(
      `Path for ${path} does not exist. Make sure you want to have a dynamic collection.`,
    );
    return '';
  }
  return `${prefix}-${storagePath}`;
};

export const dbPaths = {
  userMessages: 'user-messages',
  userMessageMetadata: 'user-message-metadata',
  csrfTokens: 'csrf-token',
  adminMetaData: 'admin-metadata',
};

const formRootMessagesPath = () =>
  `${getEnvPrefix()}-${dbPaths.userMessageMetadata}`;

const formAdminIsOnlinePath = () =>
  `${getEnvPrefix()}-${dbPaths.adminMetaData}/isOnline`;

const formMessagesPath = (uid: string) =>
  `${getEnvPrefix()}-${dbPaths.userMessages}/${uid}/messages`;

const lastModifiedPath = (uid: string) =>
  `${getEnvPrefix()}-${dbPaths.userMessageMetadata}/${uid}/lastModified`;

const emailRefPath = (uid: string) =>
  `${getEnvPrefix()}-${dbPaths.userMessageMetadata}/${uid}/emailOfSender`;

const readRecipientPath = (uid: string) =>
  `${getEnvPrefix()}-${dbPaths.userMessageMetadata}/${uid}/readByMe`;

const readRecipientPathUser = (uid: string) =>
  `${getEnvPrefix()}-${dbPaths.userMessageMetadata}/${uid}/readByUser`;

const latestMessagePath = (uid: string) =>
  `${getEnvPrefix()}-${dbPaths.userMessageMetadata}/${uid}/latestMessage`;

const typingUserPath = (uid: string, isVisitor: boolean) =>
  isVisitor
    ? `${getEnvPrefix()}-${dbPaths.userMessageMetadata}/${uid}/visitorTyping`
    : `${getEnvPrefix()}-${dbPaths.userMessageMetadata}/${uid}/meTyping`;

const formCSRFPath = () => `${getEnvPrefix()}-${dbPaths.csrfTokens}`;

const getNewsLetterPath = () => {
  const prefix = getEnvPrefix();
  return `${prefix}-${storeCollectionPaths.newsletters}`;
};
const getDBPath = (path: string): string => {
  const prefix = getEnvPrefix();
  const storagePath = dbPaths[path as keyof typeof dbPaths];
  if (!storagePath) {
    throwAndLogError(
      `Path for ${path} does not exist. Make sure you want to have a dynamic collection.`,
    );
    return '';
  }
  return `${prefix}-${storagePath}`;
};

// Analytics Paths

const getGeoPath = (identifier: string) => {
  const prefix = getEnvPrefix();
  return `${prefix}-${storeCollectionPaths.geoAnalytics}/${identifier}`;
};
const getSessionPath = (identifier: string) => {
  const prefix = getEnvPrefix();
  return `${prefix}-${storeCollectionPaths.sessionAnalytics}/${identifier}`;
};
const getEventPath = () => {
  const prefix = getEnvPrefix();
  return `${prefix}-${storeCollectionPaths.eventAnalytics}`;
};

const supportedOperations = {
  start: 'start',
  close: 'close',
  forceClose: 'forceClose',
  closedByServer: 'closedByServer',
  casualEventsNavigations: 'casualEventsNavigations',
} as const;
const attributes = {
  About: 'about',
  WorkExperience: 'work-experience',
  Contact: 'contact',
  Projects: 'projects',
  Awards: 'awards',
  Blog: 'blog',
  Videos: 'videos',
  Testimonials: 'testimonials',
  TechStack: 'tech-stack',
};

const clickActions = {
  workExperienceNext: 'workExperienceNext',
  workExperiencePrevious: 'workExperiencePrevious',
  authenticateAndChat: 'authenticateAndChat',
  unauthenticatedAndChat: 'unauthenticatedAndChat',
  successContactFormSubmission: 'successContactFormSubmission',
  failedContactFormSubmission: 'failedContactFormSubmission',
  projectsNext: 'projectsNext',
  projectsPrevious: 'projectsPrevious',
  cardDetails: 'cardDetails',
  awardsAndExperiencesNext: 'awardsAndExperiencesNext',
  awardsAndExperiencesPrevious: 'awardsAndExperiencesPrevious',
  awardCardDetails: 'awardCardDetails',
  videoPlayEvent: 'videoPlayEvent',
  onClickVideos: 'onClickVideos',
  testimonialsNext: 'testimonialsNext',
  testimonialsPrevious: 'testimonialsPrevious',
  testimonialReferrerProfiles: 'testimonialReferrerProfiles',
  techStackSearch: 'techStackSearch',
};

export type SupportedOps = keyof typeof supportedOperations;
export type AttributeValue = (typeof attributes)[keyof typeof attributes];
export type ClickActionAttributes =
  (typeof clickActions)[keyof typeof clickActions];
export {
  supportedOperations,
  formRootMessagesPath,
  formMessagesPath,
  lastModifiedPath,
  getNewsLetterPath,
  emailRefPath,
  readRecipientPath,
  latestMessagePath,
  typingUserPath,
  formCSRFPath,
  readRecipientPathUser,
  formAdminIsOnlinePath,
  isAnalyticsEnabled,
  getDBPath,
  // Analytics V2 Paths
  getGeoPath,
  getSessionPath,
  getEventPath,
  isProd,
};
