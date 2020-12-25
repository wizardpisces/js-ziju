import ESTree from 'estree'
import { parse } from 'acorn'
import { Program } from './tree/Program'
import { createContext } from './tree/context';

export class Interpreter {
    ast: any
    constructor(code: string) {
        this.ast = parse(code, { ecmaVersion: 2020 });
    }
    interpret() {
        new Program(this.ast as ESTree.Program).evaluate(createContext())
    }
    // accept(visitor: Visitor) {
    //     visitor.visit()
    // }
    // visit() {

    // }
}