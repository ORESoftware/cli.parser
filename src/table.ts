'use strict';

import {ElemType} from './index';
const {table} =  require('table');
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


export const getTable = (options: Array<ElemType>) => {
  
  // const data = [
  //   ['0A', '0B', '0C'],
  //   ['1A', '1B', '1C'],
  //   ['2A', '2B', '2C']
  // ];
  
  const table = new Table({
    head: ['TH 1 label', 'TH 2 label'],
    colWidths: [50, 30]
  });
  
  options.map(v => {
    return [v.name, v.help || 'agejaogeja ao o age agageageage777']
  })
  .forEach(v => {
    table.push(v);
  });
  
  return table;
  
};

