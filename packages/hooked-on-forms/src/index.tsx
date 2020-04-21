import * as React from 'react';
import IField from './fields/IField';
import {Provider, useFieldStore, addField, createFormContext} from './Context';
import {useTouched, useIsValid, useDirty} from './hooks/store';
import {ValidationResult} from './Maybe';
import SingleField from './fields/SingleField';
import FieldGroup from './fields/FieldGroup';
import FieldList from './fields/FieldList';
import createBaseValidator from './validators/createBaseValidator';
import {subscribeValidationResult} from './stores/IStore';

export type {FieldList, FieldGroup, SingleField, IField};

export {ok, fail, Ok, Fail, Maybe, ValidationResult} from './Maybe';
export {
  useOnChange,
  useOnChangeValue,
  useLength,
  useRawValue,
  useValidationResult,
  useIsValid,
  useIsValidating,
  useTouched,
  useDirty,
} from './hooks/field';
export {
  withLength,
  withRawValue,
  withValidationResult,
} from './hooks/validation';

export function field<TData = unknown>() {
  return new SingleField<TData, TData, never>(createBaseValidator<TData>());
}
export function fieldGroup<
  TFields extends Record<string, IField<any, any, any>>
>(fields: TFields) {
  return new FieldGroup(fields);
}

export function fieldList<TElement extends IField<any, any, any>>(
  element: TElement,
) {
  return new FieldList(element);
}

export function FormProvider<TRaw, TValidated, TError>({
  children,
  field,
  initialValue,
  onSubmit,
}: {
  children: (props: RenderProps) => React.ReactNode;
  field: IField<TRaw, TValidated, TError>;
  initialValue: () => TRaw;
  onSubmit: (value: TValidated) => Promise<void>;
}) {
  const [submitting, setSubmitting] = React.useState(false);
  const [rootStore] = React.useState(() =>
    addField(createFormContext(), field, initialValue()),
  );
  const touched = useTouched(rootStore);
  const valid = useIsValid(rootStore);
  const dirty = useDirty(rootStore);
  const handleSubmit = React.useCallback(
    (e?: any) => {
      if (e && e.preventDefault) {
        e.preventDefault();
      }
      if (submitting) return;
      setSubmitting(true);
      rootStore.touch();
      rootStore.clearDirty();
      const rawValue = rootStore.getRawValue();
      const result = rootStore.getValidationResult();
      if (result.validating) {
        const unsubscribe = subscribeValidationResult(rootStore, () => {
          if (rawValue !== rootStore.getRawValue()) {
            unsubscribe();
            setSubmitting(false);
          } else {
            const validationResult = rootStore.getValidationResult();
            if (!validationResult.validating) {
              unsubscribe();
              void validated(validationResult);
            }
          }
        });
      } else {
        void validated(result);
      }
      async function validated(r: ValidationResult<TValidated, TError>) {
        try {
          if (r.ok) {
            await onSubmit(r.value);
          }
        } finally {
          setSubmitting(false);
        }
      }
    },
    [onSubmit, rootStore],
  );
  return (
    <Provider value={rootStore.context}>
      <FormRenderer
        touched={touched}
        valid={valid}
        dirty={dirty}
        submitting={submitting}
        handleSubmit={handleSubmit}
      >
        {children}
      </FormRenderer>
    </Provider>
  );
}

export function FieldGroupProvider({
  children,
  field,
}: {
  children: React.ReactNode;
  field: FieldGroup<any>;
}) {
  const store = useFieldStore(field);
  return (
    <Provider value={store.context}>
      <RenderChildren children={children} />
    </Provider>
  );
}
export function FieldListProvider({
  children,
  field,
}: {
  children: React.ReactNode;
  field: FieldList<any>;
}) {
  const store = useFieldStore(field);
  const [stores, setStores] = React.useState(store.getStores());
  React.useEffect(
    () => store.subscribeStores(() => setStores(store.getStores())),
    [store],
  );
  return (
    <>
      {stores.map((childStore) => (
        <Provider key={store.getKey(childStore)} value={childStore.context}>
          {children}
        </Provider>
      ))}
    </>
  );
}

export interface RenderProps {
  touched: boolean;
  valid: boolean | null;
  dirty: boolean;
  submitting: boolean;
  handleSubmit: (e?: any) => void;
}

const FormRenderer = React.memo(
  ({
    children,
    ...props
  }: RenderProps & {children: (props: RenderProps) => React.ReactNode}) => {
    return <>{children(props)}</>;
  },
);

const RenderChildren = React.memo(({children}: {children: React.ReactNode}) => {
  return <>{children}</>;
});
