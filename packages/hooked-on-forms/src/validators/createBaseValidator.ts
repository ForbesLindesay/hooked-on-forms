import IValidator from './IValidator';
import {ok} from '../Maybe';

export default function createBaseValidator<T>(): IValidator<T, T, never> {
  return () => ({
    validate: (v) => ok(v),
    subscribe: () => () => {
      // no op
    },
  });
}
