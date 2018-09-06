'use strict';

import {CliParser, CliParserHelpOpts, CliParserOptions, ElemType, Type} from './index';
// const AsciiTable = require('ascii-table');
import chalk from 'chalk';
import {flattenDeep, splitString, wrapString} from './utils';

const {table} = require('table');
const Table = require('cli-table2');


const columns = {
  names: {
    position: 0,
    width: 30
  },
  type: {
    position: 1,
    width: 25
  },
  description: {
    position: 2,
    width: 90
  }
  
};


const getSeparatedString = (v: ElemType): string => {
  if (CliParser.separators.includes(<Type>v.type)) {
    return ` (${v.separator || ','})`;
  }
  return '';
};

const mapEnv = (env: string | Array<string>, type: Type, sep: string): string => {
  return flattenDeep([env]).map(v => String(v || '').trim()).filter(Boolean).map(v => {
    
    sep = sep || ',';
    
    switch (type) {
      case Type.String:
      case Type.ArrayOfString:
      case Type.SeparatedStrings:
      case Type.SeparatedBooleans:
      case Type.ArrayOfNumber:
      case Type.SeparatedIntegers:
      case Type.ArrayOfBoolean:
        return v + `=x${sep}y${sep}z`;
      case Type.Boolean:
        return v + '=true/false/1/0'
    }
    
    return v + '=ARG';
  })
  .join('\n');
};

const getNames = (v: ElemType): string => {
  return [
    v.short ? chalk.bold('-' + v.short) : '',
    '--' + camel2Dash(v.name),
    v.env ? mapEnv(v.env, <Type>v.type, v.separator) : ''
  ]
  .map(v => String(v || '').trim())
  .filter(Boolean)
  .join('\n')
};

const camel2Dash = (v: string): string => {
  
  let ret = '', prevLowercase = false;
  
  for (let s of v) {
    
    const isUppercase = s.toUpperCase() === s;
    if (isUppercase && prevLowercase) {
      ret += '-';
    }
    
    ret += s;
    prevLowercase = !isUppercase;
  }
  
  return ret.replace(/-+/g, '-').toLowerCase();
  
};

export const getTable = (options: Array<ElemType>, o: CliParserOptions, v: CliParserHelpOpts) => {
  
  // const data = [
  //   ['0A', '0B', '0C'],
  //   ['1A', '1B', '1C'],
  //   ['2A', '2B', '2C']
  // ];
  
  const table = new Table({
    colWidths: [30, 25, 95]
  });
  
  table.push([
    {colSpan: 3, content: o.commandName || 'node foo.js [OPTIONS]'}
  ]);
  
  table.push([
    chalk.blueBright.bold('Name(s)'), chalk.blueBright.bold('Type'), chalk.blueBright.bold('Description/Help')
  ]);
  
  options.forEach(v => {
    table.push([
      getNames(v),
      chalk.bold.gray(v.type + `${getSeparatedString(v)}`),
      chalk.italic(wrapString(85, v.help || ''))
    ])
  });
  
  return String(table)
  .split('\n')
  .map(v => '  ' + v)
  .join('\n');
  
};

