'use strict';

const assert = require('assert');
const {CliParser} = require('cli.ts');
const options = JSON.parse(process.env.options);
assert(Array.isArray(options), 'cli.ts test: options is not an array.');

const p = new CliParser(options);

const expectedResults = JSON.parse(process.env.expected_results);
assert(expectedResults && typeof expectedResults === 'object', 'cli.ts test: expectedResults is not an object.');

const {opts, values} = p.parse();

assert.deepStrictEqual(opts, expectedResults);
