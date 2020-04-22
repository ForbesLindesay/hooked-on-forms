import * as React from 'react';
import {action} from '@storybook/addon-actions';
import {
  field,
  ok,
  fail,
  withValidationResult,
  fieldGroup,
  FormProvider,
} from 'hooked-on-forms';
import HookedInput from './components/HookedInput';

export default {title: 'examples/UserRegistration'};

export const Default = () => {
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
  });

  return (
    <FormProvider
      field={registrationForm}
      initialValue={() => ({
        username: '',
        password: '',
        passwordConfirmation: '',
      })}
      onSubmit={async (obj) => {
        action('submit')(obj);
        // simulate a slow server
        await new Promise((r) => setTimeout(r, 4000));
      }}
    >
      {({handleSubmit, submitting}) => (
        <form className="m-4" onSubmit={handleSubmit}>
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
          <span className="shadow-sm rounded-md">
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white focus:outline-none focus:shadow-outline-indigo focus:border-indigo-700 active:bg-indigo-700 transition duration-150 ease-in-out${
                submitting
                  ? ` bg-gray-500`
                  : ` bg-indigo-600 hover:bg-indigo-500`
              }`}
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                {submitting ? (
                  <circle
                    cx="10"
                    cy="10"
                    r="7"
                    fill="none"
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    strokeWidth="2"
                    stroke="currentColor"
                  />
                ) : (
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                )}
              </svg>
              Create Account
            </button>
          </span>
        </form>
      )}
    </FormProvider>
  );
};
