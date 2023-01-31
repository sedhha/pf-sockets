import { randomUUID } from 'crypto';
import { info } from '@/utils/dev-utils';

interface ISession {
  ua: string;
  identifier?: string;
}
class CSRFSession {
  data: Record<string, ISession>;
  constructor() {
    this.data = {};
  }
  addSession(ua: string, identifier?: string) {
    const key = randomUUID();
    this.data[key] = { ua, identifier };
    return key;
  }
  removeSession(key: string) {
    if (!this.data[key]) {
      const currentSessions = Object.keys(this.data);
      info(`| ${key} not present to delete: ${currentSessions.join('|')}`);
    } else delete this.data[key];
  }
  checkSession(key: string, ua: string) {
    const sessionUa = this.data[key].ua;
    return ua?.toLowerCase() === sessionUa?.toLowerCase();
  }
  updateSession(key: string, payload: ISession) {
    this.data[key] = { ...payload };
  }
  getSession(key: string) {
    return this.data[key];
  }
}

if (!global.csrfSession) {
  global.csrfSession = new CSRFSession();
}
const session = global.csrfSession;

export default session as CSRFSession;
