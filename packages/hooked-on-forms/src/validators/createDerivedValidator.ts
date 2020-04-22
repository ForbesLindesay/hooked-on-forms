import IValidator from './IValidator';
import {Maybe, cancelled, Ok} from '../Maybe';
import CancellationToken, {isCancelled} from '../CancellationToken';
import isPromise from '../isPromise';
import {
  createSubscriptionHandler,
  subscribe,
  fire,
} from '../SubscriptionHandler';
import IValidatorStore from './IValidatorStore';
import {withContext, DependencyKey} from '../hooks/validation';
import IStore from '../stores/IStore';

export default function createDerivedValidator<TRaw, TInput, TValid, TError>(
  parentValidator: IValidator<TRaw, TInput, TError>,
  fn: (
    value: TInput,
    token: CancellationToken,
  ) => Ok<TValid> | Promise<Ok<TValid>>,
): IValidator<TRaw, TValid, TError>;
export default function createDerivedValidator<
  TRaw,
  TInput,
  TValid,
  TError,
  SError
>(
  parentValidator: IValidator<TRaw, TInput, TError>,
  fn: (
    value: TInput,
    token: CancellationToken,
  ) => Maybe<TValid, SError> | Promise<Maybe<TValid, SError>>,
): IValidator<TRaw, TValid, TError | SError>;
export default function createDerivedValidator<
  TRaw,
  TInput,
  TValid,
  TError,
  SError
>(
  parentValidator: IValidator<TRaw, TInput, TError>,
  fn: (
    value: TInput,
    token: CancellationToken,
  ) => Maybe<TValid, SError> | Promise<Maybe<TValid, SError>>,
): IValidator<TRaw, TValid, TError | SError> {
  return (ctx) => {
    let lastInput: TInput | undefined;
    let lastOutput:
      | Maybe<TValid, TError | SError>
      | Promise<Maybe<TValid, TError | SError>>
      | undefined;
    let establishedDependencies = false;
    const dependencies: {
      store: IStore<any, any, any>;
      key: DependencyKey;
    }[] = [];

    const subscribers = createSubscriptionHandler();
    const parent: IValidatorStore<TRaw, TInput, TError> = parentValidator(ctx);

    function validateInner(value: TInput, token: CancellationToken) {
      if (establishedDependencies) {
        let i = 0;
        return withContext(
          {
            ctx,
            onDependency: (store, key) => {
              const expected = dependencies[i++];
              if (
                !expected ||
                expected.store !== store ||
                expected.key !== key
              ) {
                throw new Error(
                  'You must read all validation dependencies in a consistent order.',
                );
              }
            },
          },
          () => fn(value, token),
        );
      } else {
        const result = withContext(
          {
            ctx,
            onDependency: (store, key) => {
              dependencies.push({store, key});
            },
            fire: () => {
              // clear cache when a dependency changes
              lastOutput = undefined;
              fire(subscribers);
            },
          },
          () => fn(value, token),
        );
        establishedDependencies = true;
        return result;
      }
    }

    return {
      subscribe(fn: () => void): () => void {
        const local = subscribe(subscribers, fn);
        const parentSubscription = parent.subscribe(fn);
        return () => {
          local();
          parentSubscription();
        };
      },

      validate(value: TRaw, token: CancellationToken) {
        const input = parent.validate(value, token);

        const gotValue = (maybeValue: Maybe<TInput, TError>) => {
          if (!maybeValue.ok) return maybeValue;
          const value = maybeValue.value;
          if (value === lastInput && lastOutput !== undefined) {
            return lastOutput;
          }

          if (isCancelled(token)) return cancelled();
          const result = validateInner(value, token);
          lastInput = value;
          lastOutput = result;
          if (isPromise(result)) {
            result.catch(() => {
              if (lastInput === value) {
                lastInput = undefined;
                lastOutput = undefined;
              }
            });
          }
          return result;
        };

        if (isPromise(input)) {
          return input.then(gotValue);
        } else {
          return gotValue(input);
        }
      },
    };
  };
}
