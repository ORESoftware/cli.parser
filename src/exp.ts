'use strict';

interface Elem<T = any> {
  name: string,
  type: string,
  typeOverride?: T
}

interface JSON {

}

const typeOverride = <T>(v: Elem): Elem<T> => <Elem<T>>v;

const v: Array<Elem> = [
  
  {name: 'foo', type: 'Boolean'},
  
  {name: 'bar', type: 'String'},
  
  typeOverride<string>({
    name: 'baz',
    type: 'JSON'
  })
  
];






