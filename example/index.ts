import {
    Interpreter
} from '../src'

import { fibonacci } from './fibonacci'

const code = `
${fibonacci.toString()}
fibonacci(5);
`

new Interpreter(code).interpret()