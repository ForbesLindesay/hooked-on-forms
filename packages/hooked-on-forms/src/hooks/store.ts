import {useState, useEffect, useCallback} from 'react';
import IStore, {
  subscribeRawValue,
  subscribeValidationResult,
  subscribeTouched,
  subscribeDirty,
} from '../stores/IStore';
import SingleFieldStore from '../stores/SingleFieldStore';
import FieldListStore from '../stores/FieldListStore';

export function useOnChange<TRaw>(store: SingleFieldStore<TRaw, any, any>) {
  return useCallback(
    (e: {target: {value: TRaw}}) => store.setRawValueFromEvent(e),
    [],
  );
}
export function useOnChangeValue<TRaw>(
  store: SingleFieldStore<TRaw, any, any>,
) {
  return useCallback(
    (value: TRaw | ((oldValue: TRaw) => TRaw)) => store.setRawValue(value),
    [],
  );
}
export function useLength(store: FieldListStore<any, any, any>) {
  const [length, setLength] = useState(store.getRawValue().length);
  useEffect(() => {
    return subscribeRawValue(store, () => {
      const newLength = store.getRawValue().length;
      if (newLength !== length) {
        setLength(newLength);
      }
    });
  }, [store]);
  return length;
}

export function useRawValue<T>(store: IStore<T, any, any>) {
  const [rawValue, setRawValue] = useState(store.getRawValue());
  useEffect(() => {
    return subscribeRawValue(store, () => {
      const newValue = store.getRawValue();
      if (newValue !== rawValue) {
        setRawValue(newValue);
      }
    });
  }, [store]);
  return rawValue;
}

export function useValidationResult<TValid, TError>(
  store: IStore<any, TValid, TError>,
) {
  const [validationResult, setValidationResult] = useState(
    store.getValidationResult(),
  );
  useEffect(() => {
    return subscribeValidationResult(store, () => {
      const newValue = store.getValidationResult();
      if (newValue !== validationResult) {
        setValidationResult(newValue);
      }
    });
  }, [store]);
  return validationResult;
}

export function useIsValid(store: IStore<any, any, any>) {
  const [isValid, setIsValid] = useState(store.getValidationResult().ok);
  useEffect(() => {
    return subscribeValidationResult(store, () => {
      const newIsValid = store.getValidationResult().ok;
      if (newIsValid !== isValid) {
        setIsValid(newIsValid);
      }
    });
  }, [store]);
  return isValid;
}

export function useIsValidating(store: IStore<any, any, any>) {
  const [isValidating, setIsValidating] = useState(
    store.getValidationResult().validating,
  );
  useEffect(() => {
    return subscribeValidationResult(store, () => {
      const newIsValidating = store.getValidationResult().validating;
      if (newIsValidating !== isValidating) {
        setIsValidating(newIsValidating);
      }
    });
  }, [store]);
  return isValidating;
}

export function useTouched(store: IStore<any, any, any>) {
  const [touched, setTouched] = useState(store.getTouched());
  useEffect(() => {
    return subscribeTouched(store, () => {
      const newTouched = store.getTouched();
      if (newTouched !== touched) {
        setTouched(newTouched);
      }
    });
  }, [store]);
  return touched;
}

export function useDirty(store: IStore<any, any, any>) {
  const [dirty, setDirty] = useState(store.getDirty());
  useEffect(() => {
    return subscribeDirty(store, () => {
      const newDirty = store.getDirty();
      if (newDirty !== dirty) {
        setDirty(newDirty);
      }
    });
  }, [store]);
  return dirty;
}
