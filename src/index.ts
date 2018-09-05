'use strict';

// https://stackoverflow.com/questions/29775830/how-to-implement-a-typescript-decorator

export const r2gSmokeTest = function () {
  // r2g command line app uses this exported function
  return true;
};

type TypeMapping = {
  Boolean: boolean,
  String: string,
  Number: number,
  ArrayOfString: Array<string>,
  Integer: number,
  ArrayOfBoolean: Array<boolean>,
  ArrayOfNumber: Array<number>,
  JSON: any,
  CommaSeparatedString: Array<string>,
  ColonSeparatedString: Array<string>
}

export enum Type {
  Boolean = 'Boolean',
  String = 'String',
  Number = 'Number',
  ArrayOfString = 'ArrayOfString',
  ArrayOfBoolean = 'ArrayOfBoolean',
  Integer = 'Integer',
  ArrayOfInteger = 'ArrayOfInteger',
  JSON = 'JSON',
  CommaSeparatedString = 'CommaSeparatedString',
  ColonSeparatedString = 'ColonSeparatedString'
}

// const asOptions = <K extends keyof any, T extends Array<{ name: K, type: keyof TypeMapping }>>(t: T) => t;
//
//
// type OptionsToType<T extends Array<{ name: keyof any, type: keyof TypeMapping }>>
//   = { [K in T[number]['name']]: TypeMapping[Extract<T[number], { name: K }>['type']] }

export interface ElemType {
  name: string,
  alt?: Array<string>
  short?: string,
  type: keyof TypeMapping,
  default?: any
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
  values: Array<string> = [];
  
  constructor(o: T) {
    this.options = o;
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
    
    const ret = {} as {[key:string]: any};
    
    const namesHash = <Parsed>{};
    const shortNameHash = <Parsed>{};
    
    for (let i = 0; i < this.options.length; i++) {
      const o = this.options[i];
      const cleanName = this.getCleanOpt(o.name);
      namesHash[cleanName] = {type: o.type, default: o.default, name: o.name, cleanName};
      if(o.short){
        shortNameHash[this.getCleanOpt(o.short)] = {type: o.type, default: o.default, name: o.name, cleanName};
      }
    }
    
    const args = this.getSpreadedArray(process.argv.slice(2));
    
    let prev = null;
    
    for (let i = 0; i < args.length; i++) {
      
      const a = args[i];
      const clean = this.getCleanOpt(a);
      
      let longOpt = null, shortOpts: Parsed = null;
      
      if (a.startsWith('--')) {
        longOpt = namesHash[clean];
      }
      else if (a.startsWith('-')) {
        
        const shorties = clean.split('');
        shortOpts = shorties.reduce((a, b) => (a[b] = shortNameHash[b], a), <Parsed>{});
        
        const keys = Object.keys(shortOpts);
        let moreThanOne = false;
        keys.forEach(k => {
          const t = shortOpts[k];
          if (moreThanOne === true && t.type !== Type.Boolean) {
            throw new Error('You can only group boolean options, this is a problem => ' + a);
          }
          
          const shortHashVal = shortNameHash[k];
          
          if(!shortHashVal){
            throw new Error('Could not find option for shortname: ' + k);
          }
          
          const longNameHashVal = namesHash[shortHashVal.cleanName];
          
          if(!longNameHashVal){
            throw new Error('Could not find hash val for name: ' + longNameHashVal);
          }
          
          const originalName = longNameHashVal.name;
          
          if(shortHashVal.type === Type.Boolean){
            ret[originalName] = true;
          }
       
          moreThanOne = true;
        });
        
      }
      
      if (!a.startsWith('-')) {
        this.values.push(a);
        return;
      }
      
      prev = a;
      
    }
    
    return ret;
  }
}

const p = new CliParser(asOptions([{
  name: 'foo',
  short: 'a',
  type: Type.Boolean
}]));

const o = p.parse();
console.log(o);













