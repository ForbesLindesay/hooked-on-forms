import IField from '../fields/IField';
import SingleField from '../fields/SingleField';
import FieldList from '../fields/FieldList';
import {useFieldStore} from '../Context';

import * as StoreHooks from './store';
import {useCallback} from 'react';

export function useOnChange<TRaw>(field: SingleField<TRaw, any, any>) {
  return StoreHooks.useOnChange(useFieldStore(field));
}

export function useOnChangeValue<TRaw>(field: SingleField<TRaw, any, any>) {
  return StoreHooks.useOnChangeValue(useFieldStore(field));
}

function withOptionalCallback<T>(useHook: (field: T) => () => void) {
  function useHookWithFn(field: T): () => void;
  function useHookWithFn<TArgs extends any[], TResult>(
    field: T,
    fn: (...args: TArgs) => TResult,
  ): (...args: TArgs) => TResult;
  function useHookWithFn<TArgs extends any[], TResult>(
    field: T,
    fn?: (...args: TArgs) => TResult,
  ): (...args: TArgs) => TResult | void;
  function useHookWithFn<TArgs extends any[], TResult>(
    field: T,
    fn?: (...args: TArgs) => TResult,
  ) {
    const hook = useHook(field);
    return useCallback(
      (...args: TArgs) => {
        hook();
        return fn && fn(...args);
      },
      [hook, fn],
    );
  }
  return useHookWithFn;
}
export const useOnFocus = withOptionalCallback(function useOnFocus(
  field: SingleField<any, any, any>,
) {
  return StoreHooks.useOnFocus(useFieldStore(field));
});
export const useOnBlur = withOptionalCallback(function useOnBlur(
  field: SingleField<any, any, any>,
) {
  return StoreHooks.useOnBlur(useFieldStore(field));
});

export function useLength(field: FieldList<any>) {
  return StoreHooks.useLength(useFieldStore(field));
}

export function useRawValue<T>(field: IField<T, any, any>) {
  return StoreHooks.useRawValue(useFieldStore(field));
}

export function useValidationResult<TValid, TError>(
  field: IField<any, TValid, TError>,
) {
  return StoreHooks.useValidationResult(useFieldStore(field));
}

export function useIsValid(field: IField<any, any, any>) {
  return StoreHooks.useIsValid(useFieldStore(field));
}

export function useIsValidating(field: IField<any, any, any>) {
  return StoreHooks.useIsValidating(useFieldStore(field));
}

export function useTouched(field: IField<any, any, any>) {
  return StoreHooks.useTouched(useFieldStore(field));
}

export function useDirty(field: IField<any, any, any>) {
  return StoreHooks.useDirty(useFieldStore(field));
}
