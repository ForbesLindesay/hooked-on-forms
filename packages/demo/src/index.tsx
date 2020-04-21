import * as React from 'react';
import {
  field,
  fieldGroup,
  fieldList,
  FormProvider,
  ok,
  fail,
} from 'hooked-on-forms';

const emailField = field<string>().validate((email) => {
  if (/.+@.+/.test(email)) return ok(email);
  else return fail(<p>Invalid e-mail address</p>);
});
const alternativeEmailField = emailField.clone();

const ageField = field<string>().validate((value) => {
  if (!/^\d+$/.test(value) || value.length > 5) {
    return fail('Invalid age. Expected an integer.');
  } else {
    return ok(parseInt(value, 10));
  }
});

export const dateTimeField = field<string>().validate((value) => {
  const result = new Date(value);
  if (isNaN(result.getTime())) {
    return fail('Invalid date time.');
  } else {
    return ok(result);
  }
});

const firstAddressLine = field<string>();
const secondAddressLine = field<string>();
const cityAddressLine = field<string>();
const postcodeAddressLine = field<string>();

const billingAddress = fieldGroup({
  firstAddressLine,
  secondAddressLine,
  cityAddressLine,
  postcodeAddressLine,
});
const shippingAddress = billingAddress.clone();

const userField = fieldGroup({
  email: emailField,
  alternativeEmail: alternativeEmailField,
  age: ageField,
  billingAddress,
  shippingAddress,
});

const userListField = fieldList(userField);

export default function UsersForm() {
  return (
    <FormProvider
      field={userListField}
      initialValue={() => []}
      onSubmit={async (data) => {
        const v: {email: string; age: number}[] = data;
        console.info(v);
      }}
    >
      {({handleSubmit, submitting, valid, dirty}) => (
        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            disabled={submitting || valid === false || !dirty}
          >
            Save
          </button>
        </form>
      )}
    </FormProvider>
  );
}
