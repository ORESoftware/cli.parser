'use strict';

// https://stackoverflow.com/questions/29775830/how-to-implement-a-typescript-decorator

import * as assert from 'assert';

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

export interface Parsed {
  [key: string]: { type: string, default: any, name: string, cleanName: string }
}

export class CliParser<T extends Array<ElemType>> {
  
  options: T;
  opts: OptionsToType<T>;
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
          const first = elem.slice(0, index);
          const second = elem.slice(index + 1);
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
      nameHash[cleanName] = {type: o.type, default: o.default, name: o.name, cleanName};
      if (o.short) {
        shortNameHash[o.short] = {type: o.type, default: o.default, name: o.name, cleanName};
      }
    }
    
    const args = this.getSpreadedArray(process.argv.slice(2));
    console.log('these args:', args);
    
    let prev = null;
    
    for (let i = 0; i < args.length; i++) {
      
      const a = args[i];
      
      if (prev) {
        const name = prev.name;
        if (CliParser.arrays.includes(<Type>prev.type)) {
          ret[name].push(a);
        }
        else {
          ret[name] = a;
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
      
      let longOpt = null, shortOpts: Parsed = null;
      
      if (a.startsWith('--')) {
        longOpt = nameHash[clean];
        
        if (!longOpt) {
          throw new Error('Could not find option with name: ' + a);
        }
        
        if (longOpt.type === Type.Boolean) {
          ret[longOpt.name] = true;
        }
        else if(longOpt.type === Type.ArrayOfBoolean){
          ret[longOpt.name].push(true);
        }
        else {
          prev = longOpt;
          if (!args[i + 1]) {
            throw new Error('Not enough arguments to satisfy:' + JSON.stringify(longOpt));
          }
        }
        continue;
      }
      
      if (a.startsWith('-')) {
        
        const shorties = a.slice(1).split('');
        shortOpts = shorties.reduce((a, b) => (a[b] = shortNameHash[b], a), <Parsed>{});
        
        const keys = Object.keys(shortOpts);
        let moreThanOne = false;
        
        keys.forEach(k => {
          
          const t = shortOpts[k];
          
          if (t.type !== Type.Boolean && t.type !== Type.ArrayOfBoolean) {
            if (moreThanOne === true) {
              throw new Error('You can only group boolean options, this is a problem => ' + a);
            }
            if (!args[i + 1]) {
              throw new Error('Not enough arguments to satisfy:' + JSON.stringify(t));
            }
          }
          
          const shortHashVal = shortNameHash[k];
          
          if (!shortHashVal) {
            throw new Error('Could not find option for shortname: ' + k);
          }
          
          const longNameHashVal = nameHash[shortHashVal.cleanName];
          
          if (!longNameHashVal) {
            throw new Error('Could not find hash val for name: ' + longNameHashVal);
          }
          
          const originalName = longNameHashVal.name;
          
          if (shortHashVal.type === Type.Boolean) {
            ret[originalName] = true;
          }
          else if(shortHashVal.type === Type.ArrayOfBoolean){
            ret[originalName].push(true);
          }
          
          moreThanOne = true;
        });
        
      }
      
      prev = null;
      const c = Object.values(shortOpts)[0];
      if (c && c.type !== Type.Boolean && c.type !== Type.ArrayOfBoolean) {
        prev = c;
      }
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
    name: 'tall',
    short: 'X',
    type: Type.String
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













