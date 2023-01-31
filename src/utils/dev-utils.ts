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
  console.log(`[${new Date().toUTCString()}] `, ...logs);
};

export const throwAndLogError = (logMessage: string): Error => {
  console.error(logMessage);
  throw new Error(logMessage);
};

export const containsSomeFromExpected = (ua: string): boolean => {
  const searchParams = [
    'windows',
    'mac',
    'linux',
    'ios',
    'android',
    'iphone',
    'ios',
    'apple',
    'safari',
    'firefox',
  ];
  const uaLower = ua.toLowerCase();
  const available = searchParams.find(element => uaLower.includes(element));
  return available ? true : false;
};
