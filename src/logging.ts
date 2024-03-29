'use strict';

import chalk from "chalk";

let settings = {
  isDebug: false
};

export const flipDebug = () => {
  return settings.isDebug = !settings.isDebug;
};

export const log = {
  info: console.log.bind(console, 'cli.parser info:'),
  error: console.error.bind(console, chalk.red('cli.parser error:')),
  warn: console.error.bind(console, chalk.yellow('cli.parser warning:')),
  debug(...args: any[]) {
    if (settings.isDebug) {
      console.log('cli.parser debug:', ...args);
    }
  },

};

export default log;
