export type Cancelled = {ok: null};
const cancelledValue: Cancelled = {ok: null};
export function cancelled(): Cancelled {
  return cancelledValue;
}
export type Ok<TValidated> = {ok: true; value: TValidated};
export function ok<TValidated>(value: TValidated): Ok<TValidated> {
  return {ok: true, value};
}
export type Fail<TError> = {ok: false; value: TError};
export function fail<TError>(value: TError): Fail<TError> {
  return {ok: false, value};
}
export type Maybe<TValidated, TError> =
  | Cancelled
  | Ok<TValidated>
  | Fail<TError>;

export type ValidationResult<TValidated, TError> =
  | {ok: null; value: undefined; validating: true}
  | {ok: true; value: TValidated; validating: boolean}
  | {ok: false; value: TError; validating: boolean};
