#!/usr/bin/env node

const cp = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const assert = require('assert');
const EE = require('events');
const strm = require('stream');
const chalk = require('chalk');

const suman = require('suman');
const {Test} = suman.init(module);
const {Type} = require('../dist/index');
const {pt} = require('prepend-transform');

Test.create(b => {
  
  const {describe, it} = b.getHooks();
  const script = path.resolve(__dirname + '/fixtures/script1.js');
  
  const defaultEnv = {
    cli_options: [],
    cli_parser_opts: {},
    expected_values: [],
    expected_results: {}
  };
  
  [
    {
      args: ['--foo', 'dog'],
      env: {
        cli_options: [
          {
            name: 'foo',
            type: Type.String
          }
        ],
        expected_results: {
          'foo': 'dog'
        }
      }
    },
    {
      
      args: ['-v', '-v', '5', '--v'],
      env: {
        cli_options: [
          {
            name: 'v',
            short: 'v',
            type: Type.ArrayOfBoolean
          }
        ],
        expected_values: ['5'],
        expected_results: {
          v: [true, true, true]
        }
      }
    },
    {
      expectedExitCode: 1,
      expectedStderr: /letter must be alphabetic/,
      env: {
        cli_options: [
          {
            name: 'v',
            short: '6',
            type: Type.ArrayOfBoolean
          }
        ]
      }
    },
    
    {
      //duplication name v
      expectedExitCode: 1,
      expectedStderr: /Duplication of option for "name"/,
      env: {
        cli_options: [
          {
            name: 'v',
            short: 'U',
            type: Type.ArrayOfBoolean
          },
          {
            name: 'v',
            short: 'u',
            type: Type.ArrayOfBoolean
          }
        ]
      }
    },
    
    {
      expectedExitCode: 0,
      args: [],
    
      env: {
        expected_results: {
          bbb: [],
          ccC:[],
          Tall: [],
          dog: []
        },
        cli_options: [
          
          {
            name: 'aaa',
            short: 'a',
            type: Type.Boolean
          },
  
          {
            name: 'zoomBar',
            short: 'z',
            type: Type.String
          },
  
          {
            name: 'foo',
            short: 'f',
            type: Type.String
          },
          
          {
            name: 'bbb',
            short: 'b',
            type: Type.ArrayOfBoolean
          },
  
          {
            name: 'ccC',
            short: 'c',
            type: Type.SeparatedStrings,
            separator: ','
          },
  
          {
            name: 'Tall',
            short: 'T',
            type: Type.ArrayOfBoolean,
            help: 'This is how we do it, friday night and I feel alright.'
          },
  
          {
            name: 'N',
            short: 'n',
            type: Type.Number,
            help: 'This is how we do it, friday night and I feel alright.'
          },
  
          {
            name: 'dog',
            short: 'x',
            type: Type.ArrayOfString
          }

        ]
      }
    },
    
    {
      //duplication SHORT name v
      expectedExitCode: 1,
      expectedStderr: /Duplication of option for "short"/,
      env: {
        cli_options: [
          {
            name: 'Z',
            short: 'v',
            type: Type.ArrayOfBoolean
          },
          {
            name: 'u',
            short: 'v',
            type: Type.ArrayOfBoolean
          }
        ]
      }
    }
  ]
    .forEach((v, index) => {
      
      v.env = Object.assign({}, defaultEnv, v.env);
      v.expectedExitCode = v.expectedExitCode || 0;
      v.args = v.args || [];
      
      Object.keys(v.env).forEach(k => {
        v.env[k] = JSON.stringify(v.env[k]);
      });
      
      it.cb('passes', t => {
        
        const k = cp.spawn('bash', [], {
          env: Object.assign({}, process.env, v.env, {
            FORCE_COLOR: 1
          })
        });
        
        let stderr = '';
        k.stderr.on('data', d => {
          stderr += String(d || '');
        });
        
        k.stderr.pipe(pt('\t' + chalk.yellow(`stderr for ${index}: `))).pipe(process.stderr);
        
        k.stdin.end(`node ${script} ${v.args.join(' ')}`);
        
        k.once('exit', t.wrapFinal(code => {
          
          if (v.expectedStderr) {
            assert(v.expectedStderr.test(stderr),
              `${index}: stderr does not match: ${v.expectedStderr} does not match '${String(stderr || '').trim()}'`);
          }
          
          assert.strictEqual(code, v.expectedExitCode, 'Expected exit code did not match.');
          
        }));
        
      });
      
    });
  
});

