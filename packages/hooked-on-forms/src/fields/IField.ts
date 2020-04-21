import IStore from '../stores/IStore';
import Context from '../Context';

export default interface IField<TRaw, TValidated, TError> {
  getStore(
    initialValue: TRaw,
    context: Context,
  ): IStore<TRaw, TValidated, TError>;
  clone(): IField<TRaw, TValidated, TError>;
}
