type Queue<T> = [T[], T[], Set<T>];
function createQueue<T>(): Queue<T> {
  return [[], [], new Set()];
}
function queueAdd<T>(queue: Queue<T>, item: Exclude<T, undefined | void>) {
  if (queue[2].has(item)) return;
  queue[1].push(item);
  queue[2].add(item);
}
function queueRemove<T>(queue: Queue<T>) {
  const [head, tail] = queue;
  let result;
  if (head.length) {
    result = head.pop();
  } else if (tail.length === 1) {
    result = tail.pop();
  } else if (tail.length) {
    queue[0] = tail.reverse();
    queue[1] = head;
    result = queue[0].pop();
  }
  if (result !== undefined) {
    queue[2].delete(result);
    return result;
  } else {
    return undefined;
  }
}

type SubscriptionHandler = (() => void)[];

export function subscribe<TArgs extends any[] = []>(
  sub: SubscriptionHandler,
  fn: (...args: TArgs) => void,
) {
  sub.push(fn);
  return () => {
    const index = sub.indexOf(fn);
    if (index !== -1) {
      sub.splice(index, 1);
    }
  };
}

let pending: Queue<SubscriptionHandler> | undefined;

function actuallyFire(sub: SubscriptionHandler) {
  for (const handler of sub) {
    handler();
  }
}

export function fire(...subs: SubscriptionHandler[]) {
  if (pending) {
    for (const sub of subs) queueAdd(pending, sub);
  } else {
    pending = createQueue();
    try {
      for (const sub of subs) actuallyFire(sub);
      let next: SubscriptionHandler | undefined = queueRemove(pending);
      while (next) {
        actuallyFire(next);
        next = queueRemove(pending);
      }
    } finally {
      pending = undefined;
    }
  }
}
export function fireBatch<T>(fn: () => T) {
  if (pending) return fn();
  pending = createQueue();
  try {
    return fn();
  } finally {
    try {
      let next: SubscriptionHandler | undefined = queueRemove(pending);
      while (next) {
        actuallyFire(next);
        next = queueRemove(pending);
      }
    } finally {
      pending = undefined;
    }
  }
}

export function createSubscriptionHandler(): SubscriptionHandler {
  return [];
}

export default SubscriptionHandler;
