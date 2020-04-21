import SubscriptionHandler, {
  subscribe,
  createSubscriptionHandler,
} from './SubscriptionHandler';

type CancellationToken = {v: SubscriptionHandler | undefined};
export function createCancellationToken() {
  return {v: createSubscriptionHandler()};
}
export function cancel(token: CancellationToken) {
  if (token.v) {
    const s = [...token.v];
    token.v = undefined;
    s.forEach((fn) => fn());
  }
}

export function isCancelled(token: CancellationToken) {
  return !token.v;
}

export function onCancel(token: CancellationToken, fn: () => void) {
  if (token.v) {
    return subscribe(token.v, fn);
  } else {
    const timeout = setTimeout(fn, 0);
    return () => clearTimeout(timeout);
  }
}
export async function wait(token: CancellationToken) {
  if (token.v) {
    await new Promise<void>((resolve) => subscribe(token.v!, resolve));
  }
}

export default CancellationToken;

// export default class CancellationToken {
//   private _cancelSubscribers: Set<() => void> | undefined = new Set<
//     () => void
//   >();

//   public cancel() {
//     if (this._cancelSubscribers) {
//       const s = [...this._cancelSubscribers];
//       this._cancelSubscribers = undefined;
//       s.forEach((fn) => fn());
//     }
//   }

//   public isCancelled() {
//     return !this._cancelSubscribers;
//   }
//   public subscribe(fn: () => void) {
//     if (this._cancelSubscribers) {
//       this._cancelSubscribers.add(fn);
//       return () => {
//         if (this._cancelSubscribers) this._cancelSubscribers.delete(fn);
//       };
//     }
//     const timeout = setTimeout(fn, 0);
//     return () => clearTimeout(timeout);
//   }
//   public async wait() {
//     if (this._cancelSubscribers) {
//       await new Promise<void>((resolve) =>
//         this._cancelSubscribers!.add(resolve),
//       );
//     }
//   }
// }
