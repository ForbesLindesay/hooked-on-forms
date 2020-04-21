import IField from '../fields/IField';
import SingleField from '../fields/SingleField';
import FieldList from '../fields/FieldList';
import {useFieldStore} from '../Context';

import * as StoreHooks from './store';

export function useOnChange<TRaw>(field: SingleField<TRaw, any, any>) {
  return StoreHooks.useOnChange(useFieldStore(field));
}

export function useOnChangeValue<TRaw>(field: SingleField<TRaw, any, any>) {
  return StoreHooks.useOnChangeValue(useFieldStore(field));
}

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
