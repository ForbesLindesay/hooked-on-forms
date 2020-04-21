import CancellationToken from '../CancellationToken';
import {Maybe} from '../Maybe';

export default interface IValidatorStore<TRaw, TValid, TError> {
  subscribe(fn: () => void): () => void;

  validate(
    value: TRaw,
    token: CancellationToken,
  ): Maybe<TValid, TError> | Promise<Maybe<TValid, TError>>;
}
