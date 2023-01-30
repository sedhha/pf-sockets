import { randomUUID } from 'crypto';
class CSRFSession {
  data: Record<string, string>;
  constructor() {
    this.data = {};
  }
  addSession(ua: string) {
    const key = randomUUID();
    this.data[key] = ua;
    return key;
  }
  removeSession(key: string) {
    delete this.data[key];
  }
  getSession(key: string, ua: string) {
    const sessionUa = this.data[key];
    return ua.toLowerCase() === sessionUa.toLowerCase();
  }
}

if (!global.csrfSession) {
  global.csrfSession = new CSRFSession();
}
const session = global.csrfSession;

export default session as CSRFSession;
