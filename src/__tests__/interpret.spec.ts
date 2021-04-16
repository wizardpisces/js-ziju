import {
    Interpreter
} from '../index'
import {readSource} from './utils'

describe('interpret', () => {
    
    test('print', () => {
        new Interpreter(readSource('tests/print.js')).interpret()
    });

    test('functionCall', () => {
        new Interpreter(readSource('tests/functionCall.js')).interpret()
    });

    it('fib', () => {
        new Interpreter(readSource('tests/fib.js')).interpret()
    });

    it('twoFunctionCall', () => {
        new Interpreter(readSource('tests/twoFunctionCall.js')).interpret()
    });

    it('fib-non-recursive', () => {
        new Interpreter(readSource('tests/fib-non-recursive.js')).interpret()
    });
});
