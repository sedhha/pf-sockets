import { Response, Request } from 'express';
import { IApiHandler, IResult } from '@/interfaces/rest';
import { info } from '@/utils/dev-utils';

const withGenericIntercept = <T>(handler: IApiHandler<T>) => {
  return async (req: Request, res: Response<IResult<T>>) => {
    info(`| INIT | [${req.method}] | ${req.url}`);
    try {
      const result = await handler(req);
      info(
        `| SUCCESS | Status Code: ${result.status} | Errored: ${result.errored}`,
      );
      return res.status(result.status).json({
        errored: result.errored,
        json: result.json,
      });
    } catch (err) {
      info(`| ERROR | ${err.message}`);
      return res.status(500).json({
        errored: true,
        json: err.message,
      });
    }
  };
};

export default withGenericIntercept;
