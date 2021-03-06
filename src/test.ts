'use strict';

import {getTable} from './table';
import {asOptions, CliParser, Type, ElemType} from './main';

const typeOverride = <T>(v: ElemType<any>) => <ElemType<T>>v;

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
    name: 'N',
    short: 'n',
    type: Type.ArrayOfNumber,
    help: 'This is how we do it, friday night and I feel alright.'
  },

 {
    name: 'dog',
    short: 'x',
    type: 'ArrayOfString'
  }

]);

const p = new CliParser(options);

const {opts, values, groups, order} = p.parse(process.argv);


console.log('order:', order);
console.log('groups:', groups);
console.log('opts:', opts);
console.log('values:', values);


