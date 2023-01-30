interface IWebSocket {
  ua: string;
  message: string;
}

interface IWSDecoded<T> {
  headers?: Record<string, string> & { csrf: string };
  body: T;
}

interface IWSResponse<T> {
  closeConnection: boolean;
  body?: T;
  status: number;
  message?: string;

  // Important for successful responses
  csrf?: string;
  actionType?: string;
}

interface IWSResult<T> {
  status: number;
  payload?: T;
  message?: string;
  identifier: string;
}

export type { IWebSocket, IWSDecoded, IWSResponse, IWSResult };
