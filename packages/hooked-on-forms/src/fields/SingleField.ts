import {createSingleFieldStore} from '../stores/SingleFieldStore';
import IField from './IField';
import Context from '../Context';
import CancellationToken from '../CancellationToken';
import {Maybe, Ok} from '../Maybe';
import IValidator from '../validators/IValidator';
import createDerivedValidator from '../validators/createDerivedValidator';
import createDebounceValidator from '../validators/createDebounceValidator';

export default class SingleField<TRaw, TValidated, TError>
  implements IField<TRaw, TValidated, TError> {
  private readonly _validator: IValidator<TRaw, TValidated, TError>;
  constructor(validator: IValidator<TRaw, TValidated, TError>) {
    this._validator = validator;
  }
  public validate<SValidated>(
    parse: (
      value: TValidated,
      token: CancellationToken,
    ) => Ok<SValidated> | Promise<Ok<SValidated>>,
  ): SingleField<TRaw, SValidated, TError>;

  public validate<SValidated, SError>(
    parse: (
      value: TValidated,
      token: CancellationToken,
    ) => Maybe<SValidated, SError> | Promise<Maybe<SValidated, SError>>,
  ): SingleField<TRaw, SValidated, TError | SError>;
  public validate<SValidated, SError>(
    parse: (
      value: TValidated,
      token: CancellationToken,
    ) => Maybe<SValidated, SError> | Promise<Maybe<SValidated, SError>>,
  ): SingleField<TRaw, SValidated, TError | SError> {
    return new SingleField<TRaw, SValidated, TError | SError>(
      createDerivedValidator(this._validator, parse),
    );
  }

  public debounce(debounceMs: number): SingleField<TRaw, TValidated, TError> {
    return new SingleField<TRaw, TValidated, TError>(
      createDebounceValidator(this._validator, debounceMs),
    );
  }

  public getStore(initialValue: TRaw, context: Context) {
    return createSingleFieldStore(
      initialValue,
      this._validator(context),
      context,
    );
  }
  public clone() {
    return new SingleField<TRaw, TValidated, TError>(this._validator);
  }
}
