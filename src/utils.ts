'use strict';


export const flattenDeep = (a: Array<any>): Array<any> => {
  return a.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);
};

export const splitString = (n: number, intersperseWith: string, str: string): string => {
  
  let ret = str.slice(0, n), remaining = str;
  
  while (remaining) {
    let v = remaining.slice(0, n);
    remaining = remaining.slice(v.length);
    ret += intersperseWith + v;
  }
  
  // This basically looks for two line breaks with only whitespace in between.
  // And then it replaces those by a single line break. Due to the global flag g,
  // this is repeated for every possible match.
  return ret.replace(/\n\s*\n/g, '\n');
  
};

export const wrapString = (n: number, str: string): string => {
  
  let ret : Array<string> = [],
    remaining = String(str || '').replace(/[\r\n]/g, '');
  
  while (remaining) {
    
    let v = remaining.slice(0, n);
    let nextIsWhitepace = !remaining[v.length] || /\s/.test(remaining[v.length]);
    if(nextIsWhitepace){
      remaining = remaining.slice(v.length);
      ret.push(String(v || '').trim());
      continue;
    }
    
    while(v.length){
      const l = v[v.length -1];
      if(!l || /\s/.test(l)){
        break;
      }
      v = v.slice(0, v.length -1);
    }
  
    remaining = remaining.slice(v.length);
    ret.push(String(v || '').trim());
   
  }
  
  return ret.join('\n');
  
};

