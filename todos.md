
### TODOS

-TT should be two talls, like the first, not the second

alex.mills@alex cli.parser % ts-node /Users/alex.mills/codes/oresoftware/cli.parser/src/test.ts -T -T
order: [
{ name: 'Tall', value: true, from: 'argv' },
{ name: 'Tall', value: true, from: 'argv' }
]
groups: [ { Tall: true }, { Tall: true } ]
opts: { Tall: [ true, true ], bbb: [], ccC: [], N: [], dog: [] }
values: []


alex.mills@alex cli.parser % ts-node /Users/alex.mills/codes/oresoftware/cli.parser/src/test.ts -TT
order: [ { name: 'Tall', value: true, from: 'argv' } ]
groups: [ { Tall: true } ]
opts: { Tall: [ true ], bbb: [], ccC: [], N: [], dog: [] }
values: []


and

alex.mills@alex cli.parser % ts-node /Users/alex.mills/codes/oresoftware/cli.parser/src/test.ts -T=0
order: [ { name: 'Tall', value: true, from: 'argv' } ]
groups: [ { Tall: true } ]
opts: { Tall: [ true ], bbb: [], ccC: [], N: [], dog: [] }
values: [ '0' ]

the above should be Tall: false
