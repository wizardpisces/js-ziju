import {
    Interpreter
} from '../index'
import fs from 'fs'
import path from 'path'

function readSource(src) {
    return fs.readFileSync(path.join(process.cwd(), src), 'utf8')
}

describe('interpret', () => {
    // test('print', () => {
    //     new Interpreter(readSource('tests/print.js')).interpret()
    // });
    test('function call', () => {
        let result = new Interpreter(readSource('tests/functionCall.js')).interpret()

        console.log('result', result)
    });

    // it('fib', () => {
    //     new Interpreter(readSource('tests/fib.js')).interpret()
    // });
});
