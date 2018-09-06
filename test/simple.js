#!/usr/bin/env node

const cp = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const assert = require('assert');
const EE = require('events');
const strm = require('stream');

const suman = require('suman');
const {Test} = suman.init(module);
const {Type} = require('../dist/index');

Test.create(b => {
  
  const {describe, it} = b.getHooks();
  const script = path.resolve(__dirname + '/fixtures/script1.js');
  
  [
    {
      args: ['--foo', 'dog'],
      env: {
        cli_options: [{
          name: 'foo',
          type: Type.String
        }],
        cli_parser_opts: {},
        expected_values: [],
        expected_results: {
          'foo': 'dog'
        }
      }
    },
    {
      args: ['-v', '-v', '5', '--v'],
      env: {
        cli_options: [{
          name: 'v',
          short: 'v',
          type: Type.ArrayOfBoolean
        }],
        cli_parser_opts: {},
        expected_values: ['5'],
        expected_results: {
          v: [true, true, true]
        }
      }
    }
  ]
    .forEach(v => {
      
      Object.keys(v.env).forEach(k => {
        v.env[k] = JSON.stringify(v.env[k]);
      });
      
      it.cb('passes', t => {
        
        const k = cp.spawn('bash', [], {
          env: Object.assign({}, process.env, v.env, {
            FORCE_COLOR: 1
          })
        });
        k.stderr.pipe(process.stderr);
        k.stdin.end(`node ${script} ${v.args.join(' ')}`);
        k.once('exit', t);
        
      });
      
    });
  
});

