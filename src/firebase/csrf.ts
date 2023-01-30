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
    return ua === sessionUa;
  }
}

if (!global.session) {
  global.session = new CSRFSession();
}
const session = global.session;

export default session as CSRFSession;
