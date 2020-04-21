export default function isPromise<T, S>(
  value: T | Promise<S>,
): value is Promise<S> {
  return (
    value &&
    // tslint:disable-next-line: strict-type-predicates
    (typeof value === 'object' || typeof value === 'function') &&
    typeof (value as any).then === 'function'
  );
}
