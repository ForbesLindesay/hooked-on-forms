import IField from './IField';
import Context from '../Context';
import {createFieldListStore} from '../stores/FieldListStore';

export type FieldRaw<T> = T extends IField<infer TRaw, any, any>
  ? TRaw
  : unknown;
export type FieldValid<T> = T extends IField<any, infer TValid, any>
  ? TValid
  : unknown;
export type FieldError<T> = T extends IField<any, any, infer TError>
  ? TError
  : unknown;

export default class FieldList<TElement extends IField<any, any, any>>
  implements
    IField<FieldRaw<TElement>[], FieldValid<TElement>[], FieldError<TElement>> {
  public readonly element: TElement;
  constructor(element: TElement) {
    this.element = element;
  }

  public getStore(initialValue: FieldRaw<TElement>[], context: Context) {
    return createFieldListStore<
      FieldRaw<TElement>,
      FieldValid<TElement>,
      FieldError<TElement>
    >(this.element, initialValue, context);
  }

  public clone() {
    return new FieldList(this.element);
  }
}
