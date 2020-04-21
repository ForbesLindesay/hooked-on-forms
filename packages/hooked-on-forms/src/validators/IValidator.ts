import IValidatorStore from './IValidatorStore';
import Context from '../Context';

type IValidator<TRaw, TValid, TError> = (
  context: Context,
) => IValidatorStore<TRaw, TValid, TError>;
export default IValidator;
