interface ILogger {
  logs: unknown[];
  error: boolean;
}
export const println = (...logs: ILogger[] | unknown[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...logs);
  }
};

export const info = (...logs: ILogger[] | unknown[]) => {
  console.log(...logs);
};

export const throwAndLogError = (logMessage: string): Error => {
  console.error(logMessage);
  throw new Error(logMessage);
};
