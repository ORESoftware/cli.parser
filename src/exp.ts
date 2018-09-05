'use strict';

import {asOptions, CliParser, OptionsToType, Type} from './index';


const options = asOptions([
  {
    name: ['foo', 'biz'],
    type: Type.Boolean
  },

  {
    name: ['bar'],
    type: Type.String
  },

  {
    name: ['baz'],
    type: Type.Number
  },

  {
    name: ['bab'],
    type: Type.ArrayOfString
  }
  
  // {
  //   name: 'foo',
  //   type: Type.Boolean
  // },
  //
  // {
  //   name: 'bar',
  //   type: Type.String
  // },
  //
  // {
  //   name: 'baz',
  //   type: Type.Number
  // },
  //
  // {
  //   name: 'bab',
  //   type: Type.ArrayOfString
  // }
]);


// const p = new CliParser(options);






type Opts = OptionsToType<typeof options>;

const v = <Opts>{foo: true, bar: 'ag'};




//
//
//
//
// console.log(typeof v.foo);
