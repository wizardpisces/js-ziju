// import { parse } from 'acorn'
import { CodeGen } from './src/CodeGen'
// type integer = 1 | 2;

// let a: integer = 1;

// console.log(a)

// console.log(parse("1 + 1", { ecmaVersion: 2020 }));

console.log(new CodeGen('console.log(1);').toCode());