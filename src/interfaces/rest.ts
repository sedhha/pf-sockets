import { Request } from 'express';

interface IResponse<T> {
  errored: boolean;
  status: number;
  json?: T;
}

interface IResult<T> {
  errored: boolean;
  json?: T;
}
type IApiHandler<T> = (req: Request) => Promise<IResponse<T>>;

export type { IResponse, IApiHandler, IResult };
