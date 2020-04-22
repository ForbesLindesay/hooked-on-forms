import * as React from 'react';
import IField from './fields/IField';
import IStore from './stores/IStore';
import SingleField from './fields/SingleField';
import SingleFieldStore from './stores/SingleFieldStore';
import FieldGroup, {ExtractStoreFromFields} from './fields/FieldGroup';
import FieldGroupStore from './stores/FieldGroupStore';
import FieldListStore from './stores/FieldListStore';
import FieldList, {FieldRaw, FieldValid, FieldError} from './fields/FieldList';

const ReactContext = React.createContext<Context | undefined>(undefined);
export const Provider = ReactContext.Provider;

export function useFieldStore<TRaw, TValidated, TError>(
  field: SingleField<TRaw, TValidated, TError>,
): SingleFieldStore<TRaw, TValidated, TError>;
export function useFieldStore<
  TFields extends Record<string, IField<any, any, any>>
>(field: FieldGroup<TFields>): FieldGroupStore<ExtractStoreFromFields<TFields>>;
export function useFieldStore<TElement extends IField<any, any, any>>(
  field: FieldList<TElement>,
): FieldListStore<
  FieldRaw<TElement>,
  FieldValid<TElement>,
  FieldError<TElement>
>;
export function useFieldStore<TRaw, TValidated, TError>(
  field: IField<TRaw, TValidated, TError>,
): IStore<TRaw, TValidated, TError>;
export function useFieldStore<TRaw, TValidated, TError>(
  field: IField<TRaw, TValidated, TError>,
): IStore<TRaw, TValidated, TError> {
  const ctx = React.useContext(ReactContext);
  if (!ctx) {
    throw new Error('No form context defined');
  }
  return getStore(ctx, field);
}

type Context = {
  /**
   * The parent context if this is not the root context of the form
   */
  p: Context | undefined;
  /**
   * The field stores directly attached to this context
   */
  s: Map<IField<any, any, any>, IStore<any, any, any>>;
};
export default Context;

export function createFormContext(parent?: Context) {
  return {
    p: parent,
    s: new Map<IField<any, any, any>, IStore<any, any, any>>(),
  };
}

export function addField<TRaw, TValidated, TError>(
  ctx: Context,
  field: IField<TRaw, TValidated, TError>,
  initialValue: TRaw,
) {
  const store = field.getStore(initialValue, ctx);
  ctx.s.set(field, store);
  return store;
}

export function getStore<TRaw, TValidated, TError>(
  ctx: Context,
  field: SingleField<TRaw, TValidated, TError>,
): SingleFieldStore<TRaw, TValidated, TError>;
export function getStore<TFields extends Record<string, IField<any, any, any>>>(
  ctx: Context,
  field: FieldGroup<TFields>,
): FieldGroupStore<ExtractStoreFromFields<TFields>>;
export function getStore<TElement extends IField<any, any, any>>(
  ctx: Context,
  field: FieldList<TElement>,
): FieldListStore<
  FieldRaw<TElement>,
  FieldValid<TElement>,
  FieldError<TElement>
>;
export function getStore<TRaw, TValidated, TError>(
  ctx: Context,
  field: IField<TRaw, TValidated, TError>,
): IStore<TRaw, TValidated, TError>;
export function getStore<TRaw, TValidated, TError>(
  {s, p}: Context,
  field: IField<TRaw, TValidated, TError>,
): IStore<TRaw, TValidated, TError> {
  const result = s.get(field);
  if (!result) {
    if (p) return getStore(p, field);
    throw new Error('Missing store for this field');
  }
  return result;
}
