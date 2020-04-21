import IField from '../fields/IField';
import FieldList from '../fields/FieldList';
import IStore, {
  subscribeRawValue,
  subscribeValidationResult,
} from '../stores/IStore';
import Context, {getStore} from '../Context';

const enum DependencyKey {
  ListLength,
  RawValue,
  ValidationResult,
}
export type {DependencyKey};

interface ValidationContext {
  ctx: Context;
  onDependency: (field: IStore<any, any, any>, key: DependencyKey) => void;
  fire?: () => void;
}
let validationContext: ValidationContext | undefined;
export function withContext<T>(vc: ValidationContext, fn: () => T): T {
  validationContext = vc;
  try {
    return fn();
  } finally {
    validationContext = undefined;
  }
}
function getContext() {
  if (!validationContext) {
    throw new Error(
      'You can only read dependencies using "with" at the start of validation functions.',
    );
  }
  return validationContext;
}

export function withLength(field: FieldList<any>) {
  const {ctx, onDependency, fire} = getContext();
  const store = getStore(ctx, field);
  onDependency(store, DependencyKey.ListLength);
  if (fire) {
    let lastLength = store.getRawValue().length;
    subscribeRawValue(store, () => {
      const newLength = store.getRawValue().length;
      if (lastLength !== newLength) {
        lastLength = newLength;
        fire();
      }
    });
  }
  return store.getRawValue().length;
}

export function withRawValue<T>(field: IField<T, any, any>) {
  const {ctx, onDependency, fire} = getContext();
  const store = getStore(ctx, field);
  onDependency(store, DependencyKey.RawValue);
  if (fire) {
    subscribeRawValue(store, () => fire());
  }
  return store.getRawValue();
}

export function withValidationResult<TValid, TError>(
  field: IField<any, TValid, TError>,
) {
  const {ctx, onDependency, fire} = getContext();
  const store = getStore(ctx, field);
  onDependency(store, DependencyKey.ValidationResult);
  if (fire) {
    subscribeValidationResult(store, () => fire());
  }
  return store.getValidationResult();
}
