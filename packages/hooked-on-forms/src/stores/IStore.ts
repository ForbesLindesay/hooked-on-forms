import {ValidationResult} from '../Maybe';
import Context from '../Context';
import SubscriptionHandler, {
  createSubscriptionHandler,
  subscribe,
  fire,
} from '../SubscriptionHandler';

export type StoreSubscriptionHandlers = [
  SubscriptionHandler,
  SubscriptionHandler,
  SubscriptionHandler,
  SubscriptionHandler,
];

export function createStoreSubscriptionHandlers(): StoreSubscriptionHandlers {
  return [
    createSubscriptionHandler(),
    createSubscriptionHandler(),
    createSubscriptionHandler(),
    createSubscriptionHandler(),
  ];
}

export default interface IStore<TRaw, TValidated, TError> {
  readonly context: Context;
  readonly subscriptions: StoreSubscriptionHandlers;

  getRawValue(): TRaw;
  getValidationResult(): ValidationResult<TValidated, TError>;

  touch(): void;
  getTouched(): boolean;

  clearDirty(): void;
  getDirty(): boolean;
}

export function fireRawValue(subscriptions: StoreSubscriptionHandlers) {
  fire(subscriptions[0]);
}
export function subscribeRawValue<TRaw, TValidated, TError>(
  {subscriptions}: IStore<TRaw, TValidated, TError>,
  fn: () => void,
): () => void {
  return subscribe(subscriptions[0], fn);
}

export function fireValidationResult(subscriptions: StoreSubscriptionHandlers) {
  fire(subscriptions[1]);
}
export function subscribeValidationResult<TRaw, TValidated, TError>(
  {subscriptions}: IStore<TRaw, TValidated, TError>,
  fn: () => void,
): () => void {
  return subscribe(subscriptions[1], fn);
}

export function fireTouched(subscriptions: StoreSubscriptionHandlers) {
  fire(subscriptions[2]);
}
export function subscribeTouched<TRaw, TValidated, TError>(
  {subscriptions}: IStore<TRaw, TValidated, TError>,
  fn: () => void,
): () => void {
  return subscribe(subscriptions[2], fn);
}

export function fireDirty(subscriptions: StoreSubscriptionHandlers) {
  fire(subscriptions[3]);
}
export function subscribeDirty<TRaw, TValidated, TError>(
  {subscriptions}: IStore<TRaw, TValidated, TError>,
  fn: () => void,
): () => void {
  return subscribe(subscriptions[3], fn);
}
