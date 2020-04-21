import IStore, {
  createStoreSubscriptionHandlers,
  subscribeDirty,
  fireDirty,
  subscribeTouched,
  fireTouched,
  subscribeRawValue,
  fireRawValue,
  subscribeValidationResult,
  fireValidationResult,
} from './IStore';
import {ValidationResult} from '../Maybe';
import Context from '../Context';
import {fireBatch} from '../SubscriptionHandler';

type ExtractRawValues<T> = {
  [key in keyof T]: T[key] extends IStore<infer TRaw, any, any> ? TRaw : never;
};
type ExtractValidatedValues<T> = {
  [key in keyof T]: T[key] extends IStore<any, infer TValid, any>
    ? TValid
    : never;
};
type ExtractErrorValues<T> = {
  [key in keyof T]: T[key] extends IStore<any, any, infer TError>
    ? TError
    : never;
}[keyof T];

export default interface FieldGroupStore<
  TObject extends Record<string, IStore<any, any, any>>
>
  extends IStore<
    ExtractRawValues<TObject>,
    ExtractValidatedValues<TObject>,
    ExtractErrorValues<TObject>
  > {}

export function createFieldGroupStore<
  TObject extends Record<string, IStore<any, any, any>>
>(stores: TObject, context: Context): FieldGroupStore<TObject> {
  const subscriptions = createStoreSubscriptionHandlers();
  const storesList: readonly {
    readonly name: string;
    readonly store: IStore<any, any, any>;
  }[] = Object.entries(stores).map(([name, store]) => ({
    name,
    store,
  }));

  let dirty = storesList.some(({store}) => store.getDirty());
  let touched = storesList.some(({store}) => store.getTouched());
  let rawValue = getRawValue();
  let validationResult = getValidationResult();

  for (const {name, store} of storesList) {
    subscribeDirty(store, () => {
      if (dirty !== store.getDirty()) {
        const newDirty = storesList.some(({store}) => store.getDirty());
        if (dirty !== newDirty) {
          dirty = newDirty;
          fireDirty(subscriptions);
        }
      }
    });
    subscribeTouched(store, () => {
      if (touched !== store.getTouched()) {
        const newTouched = storesList.some(({store}) => store.getTouched());
        if (touched !== newTouched) {
          touched = newTouched;
          fireTouched(subscriptions);
        }
      }
    });
    subscribeRawValue(store, () => {
      rawValue = {...rawValue, [name]: store.getRawValue()};
      fireRawValue(subscriptions);
    });
    subscribeValidationResult(store, () => {
      validationResult = getValidationResult();
      fireValidationResult(subscriptions);
    });
  }

  return {
    context,
    subscriptions,
    getRawValue() {
      return rawValue;
    },
    getValidationResult(): ValidationResult<
      ExtractValidatedValues<TObject>,
      ExtractErrorValues<TObject>
    > {
      return validationResult;
    },

    touch() {
      fireBatch(() => {
        for (const {store} of storesList) {
          store.touch();
        }
      });
    },
    getTouched() {
      return touched;
    },

    clearDirty() {
      fireBatch(() => {
        for (const {store} of storesList) {
          store.clearDirty();
        }
      });
    },
    getDirty() {
      return dirty;
    },
  };

  function getRawValue(): ExtractRawValues<TObject> {
    const result: any = {};
    for (const {name, store} of storesList) {
      result[name] = store.getRawValue();
    }
    return result;
  }

  function getValidationResult(): ValidationResult<
    ExtractValidatedValues<TObject>,
    ExtractErrorValues<TObject>
  > {
    let validating = false;
    const result: any = {};
    for (const {name, store} of storesList) {
      const r = store.getValidationResult();
      if (r.ok === true) {
        result[name] = r.value;
        validating = validating || r.validating;
      } else {
        return r;
      }
    }
    return {ok: true, value: result, validating};
  }
}
