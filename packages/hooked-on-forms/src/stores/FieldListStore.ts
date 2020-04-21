import {ValidationResult} from '../Maybe';
import Context, {addField, createFormContext} from '../Context';
import IField from '../fields/IField';
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
import {
  createSubscriptionHandler,
  fire,
  subscribe,
} from '../SubscriptionHandler';

export default interface FieldListStore<TRaw, TValidated, TError>
  extends IStore<TRaw[], TValidated[], TError> {
  push(...values: TRaw[]): void;
  pop(): void;
  splice(index: number, deleteCount: number, ...newValues: TRaw[]): void;

  subscribeStores(fn: () => void): () => void;
  getKey(store: IStore<TRaw, TValidated, TError>): number | undefined;
  getStores(): IStore<TRaw, TValidated, TError>[];
}

export function createFieldListStore<TRaw, TValidated, TError>(
  element: IField<TRaw, TValidated, TError>,
  initialValues: readonly TRaw[],
  context: Context,
): FieldListStore<TRaw, TValidated, TError> {
  const subscriptions = createStoreSubscriptionHandlers();
  const storesSubscribers = createSubscriptionHandler();

  const stores: IStore<TRaw, TValidated, TError>[] = initialValues.map((v) =>
    addField(createFormContext(context), element, v),
  );
  let dirty = stores.some((store) => store.getDirty());
  let touched = stores.some((store) => store.getTouched());
  let rawValue = getRawValue();
  let validationResult = getValidationResult();
  const unsubscribers = new Map<IStore<TRaw, TValidated, TError>, () => void>();
  let nextKey = 1;
  const keys = new Map<IStore<TRaw, TValidated, TError>, number>();

  for (const store of stores) {
    subscribeStore(store);
  }

  return {
    context,
    subscriptions,

    push(...values: TRaw[]) {
      for (const v of values) {
        const store = addField(createFormContext(context), element, v);
        stores.push(store);
        subscribeStore(store);
      }
      refresh();
    },

    pop() {
      if (stores.length) {
        unsubscribeStore(stores.pop()!);
        refresh();
      }
    },

    splice(index: number, deleteCount: number, ...newValues: TRaw[]) {
      const newStores = newValues.map((v) =>
        addField(createFormContext(context), element, v),
      );
      const deleted = stores.splice(index, deleteCount, ...newStores);
      deleted.forEach((d) => unsubscribeStore(d));
      newStores.forEach((store) => subscribeStore(store));
      refresh();
    },

    subscribeStores(fn: () => void) {
      return subscribe(storesSubscribers, fn);
    },

    getKey(store: IStore<TRaw, TValidated, TError>) {
      return keys.get(store);
    },

    getStores() {
      return stores;
    },

    getRawValue(): TRaw[] {
      return rawValue;
    },

    getValidationResult(): ValidationResult<TValidated[], TError> {
      return validationResult;
    },

    touch() {
      for (const store of stores) {
        store.touch();
      }
    },
    getTouched() {
      return touched;
    },

    clearDirty() {
      for (const store of stores) {
        store.clearDirty();
      }
    },
    getDirty() {
      return dirty;
    },
  };

  function subscribeStore(store: IStore<TRaw, TValidated, TError>) {
    keys.set(store, nextKey++);
    const unsub = [
      subscribeDirty(store, () => {
        if (dirty !== store.getDirty()) {
          const newDirty = stores.some((store) => store.getDirty());
          if (dirty !== newDirty) {
            dirty = newDirty;
            fireDirty(subscriptions);
          }
        }
      }),
      subscribeTouched(store, () => {
        if (touched !== store.getTouched()) {
          const newTouched = stores.some((store) => store.getTouched());
          if (touched !== newTouched) {
            touched = newTouched;
            fireTouched(subscriptions);
          }
        }
      }),
      subscribeRawValue(store, () => {
        rawValue = getRawValue();
        fireRawValue(subscriptions);
      }),
      subscribeValidationResult(store, () => {
        validationResult = getValidationResult();
        fireValidationResult(subscriptions);
      }),
    ];
    unsubscribers.set(store, () => {
      unsub.forEach((fn) => fn());
    });
  }

  function unsubscribeStore(store: IStore<TRaw, TValidated, TError>) {
    keys.delete(store);
    unsubscribers.get(store)?.();
    unsubscribers.delete(store);
  }

  function refresh() {
    const newDirty = stores.some((store) => store.getDirty());
    if (dirty !== newDirty) {
      dirty = newDirty;
      fireDirty(subscriptions);
    }
    const newTouched = stores.some((store) => store.getTouched());
    if (touched !== newTouched) {
      touched = newTouched;
      fireTouched(subscriptions);
    }
    rawValue = getRawValue();
    validationResult = getValidationResult();
    fireRawValue(subscriptions);
    fireValidationResult(subscriptions);
    fire(storesSubscribers);
  }

  function getRawValue(): TRaw[] {
    return stores.map((s) => s.getRawValue());
  }

  function getValidationResult(): ValidationResult<TValidated[], TError> {
    let validating = false;
    const result: TValidated[] = [];
    for (const store of stores) {
      const r = store.getValidationResult();
      if (r.ok === true) {
        result.push(r.value);
        validating = validating || r.validating;
      } else {
        return r;
      }
    }
    return {ok: true, value: result, validating};
  }
}
