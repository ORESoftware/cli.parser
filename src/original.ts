

type TypeMapping = {
  boolean: boolean,
  string: string,
  number: number
}


const asOptions = <K extends keyof any,
  T extends Array<{ name: K, type: keyof TypeMapping }>>(t: T) => t;


type OptionsToType<T extends Array<{ name: keyof any, type: keyof TypeMapping }>>
  = { [K in T[number]['name']]: TypeMapping[Extract<T[number], { name: K }>['type']] }
  

const options = asOptions([
  {
    name: 'foo',
    type: 'boolean'
  },
  
  {
    name: 'bar',
    type: 'string'
  },
  
  {
    name: 'baz',
    type: 'number'
  }
]);

export type Opts = OptionsToType<typeof options>;


const v= <Opts>{bar: 'moo'};


