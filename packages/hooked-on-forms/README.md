# hooked-on-forms

Lightweight forms library for React.

- Less than 3.8KB (minified + gzipped)
- Complete type safety (even for your form state)
- Only components that need updates re-render (making your forms fast)

## Motivation

All the existing forms libraries make it really difficult to write type safe code. Many of them also make it very easy to accidentally write forms where the entire form needs to re-render on every key press.

The core principals of hooked-on-forms are:

1. Validation and Parsing are the same thing - This allows proper type safety, because when you write a validation function you are really writing a parser, you can "validate" that the string entered by the user is a number, and parse it into a number, in one go.
2. Use hooks to load minimal state - All requesting of state inside your form is done via hooks. You can only hook into atomic parts of the state, so it's hard to accidentally subscribe to the entire form state.

## Concepts

- `IField<TRaw, TValidated, TError>` - a container for a value in a form. This could be an individual field, or a list or group of fields. `TRaw` is the type of the value in the form state, i.e. the value being edited. `TValidated` is the type of the value after it's been validated successfully. `TError` is the type of the error if validation fails, e.g. `string` or `ReactNode`.
- `SingleField<TRaw, TValidated, TError>` - the basic building blocks of forms. These are the individual fields and their values can be set and read.
- `FieldGroup` - typically used for the top level of the form, this represents a group of named fields.
- `FieldList` - used for repeating blocks that can be added to/removed from. The elements in the list are also `Field`s so you can nest groups, and lists however you see fit.

## Installation

```
yarn add hooked-on-forms
```

## Usage Example

For more examples, see [the demos directory](packages/demo/src)

```tsx
function HookedInput({
  field,
  label,
  ...otherProps
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
  field: SingleField<string, any, React.ReactNode>;
  label: string;
}) {
  const value = useRawValue(field);
  const onChange = useOnChange(field);
  const onFocus = useOnFocus(field, otherProps.onFocus);
  const onBlur = useOnBlur(field, otherProps.onBlur);
  const submitting = useSubmitting();
  return (
    <label>
      <div>{label}</div>
      <input
        {...otherProps}
        disabled={otherProps.disabled || submitting}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <HookedValidationError field={field} />
    </label>
  );
}

function HookedValidationError({
  field,
}: {
  field: IField<any, any, React.ReactNode>;
}) {
  const isTouched = useTouched(field);
  const validationResult = useValidationResult(field);
  const showError =
    validationResult.validating || !validationResult.ok || isTouched;

  return (
    <label>
      <div
        className="error"
        style={{
          opacity: showError ? 1 : 0,
        }}
      >
        {validationResult.validating
          ? 'Validating...'
          : validationResult.ok || !isTouched
          ? ''
          : validationResult.value}
      </div>
    </label>
  );
}

const passwordField = field<string>().validate((value) => {
  if (value.length < 10) {
    return fail('Your password must be at least 10 characters long.');
  }
  return ok(value);
});

const registrationForm = fieldGroup({
  username: field<string>()
    .validate((value) => {
      // we can quickly check things like length before we debounce
      // or go to the backend
      if (value.length < 5) {
        return fail('Your username must be at least 5 characters');
      }
      return ok(value);
    })
    .debounce(800)
    .validate(async (value) => {
      action('validating')(value);
      // simulate the time taken to update
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (value === 'forbeslindesay') {
        return fail('This username is already taken, please try another');
      } else {
        return ok(value);
      }
    }),
  password: passwordField,
  passwordConfirmation: passwordField.validate((value) => {
    const password = withValidationResult(passwordField);
    if (!password.ok || password.value === value) return ok(value);
    return fail('You must enter the same password twice');
  }),
  dob: field<string>().validate((value) => {
    const isoDate = parseDate(value);
    if (isoDate) return ok(isoDate);
    else fail('You must enter a valid date');
  }),
  favouriteNumber: field<string>().validate((value) => {
    const parsed = /^[0-9]+/.test(value) && parseInt(value, 10);
    if (parsed > 1 && parsed < 10) return ok(parsed);
    else
      fail('Your favourite number should be a whole number between 1 and 10');
  }),
});

interface Data {
  username: string;
  password: string;
  passwordConfirmation: string;
  dob: string; // guaranteed to be in ISO 8601 format
  favouriteNumber: number; // guaranteed to be between 1 and 10
}
function RegistrationForm({
  onSubmit,
}: {
  onSubmit: (data: Data) => Promise<void>;
}) {
  return (
    <FormProvider
      field={registrationForm}
      initialValue={() => ({
        username: '',
        password: '',
        passwordConfirmation: '',

        // N.B. here we are using the form state, so these
        // are strings, even though when they are submitted
        // they will be ISO dates and integers.
        dob: '',
        favouriteNumber: '',
      })}
      onSubmit={onSubmit}
    >
      {({handleSubmit, submitting}) => (
        <form onSubmit={handleSubmit}>
          <HookedInput
            name="username"
            label="Username"
            field={registrationForm.fields.username}
          />
          <HookedInput
            name="password"
            type="password"
            label="Password"
            field={registrationForm.fields.password}
          />
          <HookedInput
            name="password-confirmation"
            type="password"
            label="Password (confirmation)"
            field={registrationForm.fields.passwordConfirmation}
          />
          <HookedInput
            name="dob"
            type="text"
            label="Date of Birth"
            field={registrationForm.fields.dob}
          />
          <HookedInput
            name="favouriteNum"
            type="text"
            inputMode="numeric"
            label="Favourite Number (1 - 10)"
            field={registrationForm.fields.favouriteNumber}
          />
          <button type="submit" disabled={submitting}>
            Create Account
          </button>
        </form>
      )}
    </FormProvider>
  );
}
```

## API

### `IField<TRaw, TValidated, TError>`

An `IField` is the representation of a value or group of values in hooked-on-forms. It has three type parameters:

- `TRaw` - this is the value that the field has within the form
- `TValidated` - this is the value that the field has after it's been validated successfully
- `TError` - this is the type of the error if validation fails

#### IField.clone()

If you want to use the same Field configuration in multiple parts of a form, e.g. if you have multiple date inputs, you can use the `.clone()` function:

```ts
import {field} from 'hooked-on-forms';

const dateTimeField = field<string>().validate((value) => {
  const result = new Date(value);
  if (isNaN(result.getTime())) {
    return fail('Please enter a valid date time.');
  } else {
    return ok(result);
  }
});

const eventField = fieldGroup({
  name: field<string>(),
  startTime: dateTimeField.clone(),
  endTime: dateTimeField.clone(),
});
```

### Single Field

You can create a simple field containing a single value via:

```ts
import {field} from 'hooked-on-forms';

const textField = field<string>();
```

The type parameter is the type of the form state, not the parsed state that will be sent to the server.

#### useRawValue(IField) and useOnChange(SingleField) / useOnChangeValue(SingleField)

These hooks return an `onChange` callback that sets the value.

For builtin inputs `useOnChange` returns a callback that expects an event:

```tsx
import {SingleField, useOnChange} from 'hooked-on-forms';

function HookedTextInput(props: {field: SingleField<string, any, any>}) {
  const value = useRawValue(props.field);
  const onChange = useOnChange(props.field);

  return <input value={value} onChange={onChange} />;
}
```

For custom inputs, the `useOnChangeValue` is easier to use as it expects to be directly passed the value:

```tsx
import {SingleField, useOnChangeValue} from 'hooked-on-forms';

function HookedCustomTextInput(props: {field: SingleField<string, any, any>}) {
  const value = useRawValue(props.field);
  const onChange = useOnChangeValue(props.field);

  return <CustomTextInput value={value} onChange={onChange} />;
}

function CustomTextInput(props: {
  value: string;
  onChange(value: string): void;
}) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />;
}
```

#### SingleField.validate

To add validation to a single field, call `.validate`. This returns a new field.

```ts
import {ok, fail} from 'hooked-on-forms';

const integerField = textField.validate((value) => {
  if (/^[0-9]+$/.test(value)) {
    return ok(parseInt(value, 10));
  } else {
    // N.B. errors can be any type you like, they don't
    // have to be strings. They are automatically strongly
    // typed
    return fail('Please enter a valid integer');
  }
});
```

If you need to compare two fields, you can also do so here:

```ts
import {ok, fail, withValidationResult} from 'hooked-on-forms';

// cloning a field lets you re-use it, with a different name
const passwordField = textField.clone();

const passwordConfirmationField = passwordField.validate((value) => {
  const passwordValue = withValidationResult(passwordField);

  // if there is a validation error in the password field,
  // don't display an error in the password confirmation field
  if (!passwordValue.ok) return ok(value);

  if (passwordValue.value === value) {
    return ok(value);
  } else {
    return fail('Passwords must match');
  }
});
```

#### SingleField.debounce

Your validation can also be async, just by returning a promise. If you're doing this, it's wise to also debounce the validation so it doesn't run on every key press.

```ts
import {ok, fail} from 'hooked-on-forms';

const usernameField = textField.debounce(800).validate(async (value) => {
  const isAvailable = await isUsernameAvailable(value);

  if (isAvailable) {
    return ok(value);
  } else {
    return fail('This username is already taken.');
  }
});
```

If your async function is fast cheap enough to run, you don't have to debounce, it's just often a good idea.
