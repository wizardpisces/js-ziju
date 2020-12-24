import ESTree from 'estree'
import { parse } from 'acorn'
import { Program } from './tree.ts/Program'

export class Interpreter {
    ast: any
    constructor(code: string) {
        this.ast = parse(code, { ecmaVersion: 2020 });
    }
    interpret() {
        return new Program(this.ast as ESTree.Program).evaluate()
    }
    // accept(visitor: Visitor) {
    //     visitor.visit()
    // }
    // visit() {

    // }
}