'use strict';

// https://stackoverflow.com/questions/29775830/how-to-implement-a-typescript-decorator

export const r2gSmokeTest = function () {
  // r2g command line app uses this exported function
  return true;
};

export enum ParseType {
  single,
  id,
  alt
}

type TypeMapping = {
  Boolean: boolean,
  String: string,
  Number: number,
  ArrayOfString: Array<string>,
  
  // any other types
}


export enum Type {
  Boolean = 'Boolean',
  String = 'String',
  Number = 'Number',
  ArrayOfString = 'ArrayOfString',
  ArrayOfBoolean = 'ArrayOfBoolean',
  Integer = 'Integer',
  ArrayOfInteger = 'ArrayOfInteger',
  JSON = 'JSON',
  CommaSeparatedString = 'CommaSeparatedString',
  ColonSeparatedString = 'ColonSeparatedString'
}

// const asOptions = <K extends keyof any, T extends Array<{ name: K, type: keyof TypeMapping }>>(t: T) => t;
//
//
// type OptionsToType<T extends Array<{ name: keyof any, type: keyof TypeMapping }>>
//   = { [K in T[number]['name']]: TypeMapping[Extract<T[number], { name: K }>['type']] }


export interface ElemType {
  name: Array<string>,
  type: keyof TypeMapping
}


export const asOptions = <K extends Array<string>, T extends Array<{ name: K, type: keyof TypeMapping }>>(t: T) => t;

export type OptionsToType<T extends Array<ElemType>>
  = { [K in T[number]['name'][0]]: TypeMapping[Extract<T[number], { name: K }>['type']] }

export interface Name {
   [key: string]: ParseType
}

export interface Option {
  names: Name,
  type: Type,
  help?: string
}

export class CliParser<T extends Array<ElemType>> {
  
  options: T;
  opts: OptionsToType<T>;
  
  constructor(o: T) {
    this.options = o;
  }
  
  addOption(v: Option) {
    this.opts = Object.assign(this.opts, v.names);
    return this;
  }
  
  getOpts(){
    return this.opts;
  }
  
}

const p = new CliParser([]).addOption({
  names: {foo: ParseType.id, 'foo-bar': ParseType.id},
  type: Type.ArrayOfBoolean
});




const v= p.getOpts();

v.foo = 5;
