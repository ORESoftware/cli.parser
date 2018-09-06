

console.log(process.argv.slice(2));

// console.log(typeof JSON.parse(process.env.foo));


// console.log(/[A-Za-z0-9]+$/.test('zoom%Bar'));

console.log(/^[A-Za-z0-9-_:@]+$/.test('zoom--Bar'));
