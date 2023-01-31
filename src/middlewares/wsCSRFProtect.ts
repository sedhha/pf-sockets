import { info } from '@/utils/dev-utils';
import { IWebSocket, IWSDecoded, IWSResponse } from '@/interfaces/webSocket';
import session from '@/firebase/csrf';

const withCSRFProtect = <T>(data: IWebSocket): IWSResponse<T> => {
  const { ua, message } = data;
  info(`| WEB-SOCKET::INIT | ${ua}`);
  try {
    const decoded = JSON.parse(
      Buffer.from(message, 'base64').toString('utf8'),
    ) as IWSDecoded<T>;
    const {
      headers: { csrf, actionType },
      body,
    } = decoded;
    if (!csrf || !body || !actionType) {
      info(`| WEB-SOCKET::ERROR | Missing CSRF - ${csrf}`);
      return {
        closeConnection: true,
        status: 401,
        message: 'Connection closed unexpectedly',
        body,
        csrf,
      };
    }
    const validSession = session.checkSession(csrf, ua);
    if (validSession) {
      info(`| WEB-SOCKET::SUCCESS::${actionType} | CSRF Safe - ${csrf}`);
      return {
        closeConnection: false,
        status: 200,
        body,
        csrf,
        actionType,
      };
    } else {
      info(`| WEB-SOCKET::FAILURE | CSRF UnSafe - ${csrf}`);
      return {
        closeConnection: true,
        status: 401,
        body,
        csrf,
      };
    }
  } catch (err) {
    info(`| WEB-SOCKET::ERROR | ${err.message}`);
    return {
      closeConnection: true,
      status: 500,
    };
  }
};

export default withCSRFProtect;
