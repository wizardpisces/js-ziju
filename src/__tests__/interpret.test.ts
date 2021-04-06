import {
    Interpreter
} from '../index'
import fs from 'fs'
import path from 'path'

function readSource(src){
    return fs.readFileSync(path.join(process.cwd(),src),'utf8')
}

describe('interpret', () => {
    it('fib', () => {
        new Interpreter(readSource('tests/fib.js')).interpret()
    });
});
