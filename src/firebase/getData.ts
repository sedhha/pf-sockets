import { store } from '@/firebase/index';
import { IResponse } from '@/interfaces/rest';

const getAllDataFromCollection = async (
  path: string,
  isCollection = false,
): Promise<IResponse<unknown>> =>
  isCollection
    ? store
        .collection(path)
        .get()
        .then(
          data =>
            ({
              errored: false,
              json: data.docs.map(item => item.data()),
              status: 200,
            } as IResponse<unknown>),
        )
        .catch(
          error =>
            ({ errored: true, json: error.message } as IResponse<unknown>),
        )
    : store
        .doc(path)
        .get()
        .then(
          data =>
            ({
              errored: false,
              json: data,
              status: 200,
            } as IResponse<unknown>),
        )
        .catch(
          error =>
            ({ errored: true, json: error.message } as IResponse<unknown>),
        );

export { getAllDataFromCollection };
