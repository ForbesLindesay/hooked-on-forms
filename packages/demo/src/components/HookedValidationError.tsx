import React from 'react';
import {useValidationResult, IField, useTouched} from 'hooked-on-forms';

const HookedValidationError = React.memo(
  ({field}: {field: IField<any, any, React.ReactNode>}) => {
    const isTouched = useTouched(field);
    const validationResult = useValidationResult(field);
    return (
      <label>
        <div
          className={`h-10 ${
            validationResult.validating ? `text-gray-500` : `text-red-700`
          }`}
          style={{
            opacity:
              (!validationResult.validating && validationResult.ok) ||
              !isTouched
                ? 0
                : 1,
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
  },
);
export default HookedValidationError;
