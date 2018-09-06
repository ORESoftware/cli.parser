'use strict';

import {CliParser, ElemType, Type} from './index';

const {table} = require('table');
const Table = require('cli-table2');
// const AsciiTable = require('ascii-table');
import chalk from 'chalk';

// export const getTable2 = (options: Array<ElemType>) => {
//
//
//   const table = new AsciiTable('A Title');
//   table.setHeading('Name', 'Type', 'Description');
//
//   table.addRow('-------------', '-------------------', '-------------------------------------')
//
//   options.forEach(v => {
//     table.addRow(v.name, v.type, v.help || 'foo help ajjaogaga ij ao oa ijagoijgeoaigjeaogiejo' + '\nijagej')
//   });
//
//   table.removeBorder();
//
//   return table;
//
//
// };

export const getTable3 = (options: Array<ElemType>) => {
  
  // const data = [
  //   ['0A', '0B', '0C'],
  //   ['1A', '1B', '1C'],
  //   ['2A', '2B', '2C']
  // ];
  
  const data = options.map(v => {
    return [v.name, v.help || 'agejaogeja ao agjeaogjeojagojaeo aogije']
  });
  
  const config = {
    columns: {
      0: {
        alignment: 'left',
        minWidth: 2260
      },
      1: {
        alignment: 'center',
        minWidth: 60,
        maxWidth: 10
      },
      // 2: {
      //   alignment: 'right',
      //   minWidth: 10
      // }
    }
  };
  
  return table(data, config);
  
};

const getSeparatedString = (v: ElemType): string => {
  if (CliParser.separators.includes(<Type>v.type)) {
    return ` (${v.separator || ','})`;
  }
  return '';
};

const getNames = (v: ElemType): string => {
  return [
    v.short ? chalk.bold('-' + v.short) : '',
    '--' + camel2Dash(v.name),
  ]
  .map(v => String(v || '').trim())
  .filter(Boolean)
  .join('\n')
};


const camel2Dash = (v: string): string => {
  
  let ret = '', prevLowercase = false;
  
  for(let s of v){
    
    const isUppercase = s.toUpperCase() === s;
    if(isUppercase && prevLowercase){
      ret += '-';
    }
    
    ret+=s;
    prevLowercase = !isUppercase;
  }
  
  return ret.replace(/-+/g, '-').toLowerCase();
  
};



export const getTable = (options: Array<ElemType>) => {
  
  // const data = [
  //   ['0A', '0B', '0C'],
  //   ['1A', '1B', '1C'],
  //   ['2A', '2B', '2C']
  // ];
  
  const table = new Table({
    // head: ['Name(s)', 'Type', 'Description'],
    colWidths: [40, 25, 60]
  });
  
  table.push([
    {colSpan: 3, content: 'greetings\ndog\nfrog'}
  ]);
  
  table.push([
    chalk.blueBright.bold('Name(s)'), chalk.blueBright.bold('Type'), chalk.blueBright.bold('Description')
  ]);
  
  options.map(v => {
    return [getNames(v), chalk.bold.gray(v.type + `${getSeparatedString(v)}`), v.help || 'agejaogeja ao o age agageageage\n777']
  })
  .forEach(v => {
    table.push(v);
  });
  
  return String(table)
  .split('\n')
  .map(v => '  ' + v)
  .join('\n');
  
};

