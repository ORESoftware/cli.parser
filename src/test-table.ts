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
    separator: ',',
    help: 'dogt cat cat   cat dog dog dog cat cat cat   cat dog dog dog cat cat cat   cat  dog cat cat cat   cat dog'
  },
  
  {
    name: 'Tall',
    short: 'T',
    type: Type.ArrayOfBoolean,
    env: 'dart',
    help: 'This is how we do it, friday night and I feel alright. This is how we do it, friday, \n night and I feel alright.'
  },
  
  
  {
    name: 'dog',
    short: 'x',
    type: Type.JSON,
  }

]);

const p = new CliParser(options);

console.log(p.getHelpString());

