import IValidator from './IValidator';
import {isCancelled, onCancel} from '../CancellationToken';

export default function createDebounceValidator<TRaw, TInput, TError>(
  parentValidator: IValidator<TRaw, TInput, TError>,
  debounceMs: number,
): IValidator<TRaw, TInput, TError> {
  return (ctx) => {
    const parent = parentValidator(ctx);
    return {
      validate: async (v, token) => {
        const result = parent.validate(v, token);
        if (isCancelled(token)) return result;
        await new Promise((resolve) => {
          setTimeout(resolve, debounceMs);
          onCancel(token, resolve);
        });
        return result;
      },
      subscribe: (fn) => parent.subscribe(fn),
    };
  };
}
