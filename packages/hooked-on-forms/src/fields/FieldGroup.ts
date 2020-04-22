import {createFieldGroupStore} from '../stores/FieldGroupStore';
import IField from './IField';
import Context, {createFormContext, addField} from '../Context';
import IStore from '../stores/IStore';

type ExtractRawValues<T> = {
  [key in keyof T]: T[key] extends IField<infer TRaw, any, any> ? TRaw : never;
};
type ExtractValidatedValues<T> = {
  [key in keyof T]: T[key] extends IField<any, infer TValid, any>
    ? TValid
    : never;
};
type ExtractErrorValues<T> = {
  [key in keyof T]: T[key] extends IField<any, any, infer TError>
    ? TError
    : never;
}[keyof T];

export type ExtractStoreFromFields<T> = {
  [key in keyof T]: T[key] extends IField<
    infer TRaw,
    infer TValid,
    infer TError
  >
    ? IStore<TRaw, TValid, TError>
    : never;
};

export default class FieldGroup<
  TFields extends Readonly<Record<string, IField<any, any, any>>>
>
  implements
    IField<
      ExtractRawValues<TFields>,
      ExtractValidatedValues<TFields>,
      ExtractErrorValues<TFields>
    > {
  private readonly _fields: readonly {
    readonly name: string;
    readonly field: IField<any, any, any>;
  }[];

  public readonly fields: Readonly<TFields>;
  constructor(fields: TFields) {
    this.fields = fields;
    this._fields = Object.entries(fields).map(([name, field]) => ({
      name,
      field,
    }));
  }

  public getStore(initialValue: ExtractRawValues<TFields>, context: Context) {
    const childContext = createFormContext(context);
    const results: any = {};
    for (const {name, field} of this._fields) {
      results[name] = addField(childContext, field, initialValue[name]);
    }
    return (createFieldGroupStore<ExtractStoreFromFields<TFields>>(
      results,
      childContext,
    ) as unknown) as IStore<
      ExtractRawValues<TFields>,
      ExtractValidatedValues<TFields>,
      ExtractErrorValues<TFields>
    >;
  }

  public clone() {
    return new FieldGroup<TFields>(this.fields);
  }
}
