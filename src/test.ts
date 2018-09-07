import {getTable} from './table';
import {asOptions, CliParser, Type, ElemType} from './index';

const typeOverride = <T>(v: ElemType) => <ElemType<T>>v;

const options = asOptions([
  {
    name: 'aaa',
    short: 'a',
    type: Type.Boolean
  },
  
  {
    name: 'zoomBar',
    short: 'z',
    type: Type.String
  },
  
  {
    name: 'foo',
    short: 'f',
    type: Type.String
  },
  
  
  {
    name: 'bbb',
    short: 'b',
    type: Type.ArrayOfBoolean
  },
  
  {
    name: 'ccC',
    short: 'c',
    type: Type.SeparatedStrings,
    separator: ','
  },
  
  {
    name: 'Tall',
    short: 'T',
    type: Type.ArrayOfBoolean,
    help: 'This is how we do it, friday night and I feel alright.'
  },
  
 {
    name: 'dog',
    short: 'x',
    type: Type.ArrayOfString
  }

]);

const p = new CliParser(options);

const {opts, values} = p.parse();



console.log('opts:', opts);
console.log('values:', values);


