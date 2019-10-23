'use strict';

const assert = require('assert');
const {CliParser} = require('@oresoftware/cli');
const options = JSON.parse(process.env.cli_options);
assert(Array.isArray(options), 'cli.ts test: options is not an array.');


const o = JSON.parse(process.env.cli_parser_opts);

const p = new CliParser(options, o);

const expectedResults = JSON.parse(process.env.expected_results);
const expectedValues = JSON.parse(process.env.expected_values);

assert(expectedResults && typeof expectedResults === 'object' && !Array.isArray(expectedResults),
  'cli.ts test: expectedResults is not an object or is an array instead of plain object.');
assert(Array.isArray(expectedValues),
  'cli.ts test: expectedValues is not an array.');

const {opts, values} = p.parse();

assert.deepStrictEqual(opts, expectedResults);
assert.deepStrictEqual(values, expectedValues);
