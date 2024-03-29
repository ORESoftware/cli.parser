'use strict';

import * as path from 'path';
import * as assert from 'assert';
import chalk from 'chalk';

export const flattenDeep = (a: Array<any>): Array<any> => {
  return a.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);
};

export const parseBool = (str: string): boolean => {
  switch (String(str || "").toUpperCase()) {
    case "1":
    case "TRUE":
    case "YES":
    case "YASS":
      return true
  }
  return false
}

export const parseBoolOptimistic = (str: string): boolean => {
  switch (String(str || "").toUpperCase()) {
    case "0":
    case "FALSE":
      return false
  }
  return true
}

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

export const findJSONFiles = (pth: string): object => {

  const values: Array<object> = [];
  assert(path.isAbsolute(pth), 'pth must be an absolute path.');

  const home = process.env.HOME;

  while (pth.startsWith(home)) {

    try {
      values.push(require(path.resolve(pth, '.cli.json')))
    } catch (err) {
      if (/parse/i.test(err.message) && !/Cannot find module/i.test(err.message)) {
        console.error(chalk.magenta(err));
      }
    }

    pth = path.resolve(pth, '..');

  }

  return Object.assign({}, ...values.reverse());

};


export const getCleanOpt = (v: string) => {

  while (v.startsWith('-')) {
    v = v.slice(1);
  }

  return v.replace(/-/g, '_');  // .toLowerCase(); // .replace(/-/g, '_');
};


export const getSpreadedArray = (v: Array<string>): Array<string> => {

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
      const index = elem.indexOf('='); // only the first inded of =
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

  console.log({ret});
  return ret;

};

export const wrapString = (n: number, str: string): string => {

  let ret: Array<string> = [],
    remaining = String(str || '').replace(/[\r\n]/g, '');

  while (remaining) {

    let v = remaining.slice(0, n);
    let nextIsWhitepace = !remaining[v.length] || /\s/.test(remaining[v.length]);
    if (nextIsWhitepace) {
      remaining = remaining.slice(v.length);
      ret.push(String(v || '').trim());
      continue;
    }

    while (v.length) {
      const l = v[v.length - 1];
      if (!l || /\s/.test(l)) {
        break;
      }
      v = v.slice(0, v.length - 1);
    }

    remaining = remaining.slice(v.length);
    ret.push(String(v || '').trim());

  }

  return ret.join('\n');

};

