import CancellationToken, {
  createCancellationToken,
  cancel,
  isCancelled,
} from '../CancellationToken';
import isPromise from '../isPromise';
import {ValidationResult} from '../Maybe';
import IStore, {
  createStoreSubscriptionHandlers,
  fireValidationResult,
  fireDirty,
  fireRawValue,
  fireTouched,
} from './IStore';
import Context from '../Context';
import IValidatorStore from '../validators/IValidatorStore';
import SubscriptionHandler, {
  fireBatch,
  createSubscriptionHandler,
  fire,
} from '../SubscriptionHandler';

export default interface SingleFieldStore<TRaw, TValidated, TError>
  extends IStore<TRaw, TValidated, TError> {
  setRawValue(value: TRaw | ((oldValue: TRaw) => TRaw)): void;
  setRawValueFromEvent(e: {target: {value: TRaw}}): void;
  focus(): void;
  blur(): void;
  focusedSubscription: SubscriptionHandler;
  getFocused(): boolean;
}
export function createSingleFieldStore<TRaw, TValidated, TError>(
  initialValue: TRaw,
  validator: IValidatorStore<TRaw, TValidated, TError>,
  context: Context,
): SingleFieldStore<TRaw, TValidated, TError> {
  const subscriptions = createStoreSubscriptionHandlers();
  const focusedSubscription = createSubscriptionHandler();
  let touched = false;
  let focused = false;
  let dirty = false;

  let rawValue = initialValue;
  let validationResult: ValidationResult<TValidated, TError> = {
    ok: null,
    value: undefined,
    validating: true,
  };
  let validation = createCancellationToken();

  validate(rawValue, validation);
  validator.subscribe(() => {
    cancel(validation);
    validate(rawValue, (validation = createCancellationToken()));
    fireValidationResult(subscriptions);
  });

  return {
    context,
    subscriptions,

    getRawValue() {
      return rawValue;
    },

    setRawValue,

    setRawValueFromEvent(e: {target: {value: TRaw}}) {
      setRawValue(e.target.value);
    },

    getValidationResult() {
      return validationResult;
    },

    touch() {
      if (!touched) {
        touched = true;
        fireTouched(subscriptions);
      }
    },
    getTouched() {
      return touched;
    },

    clearDirty() {
      if (dirty) {
        dirty = false;
        fireDirty(subscriptions);
      }
    },
    getDirty() {
      return dirty;
    },

    focusedSubscription,
    getFocused() {
      return focused;
    },

    focus() {
      focused = true;
      fire(focusedSubscription);
    },
    blur() {
      fireBatch(() => {
        if (!touched) {
          touched = true;
          fireTouched(subscriptions);
        }
        focused = false;
        fire(focusedSubscription);
      });
    },
  };

  function setRawValue(value: TRaw | ((oldValue: TRaw) => TRaw)) {
    if (value === rawValue) return;
    fireBatch(() => {
      cancel(validation);
      if (!dirty) {
        dirty = true;
        fireDirty(subscriptions);
      }
      const resultStart = validationResult;
      validate(
        (rawValue =
          typeof value === 'function'
            ? (value as (oldValue: TRaw) => TRaw)(rawValue)
            : value),
        (validation = createCancellationToken()),
      );
      fireRawValue(subscriptions);
      if (resultStart !== validationResult) {
        fireValidationResult(subscriptions);
      }
    });
  }

  function validate(value: TRaw, cancellationToken: CancellationToken) {
    const nextValidationResult = validator.validate(value, cancellationToken);
    if (isPromise(nextValidationResult)) {
      if (!validationResult.validating) {
        validationResult = {...validationResult, validating: true};
      }
      void nextValidationResult.then((validationResult2) => {
        if (
          !isCancelled(cancellationToken) &&
          validationResult2.ok !== null &&
          (validationResult.validating ||
            validationResult.ok !== validationResult2.ok ||
            validationResult.value !== validationResult2.value)
        ) {
          validationResult = {...validationResult2, validating: false};
          fireValidationResult(subscriptions);
        }
      });
    } else {
      if (
        nextValidationResult.ok !== null &&
        (validationResult.validating ||
          validationResult.ok !== nextValidationResult.ok ||
          validationResult.value !== nextValidationResult.value)
      ) {
        validationResult = {...nextValidationResult, validating: false};
      }
    }
  }
}
