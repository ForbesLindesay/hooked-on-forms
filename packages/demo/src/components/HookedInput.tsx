import React from 'react';
import {
  useRawValue,
  useOnChange,
  SingleField,
  useIsValid,
  useTouched,
  useOnFocus,
  useOnBlur,
  useSubmitting,
} from 'hooked-on-forms';
import HookedValidationError from './HookedValidationError';

export default function HookedInput({
  field,
  label,
  ...otherProps
}: Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'className' | 'value' | 'onChange'
> & {
  field: SingleField<string, any, React.ReactNode>;
  label: string;
}) {
  const value = useRawValue(field);
  const onChange = useOnChange(field);
  const onFocus = useOnFocus(field, otherProps.onFocus);
  const onBlur = useOnBlur(field, otherProps.onBlur);
  const submitting = useSubmitting();

  const touched = useTouched(field);
  const hasError = useIsValid(field) === false;
  return (
    <label className="block">
      <div className="text-sm leading-5 font-medium text-gray-700">{label}</div>
      <div
        className={`form-input shadow-outline:focus mt-1 relative rounded-md shadow-sm flex max-w-xl flex${
          touched && hasError ? ' border-red-400' : ''
        }${otherProps.disabled || submitting ? ' bg-gray-400' : ''}`}
      >
        <input
          {...otherProps}
          disabled={otherProps.disabled || submitting}
          className="outline-none block w-full bg-transparent sm:text-sm sm:leading-5"
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>
      <HookedValidationError field={field} />
    </label>
  );
}
