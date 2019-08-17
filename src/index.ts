'use strict';

// https://stackoverflow.com/questions/29775830/how-to-implement-a-typescript-decorator
// https://stackoverflow.com/questions/52175508/conditional-types-with-typescript

import * as assert from 'assert';
import chalk from 'chalk';
import {getTable} from './table';
import * as util from 'util';
import {findJSONFiles} from './utils';

export const r2gSmokeTest = function () {
  // r2g command line app uses this exported function
  return true;
};

type TypeMapping<T = any> = {
  Boolean: boolean,
  String: string,
  Number: number,
  Integer: number,
  ArrayOfString: Array<string>,
  ArrayOfBoolean: Array<boolean>,
  ArrayOfNumber: Array<number>,
  ArrayOfInteger: Array<number>,
  JSON: T,
  SeparatedStrings: Array<string>,
  SeparatedNumbers: Array<string>,
  SeparatedIntegers: Array<string>,
  SeparatedBooleans: Array<string>
}

export enum Type {
  Boolean = 'Boolean',
  String = 'String',
  Number = 'Number',
  Integer = 'Integer',
  ArrayOfString = 'ArrayOfString',
  ArrayOfBoolean = 'ArrayOfBoolean',
  ArrayOfNumber = 'ArrayOfNumber',
  ArrayOfInteger = 'ArrayOfInteger',
  JSON = 'JSON',
  SeparatedStrings = 'SeparatedStrings',
  SeparatedNumbers = 'SeparatedNumbers',
  SeparatedIntegers = 'SeparatedIntegers',
  SeparatedBooleans = 'SeparatedIntegers'
}


export interface ElemType<T = any> {
  name: string,
  alt?: string | Array<string>
  short?: string,
  type: keyof TypeMapping,
  default?: any,
  separator?: string,
  env?: string,
  help?: string,
  description?: string
}

export const asOptions = <K extends keyof any, T extends Array<{ name: K, type: keyof TypeMapping }>>(t: T) => t;

export type OptionsToType<T extends Array<ElemType>>
  = { [K in T[number]['name']]: TypeMapping[Extract<T[number], { name: K }>['type']] }

export interface ParsedValue extends ElemType {
  cleanName: string
}

export interface Parsed {
  [key: string]: ParsedValue
}

export interface CliParserHelpOpts {
  includeEnv: boolean
}

export interface CliParserOptions {
  commandName: string,
  commandExample: string
  allowUnknown: boolean,
  useJSONEnv: boolean
}

export type ParsedType = Date | string | number | boolean | Array<string> | Array<number> | Array<boolean> | Array<Date>

export interface CliParserGroup {
  [key: string]: ParsedType
}

export interface CliParserOrder {
  name: string,
  value: ParsedType,
  from: 'env' | 'argv'
}

const checkArray = (v: ElemType, t: string, f?: (v: any) => void) => {
  
  if (!('default' in v)) {
    return;
  }
  
  assert(Array.isArray(v.default), `type is array, so default value needs to be array for option: ${util.inspect(v)}`);
  for (const x of v.default) {
    assert(typeof x === t, `Type of array element needs to be: '${t}'`);
    f && f(x);
  }
};

const checkJSONArray = (v: ElemType, t: string, f?: (v: any) => void) => {
  
  if (!('env' in v)) {
    return;
  }
  
  if (!(v.env in process.env)) {
    return;
  }
  
  if (process.env[v.env] === '') {
    return;
  }
  
  try {
    var e = JSON.parse(process.env[v.env]);
  }
  catch (err) {
    throw `Could not call JSON.parse on ${v.env}, expecting an array.`;
  }
  
  assert(Array.isArray(e.value), `type is array, so default value needs to be array for option: ${util.inspect(v)}`);
  
  for (const x of e.value) {
    assert(typeof x === t, `Type of array element needs to be: '${t}'`);
    f && f(x);
  }
};


const checkSepkArray = (v: ElemType, t: string, f?: (v: any) => void) => {
  
  if (!('default' in v)) {
    return;
  }
  
  const def = v.default;
  const sep = v.separator || ',';
  
  assert(typeof def === 'string', `The type is "${sep}" separated values, but the default value is not a string ${v}`);
  
  const split = def.split(sep);
  for (const x of split) {
    assert(typeof x === t, `Type of array element needs to be: '${t}'`);
    f && f(x);
  }
  
};


const checkJSONSepArray = (v: ElemType, t: string, f?: (v: any) => void) => {
  
  if (!('env' in v)) {
    return;
  }
  
  if (!(v.env in process.env)) {
    return;
  }
  
  if (process.env[v.env] === '') {
    return;
  }
  
  try {
    var e = JSON.parse(process.env[v.env]);
  }
  catch (err) {
    throw `Could not call JSON.parse on ${v.env}, expecting an array.`;
  }
  
  const sep = v.separator || ',';
  
  assert(typeof e.value === 'string', `The type is "${sep}" separated values, but the default value is not a string ${v}`);
  
  const split = e.value.split(sep);
  for (const x of split) {
    assert(typeof x === t, `Type of array element needs to be: '${t}'`);
    f && f(x);
  }
  
};


export class CliParser<T extends Array<ElemType>> {
  
  private readonly options: T;
  private readonly opts: OptionsToType<T>;
  private readonly parserOpts: CliParserOptions;
  
  static separators = [Type.SeparatedBooleans, Type.SeparatedStrings, Type.SeparatedIntegers, Type.SeparatedNumbers];
  static arrays = [Type.ArrayOfBoolean, Type.ArrayOfString, Type.ArrayOfInteger, Type.ArrayOfNumber];
  
  allowUnknown = false;
  useJSONEnv = true;
  env: { [key: string]: string } = null;
  
  constructor(o: T, opts?: Partial<CliParserOptions>) {
    
    this.parserOpts = <CliParserOptions>(opts || {});
    this.options = o;
    
    try {
      
      if ('allowUnknown' in this.parserOpts) {
        assert([undefined, true, false].includes(this.parserOpts.allowUnknown), '"allowUnknown" option must be a boolean.');
      }
      
      this.allowUnknown = this.parserOpts.allowUnknown || false;
      this.useJSONEnv = this.parserOpts.useJSONEnv !== false;
      
      this.env = Object.assign({}, process.env);
      
      if (this.useJSONEnv) {
        this.env = Object.assign(this.env, findJSONFiles(process.cwd()));
      }
      
      const set = {} as { [key: string]: true };
      
      for (const v of o) {
        
        assert(v.name && typeof v.name === 'string',
          `${JSON.stringify(v)} is missing a name field, or the field is not a string.`);
        
        assert(!/-{2}/.test(v.name), `A "name" field cannot have consecutive hyphens. See: ${chalk.bold(v.name)}.`);
        assert(!/_{2}/.test(v.name), `A "name" field cannot have consecutive underscores. See: ${chalk.bold(v.name)}.`);
        
        assert(!v.name.startsWith('-'), 'A "name" field cannot start with a - hyphen character.');
        
        assert(/^[A-Za-z0-9-_:@]+$/.test(v.name),
          `"name" letter must be alphanumeric, or have a colon, underscore, ampersand, or hyphen/dash. See: ${chalk.bold(v.name)}.`);
        
        if (v.short) {
          assert.strictEqual(typeof v.short, 'string', `"short" property must be a string. See: '${util.inspect(v.short)}'.`);
          assert(v.short.length === 1, `"short" string property must be one character in length. See: '${v.short}'.`);
          assert(/[A-Za-z]/.test(v.short), `"short" letter must be alphabetic (uppercase or lowercase. See: '${v.short}'.`);
        }
        
        const clean = CliParser.getCleanOpt(v.name);
        
        if (set[clean]) {
          throw `Duplication of option for "name" => '${v.name}'.`;
        }
        
        if (set[v.short]) {
          throw `Duplication of option for "short" => '${v.short}'.`;
        }
        
        if (v.short) {
          set[clean] = set[v.short] = true;
        }
        
        
        switch (v.type) {
          
          case "ArrayOfBoolean":
            checkArray(v, 'boolean');
            break;
          
          case "ArrayOfNumber":
            checkArray(v, 'number');
            break;
          
          case "ArrayOfInteger":
            checkArray(v, 'number', v => assert(Number.isInteger(v), `Number must be an integer: ${util.inspect(v)}`));
            break;
          
          case "ArrayOfString":
            checkArray(v, 'string');
            break;
          
          case "Number":
            'default' in v && assert(typeof v.default === 'number', `Default value must be a number: ${util.inspect(v)}`);
            break;
          
          case "String":
            'default' in v && assert(typeof v.default === 'string', `Default value must be a string: ${util.inspect(v)}`);
            break;
          
          case "Boolean":
            'default' in v && assert(typeof v.default === 'boolean', `Default value must be a boolean: ${util.inspect(v)}`);
            break;
          
          case "Integer":
            'default' in v && assert(Number.isInteger(v.default), `Default value must be an integer: ${util.inspect(v)}`);
            break;
          
          case "JSON":
            try {
              'default' in v && JSON.parse(v.default);
            }
            catch (err) {
              throw `Could not call JSON.parse on default property, even though the type is "JSON": ${util.inspect(v)}`
            }
            break;
          
          case "SeparatedBooleans":
            checkSepkArray(v, 'boolean');
            break;
          
          case "SeparatedIntegers":
            checkSepkArray(v, 'number', v => assert(Number.isInteger(v), `Number must be an integer: ${util.inspect(v)}`));
            break;
          
          case "SeparatedNumbers":
            checkSepkArray(v, 'number');
            break;
          
          case "SeparatedStrings":
            checkSepkArray(v, 'string');
            break;
          
          default:
            throw `The "type" property was not recognized on ${util.inspect(v)}, it must be one of: ${util.inspect(Type)}`
          
        }
        
      }
    }
    catch (e) {
      throw chalk.magenta(e);
    }
  }
  
  static getCleanOpt(v: string) {
    
    while (v.startsWith('-')) {
      v = v.slice(1);
    }
    
    return v;  // .toLowerCase(); // .replace(/-/g, '_');
  }
  
  static getSpreadedArray(v: Array<string>): Array<string> {
    
    const ret: Array<string> = [];
    
    for (let i = 0; i < v.length; i++) {
      
      const elem = v[i];
      
      if (elem.startsWith('–')) {
        throw 'Your program has an "en-dash" instead of a hyphen - .';
      }
      
      if (elem.startsWith('—')) {
        throw 'Your program has an "em-dash" instead of a hyphen - .';
      }
      
      if (elem.startsWith('-')) {
        const index = elem.indexOf('=');
        if (index > -1) {
          const first = elem.slice(0, index).trim();
          const second = elem.slice(index + 1).trim();
          
          if (first.length < 1 || second.length < 1) {
            throw chalk.magenta('Malformed expression involving equals (=) sign, see: ' + elem);
          }
          ret.push(first, second);
          continue;
        }
      }
      
      ret.push(elem);
    }
    
    return ret;
  }
  
  getHelpString(v?: CliParserHelpOpts) {
    v = <CliParserHelpOpts>(v || {});
    return getTable(this.options, this.parserOpts, v);
  }
  
  parse(argv: Array<string>) {
    
    if (!argv) {
      argv = process.argv;
    }
    
    if (argv === process.argv) {
      argv = argv.slice(2);
    }
    
    assert(Array.isArray(argv), 'argv is not an array.');
    
    for (let v of argv) {
      assert.strictEqual(typeof v, 'string', `Element in the argv array is not a string type => ${util.inspect(v)}`);
    }
    
    const opts: { [index: string]: any } = {};
    const values: Array<string> = [];
    const groups: Array<CliParserGroup> = [];
    const order: Array<CliParserOrder> = [];
    
    for (const v of this.options) {
      if (CliParser.arrays.includes(<Type>v.type)) {
        opts[v.name] = [];
      }
      if (CliParser.separators.includes(<Type>v.type)) {
        opts[v.name] = [];
      }
    }
    
    const nameHash = <Parsed>{};
    const shortNameHash = <Parsed>{};
    const envHash = <Parsed>{};
    
    for (const o of this.options) {
      const cleanName = CliParser.getCleanOpt(o.name);
      nameHash[cleanName] = Object.assign({}, o, {cleanName});
      if (o.short) {
        shortNameHash[o.short] = Object.assign({}, o, {cleanName});
      }
      if (o.env) {
        envHash[o.env as string] = Object.assign({}, o, {cleanName});
      }
    }
    
    
    const args = CliParser.getSpreadedArray(argv);
    
    let prev: ParsedValue = null, g: CliParserGroup = null;
    
    for (let i = 0; i < args.length; i++) {
      
      const a = args[i];
      
      if (prev && a.startsWith('-')) {
        // TODO: we need check if the value is one of our options
        throw chalk.magenta(`Expected a value but got an option instead: ${a}`);
      }
      
      if (prev) {
        
        let v: ParsedType;
        
        if (prev.type === Type.String || prev.type === Type.ArrayOfString) {
          v = a.slice(0);
        }
        else if (prev.type === Type.Integer || prev.type === Type.ArrayOfInteger) {
          v = Number.parseInt(a);
        }
        else if (prev.type === Type.Number || prev.type === Type.ArrayOfNumber) {
          v = Number.parseFloat(a);
        }
        else if (CliParser.separators.includes(<Type>prev.type)) {
          v = a.split(prev.separator || ',').map(v => String(v || '').trim()).filter(Boolean).map(v => {
            switch (<Type>prev.type) {
              case Type.SeparatedNumbers:
                return JSON.parse(v);
              case Type.SeparatedIntegers:
                return Number.parseInt(v);
              case Type.SeparatedBooleans:
                return Boolean(JSON.parse(v));
            }
            
            return v;
          });
        }
        else {
          throw new Error('No type matched. Fallthrough.');
        }
        
        const name = CliParser.getCleanOpt(prev.name);
        
        if (g) {
          g[name] = v;
          groups.push(g);
          g = null;
        }
        
        if (CliParser.arrays.includes(<Type>prev.type)) {
          opts[name].push(v);
          order.push({name, value: v, from: 'argv'});
          prev = null;
          continue;
        }
        
        if (name in opts) {
          console.log({name, ret: opts});
          throw chalk.magenta(`Non-array and non-boolean option was used more than once, the option name is: '${name}'.`);
        }
        
        order.push({name, value: v, from: 'argv'});
        opts[name] = v;
        prev = null;
        continue;
      }
      
      if (!a.startsWith('-')) {
        values.push(a);
        prev = null;
        continue;
      }
      
      const clean = CliParser.getCleanOpt(a);
      let longOpt = null;
      
      if (a.startsWith('--')) {
        
        longOpt = nameHash[clean];
        
        if (!longOpt) {
          if (this.allowUnknown) {
            values.push(a);
            continue;
          }
          
          throw chalk.magenta('Could not find option with name: ' + a);
        }
        
        const name = CliParser.getCleanOpt(longOpt.name);
        
        if (longOpt.type === Type.Boolean) {
          opts[name] = true;
          order.push({name, value: true, from: 'argv'});
        }
        else if (longOpt.type === Type.ArrayOfBoolean) {
          opts[name].push(true);
          order.push({name, value: true, from: 'argv'});
        }
        else {
          prev = longOpt;
          if (!args[i + 1]) {
            throw chalk.magenta('Not enough arguments to satisfy: ') + chalk.magenta.bold(JSON.stringify(longOpt));
          }
        }
        continue;
      }
      
      let c = null;
      const shorties = a.slice(1).split('');
      const shortOpts: Parsed = shorties.reduce((a, b) => (a[b] = shortNameHash[b], a), <Parsed>{});
      const keys = Object.keys(shortOpts);
      
      g = {};
      
      for (let j = 0; j < keys.length; j++) {
        
        const k = keys[j];
        const t = shortOpts[k];
        
        if (!t) {
          
          if (this.allowUnknown) {
            values.push(a);
            break;
          }
          
          throw chalk.magenta('No short name for letter: ' + k);
        }
        
        const shortHashVal = shortNameHash[k];
        if (!shortHashVal) {
          throw chalk.magenta('Could not find option for shortname: ' + k);
        }
        
        const longNameHashVal = nameHash[shortHashVal.cleanName];
        if (!longNameHashVal) {
          throw chalk.magenta('Could not find hash val for name: ') + longNameHashVal;
        }
        
        const originalName = longNameHashVal.name;
        
        if (shortHashVal.type === Type.Boolean) {
          opts[originalName] = true;
          order.push({name: originalName, value: true, from: 'argv'});
        }
        else if (shortHashVal.type === Type.ArrayOfBoolean) {
          opts[originalName].push(true);
          order.push({name: originalName, value: true, from: 'argv'});
        }
        else {
          if (j < keys.length - 1) {
            throw chalk.magenta(`When you group options, only the last option can be non-boolean. The letter that is the problem is: '${k}', in the following group: ${a}`);
          }
          
          if (!args[i + 1]) {
            throw chalk.magenta('Not enough arguments to satisfy non-boolean option: ') + chalk.magenta.bold(JSON.stringify(t));
          }
          c = t;
        }
        
        g[originalName] = true;
      }
      
      if (c) {
        prev = c;
        if (!args[i + 1]) {
          throw chalk.magenta('Not enough arguments to satisfy: ') + chalk.magenta.bold(JSON.stringify(c));
        }
      }
      else {
        groups.push(g);
      }
      
    }
    
    
    for (const o of this.options) {
      const cleanName = CliParser.getCleanOpt(o.name);
      if (!(cleanName in opts)) {
        if (o.env && o.env in process.env) {
          
          try {
            var val = JSON.parse(process.env[o.env]);
          }
          catch (err) {
            throw `Could not parse env variable with name: ${o.env}:\n${err.message || err}`
          }
          
          if (!('value' in val)) {
            throw 'You must use an JSON string with a property named "value" in your env variable.'
          }
          opts[cleanName] = val.value;
        }
        else if ('default' in o) {
          opts[cleanName] = JSON.parse(JSON.stringify(o.default))
        }
      }
    }
    
    
    return {
      opts: <OptionsToType<T>>opts,
      values,
      groups,
      order
    };
  }
}


export const Parser = CliParser;










