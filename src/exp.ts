'use strict';

export type TypeMapping = {
  Boolean: boolean,
  String: string,
  Number: number,
  Integer: number,
  ArrayOfString: Array<string>,
  JSON: any,
  SeparatedStrings: Array<string>,
}

export interface ElemType<T = any> {
  name: string,
  type: keyof TypeMapping,
  typeOverride?: T
}

export const asOptions = <K extends keyof any, T extends Array<{ name: K, type: keyof TypeMapping }>>(t: T) => t;

export type OptionsToType<T extends Array<ElemType>>
  = { [K in T[number]['name']]: TypeMapping[Extract<T[number], { name: K }>['type']] }


const typeOverride = <T>(v: ElemType): ElemType<T> => <ElemType<T>>v;

const v = asOptions([

  {name: 'foo', type: 'Boolean'},
  {name: 'bar', type: 'String'},

  typeOverride<string>({
    name: 'baz',
    type: 'JSON'
  })

]);

const opts = <OptionsToType<typeof v>>{foo: true, bar: 'ageage'};











