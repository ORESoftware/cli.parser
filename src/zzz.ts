
type TypeMapping = {
  Boolean: boolean,
  String: string,
  Number: number,
  Integer: number,
}

export enum Type {
  Boolean = 'Boolean',
  String = 'String',
  Number = 'Number',
  Integer = 'Integer',
}

export interface ElemType {
  name: string,
  type: keyof TypeMapping,
}

export const asOptions = <K extends keyof any, T extends Array<{ name: K, type: keyof TypeMapping }>>(t: T) => t;

export type OptionsToType<T extends Array<ElemType>> = { [K in T[number]['name']]: TypeMapping[Extract<T[number], { name: K }>['type']] }
  
  
export class Foo<T extends Array<ElemType>> {
  
  bar: T;
  baz: OptionsToType<T>;
  
  constructor(t: T){
    this.bar = t;
  }
  
  add(t: ElemType){
    this.bar.push(t);
  }
  
}


const list = asOptions([{name: 'xxx', type: Type.Boolean}]);

const f = new Foo(list);

f.baz.xxx = false; // compiles

f.add({name: 'uuu', type: Type.String});

// f.baz.uuu = 'z';







