import {getTable} from './table';
import {asOptions, CliParser, Type} from './index';

const options = asOptions([
  {
    name: 'aaa',
    short: 'a',
    type: Type.Boolean
  },
  
  {
    name: 'zoomBar',
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
    type: Type.String
  }

]);

const p = new CliParser(options);

const {opts, values} = p.parse();

console.log('opts:', opts);
console.log('values:', values);


