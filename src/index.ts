'use strict';

// https://stackoverflow.com/questions/29775830/how-to-implement-a-typescript-decorator

import * as assert from 'assert';
import chalk from 'chalk';

export const r2gSmokeTest = function () {
  // r2g command line app uses this exported function
  return true;
};

type TypeMapping = {
  Boolean: boolean,
  String: string,
  Number: number,
  Integer: number,
  ArrayOfString: Array<string>,
  ArrayOfBoolean: Array<boolean>,
  ArrayOfNumber: Array<number>,
  ArrayOfInteger: Array<number>,
  JSON: any,
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

// const asOptions = <K extends keyof any, T extends Array<{ name: K, type: keyof TypeMapping }>>(t: T) => t;
//
//
// type OptionsToType<T extends Array<{ name: keyof any, type: keyof TypeMapping }>>
//   = { [K in T[number]['name']]: TypeMapping[Extract<T[number], { name: K }>['type']] }

export interface ElemType {
  name: string,
  alt?: string | Array<string>
  short?: string,
  type: keyof TypeMapping,
  default?: any,
  separator?: string,
  env?: string | Array<string>
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

export class CliParser<T extends Array<ElemType>> {
  
  options: T;
  opts: OptionsToType<T>;
  static separators = [Type.SeparatedBooleans, Type.SeparatedIntegers, Type.SeparatedStrings, Type.SeparatedNumbers];
  static arrays = [
    Type.ArrayOfBoolean, Type.ArrayOfString, Type.ArrayOfInteger,
    Type.SeparatedBooleans, Type.SeparatedIntegers, Type.SeparatedStrings, Type.SeparatedNumbers
  ];
  
  constructor(o: T) {
    this.options = o;
    for (let i = 0; i < o.length; i++) {
      const v = o[i];
      if (v['short']) {
        assert(typeof v.short === 'string', '"short" property must be a string.');
        assert(v.short.length === 1, '"short" string must be one character in length.');
      }
    }
  }
  
  getCleanOpt(v: string) {
    return String(v).replace(/[-_]/g, '').toLowerCase();
  }
  
  getSpreadedArray(v: Array<string>): Array<string> {
    
    const ret: Array<string> = [];
    
    for (let i = 0; i < v.length; i++) {
      
      const elem = v[i];
      
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
  
  parse() {
    
    const ret = {} as { [key: string]: any };
    const values: Array<string> = [];
    
    this.options.forEach(v => {
      if (CliParser.arrays.includes(<Type>v.type)) {
        ret[v.name] = [];
      }
    });
    
    console.log('ret prepped:', ret);
    
    const nameHash = <Parsed>{};
    const shortNameHash = <Parsed>{};
    
    for (let i = 0; i < this.options.length; i++) {
      const o = this.options[i];
      const cleanName = this.getCleanOpt(o.name);
      nameHash[cleanName] = Object.assign({}, o, {cleanName});
      if (o.short) {
        shortNameHash[o.short] = Object.assign({}, o, {cleanName});
      }
    }
    
    const args = this.getSpreadedArray(process.argv.slice(2));
    console.log('these args:', args);
    
    let prev: ParsedValue = null;
    
    for (let i = 0; i < args.length; i++) {
      
      const a = args[i];
      
      if (prev) {
        
        let v: string | number | boolean | Array<string> | Array<number> | Array<boolean>;
        
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
        
        const name = prev.name;
        if (CliParser.arrays.includes(<Type>prev.type)) {
          ret[name].push(v);
        }
        else {
          ret[name] = v;
        }
        prev = null;
        continue;
      }
      
      const clean = this.getCleanOpt(a);
      
      if (!a.startsWith('-')) {
        values.push(a);
        prev = null;
        continue;
      }
      
      let longOpt = null;
      
      if (a.startsWith('--')) {
        longOpt = nameHash[clean];
        
        if (!longOpt) {
          throw chalk.magenta('Could not find option with name: ' + a);
        }
        
        if (longOpt.type === Type.Boolean) {
          ret[longOpt.name] = true;
        }
        else if (longOpt.type === Type.ArrayOfBoolean) {
          ret[longOpt.name].push(true);
        }
        else {
          prev = longOpt;
          if (!args[i + 1]) {
            throw chalk.magenta('Not enough arguments to satisfy:') + JSON.stringify(longOpt);
          }
        }
        continue;
      }
      
      let c = null;
      const shorties = a.slice(1).split('');
      const shortOpts: Parsed = shorties.reduce((a, b) => (a[b] = shortNameHash[b], a), <Parsed>{});
      const keys = Object.keys(shortOpts);
      
      for (let i = 0; i < keys.length; i++) {
        
        const k = keys[i];
        const t = shortOpts[k];
        
        if (!t) {
          throw chalk.magenta('No short name for letter: ' + k);
        }
        
        if (t.type !== Type.Boolean && t.type !== Type.ArrayOfBoolean) {
          if (i < keys.length - 1) {
            throw chalk.magenta(`When you group options, only the last option can be non-boolean. The letter that is the problem is: '${k}', in the following group: ${a}`);
          }
          if (!args[i + 1]) {
            throw chalk.magenta('Not enough arguments to satisfy non-boolean option: ') + chalk.magenta.bold(JSON.stringify(t));
          }
          c = t;
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
          ret[originalName] = true;
        }
        else if (shortHashVal.type === Type.ArrayOfBoolean) {
          ret[originalName].push(true);
        }
      }
      
      prev = c;
    }
    
    return {
      opts: <OptionsToType<T>>ret,
      values
    };
  }
}

const p = new CliParser(asOptions([
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
    type: Type.String
  },
  
  {
    name: 'Tall',
    short: 'T',
    type: Type.ArrayOfBoolean
  },
  
  {
    name: 'dog',
    short: 'x',
    type: Type.String
  }

]));

const {opts, values} = p.parse();

console.log('opts:', opts);
console.log('values:', values);













