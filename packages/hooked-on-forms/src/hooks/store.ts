import {useState, useEffect, useCallback, useRef} from 'react';
import IStore, {
  subscribeRawValue,
  subscribeValidationResult,
  subscribeTouched,
  subscribeDirty,
} from '../stores/IStore';
import SingleFieldStore from '../stores/SingleFieldStore';
import FieldListStore from '../stores/FieldListStore';
import {subscribe} from '../SubscriptionHandler';

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
export function useOnFocus(store: SingleFieldStore<any, any, any>) {
  return useCallback(() => store.focus(), []);
}
export function useOnBlur(store: SingleFieldStore<any, any, any>) {
  return useCallback(() => store.blur(), []);
}
export function useFocused(store: SingleFieldStore<any, any, any>) {
  const lastValue = useRef(store.getFocused());
  const [focused, setFocused] = useState(lastValue.current);
  useEffect(() => {
    return subscribe(store.focusedSubscription, () => {
      const newFocused = store.getFocused();
      if (newFocused !== lastValue.current) {
        setFocused(newFocused);
        lastValue.current = newFocused;
      }
    });
  }, [store, lastValue]);
  return focused;
}
export function useLength(store: FieldListStore<any, any, any>) {
  const lastValue = useRef(store.getRawValue().length);
  const [length, setLength] = useState(lastValue.current);
  useEffect(() => {
    return subscribeRawValue(store, () => {
      const newLength = store.getRawValue().length;
      if (newLength !== lastValue.current) {
        setLength(newLength);
        lastValue.current = newLength;
      }
    });
  }, [store, lastValue]);
  return length;
}

export function useRawValue<T>(store: IStore<T, any, any>) {
  const lastValue = useRef(store.getRawValue());
  const [rawValue, setRawValue] = useState(lastValue.current);
  useEffect(() => {
    return subscribeRawValue(store, () => {
      const newValue = store.getRawValue();
      if (newValue !== lastValue.current) {
        setRawValue(newValue);
        lastValue.current = newValue;
      }
    });
  }, [store, lastValue]);
  return rawValue;
}

export function useValidationResult<TValid, TError>(
  store: IStore<any, TValid, TError>,
) {
  const lastValue = useRef(store.getValidationResult());
  const [validationResult, setValidationResult] = useState(lastValue.current);
  useEffect(() => {
    return subscribeValidationResult(store, () => {
      const newValue = store.getValidationResult();
      if (newValue !== lastValue.current) {
        setValidationResult(newValue);
        lastValue.current = validationResult;
      }
    });
  }, [store, lastValue]);
  return validationResult;
}

export function useIsValid(store: IStore<any, any, any>) {
  const lastValue = useRef(store.getValidationResult().ok);
  const [isValid, setIsValid] = useState(lastValue.current);
  useEffect(() => {
    return subscribeValidationResult(store, () => {
      const newIsValid = store.getValidationResult().ok;
      if (newIsValid !== lastValue.current) {
        setIsValid(newIsValid);
        lastValue.current = newIsValid;
      }
    });
  }, [store, lastValue]);
  return isValid;
}

export function useIsValidating(store: IStore<any, any, any>) {
  const lastValue = useRef(store.getValidationResult().validating);
  const [isValidating, setIsValidating] = useState(lastValue.current);
  useEffect(() => {
    return subscribeValidationResult(store, () => {
      const newIsValidating = store.getValidationResult().validating;
      if (newIsValidating !== lastValue.current) {
        setIsValidating(newIsValidating);
        lastValue.current = newIsValidating;
      }
    });
  }, [store, lastValue]);
  return isValidating;
}

export function useTouched(store: IStore<any, any, any>) {
  const lastValue = useRef(store.getTouched());
  const [touched, setTouched] = useState(lastValue.current);
  useEffect(() => {
    return subscribeTouched(store, () => {
      const newTouched = store.getTouched();
      if (newTouched !== lastValue.current) {
        setTouched(newTouched);
        lastValue.current = newTouched;
      }
    });
  }, [store, lastValue]);
  return touched;
}

export function useDirty(store: IStore<any, any, any>) {
  const lastValue = useRef(store.getDirty());
  const [dirty, setDirty] = useState(lastValue.current);
  useEffect(() => {
    return subscribeDirty(store, () => {
      const newDirty = store.getDirty();
      if (newDirty !== lastValue.current) {
        setDirty(newDirty);
        lastValue.current = newDirty;
      }
    });
  }, [store, lastValue]);
  return dirty;
}
